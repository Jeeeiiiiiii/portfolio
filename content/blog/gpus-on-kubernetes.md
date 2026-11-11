---
title: "GPUs on Kubernetes: what a DevOps engineer needs to know first"
date: 2026-11-11
excerpt: Kubernetes doesn't understand GPUs out of the box. These are my study notes on how a GPU node actually gets used - the NVIDIA GPU Operator, whole-GPU requests, sharing a GPU with time-slicing or MIG, the newer DRA API, and what to watch so expensive hardware isn't sitting idle.
tags: [Kubernetes, GPU, LLMOps, NVIDIA]
---

*What you'll get: how a GPU goes from "plugged into a server" to "used by a pod", the ways to share one, and the questions I'd ask before running AI workloads on Kubernetes.*

A note before I start: I don't have a GPU cluster. These are study notes from NVIDIA's and Kubernetes' documentation, written the way I'd explain them to a teammate, with the parts I'd test first. When I run them on real GPUs, I'll write up what actually happened.

## The problem, in plain words

AI models, and especially large language models (LLMs), run on GPUs. A single data-centre GPU can cost as much as a car, and cloud GPU instances can cost more per hour than a whole cluster of normal servers. So two things matter more than anywhere else in infrastructure:

1. **The workload has to actually get the GPU,** with the right drivers, on the right node.
2. **The GPU shouldn't sit idle.** A GPU running at 10% is money burning.

Kubernetes is good at sharing CPU and memory. Out of the box, it knows nothing about GPUs. Everything below is how that gap is filled.

## Why this is different from CPU and memory

If you've set CPU and memory requests, you already know the idea. The differences:

- **GPUs are whole numbers.** You can ask for `cpu: 250m`, a quarter of a CPU. You can't ask for a quarter of a GPU in the same way; the classic request is 1, 2 or 8.
- **The node needs special software.** A driver on the host, a container runtime hook so containers can see the GPU, and something to tell Kubernetes the GPU exists.
- **Not all GPUs are equal.** A model that needs 40 GB of GPU memory won't fit on a 16 GB card. Scheduling has to know which GPU a node has.
- **Sharing is a trade-off.** Two pods on one GPU save money but can slow each other down, or, with some methods, crash each other.

## How a GPU gets to a pod

```text
GPU node
 ├─ NVIDIA driver            (talks to the hardware)
 ├─ container toolkit        (lets containers see the GPU)
 ├─ device plugin            ─▶ tells the kubelet: "this node has nvidia.com/gpu: 4"
 ├─ GPU feature discovery    ─▶ labels the node: GPU model, memory, MIG support
 └─ DCGM exporter            ─▶ GPU metrics for Prometheus

scheduler: pod asks for nvidia.com/gpu: 1 ─▶ only nodes with a free GPU qualify
```

1. **The driver and container toolkit** make the GPU usable from inside a container.
2. **The device plugin** advertises the GPUs to Kubernetes as a resource called `nvidia.com/gpu`.
3. **GPU feature discovery** labels each node with details like the GPU model, so you can say "only H100s".
4. **A pod requests a GPU** in its resource limits, and the scheduler places it only where one is free.
5. **The DCGM exporter** publishes GPU usage, memory and temperature for Prometheus.

The **NVIDIA GPU Operator** installs and manages all five with one Helm chart, which is why most clusters use it rather than setting up each piece by hand.

## The basic request

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: inference
spec:
  nodeSelector:
    nvidia.com/gpu.product: NVIDIA-A100-SXM4-80GB   # label from feature discovery
  tolerations:
    - key: nvidia.com/gpu
      operator: Exists
      effect: NoSchedule
  containers:
    - name: model
      image: my-model:1.0
      resources:
        limits:
          nvidia.com/gpu: 1
```

The **taint and toleration** pair keeps ordinary pods off expensive GPU nodes: GPU nodes are tainted, and only pods that tolerate the taint can land there. Without it, a logging agent or a web app can take the space a GPU job needs.

## Sharing one GPU: three ways

Many workloads don't need a whole GPU: a small model, a notebook, a test job. There are three ways to share, and they're not interchangeable.

| Method | How it works | Isolation | Good for |
|---|---|---|---|
| **Time-slicing** | The GPU is advertised as, say, 4 GPUs, and pods take turns | None: no memory limits, one pod can crash or starve the others | Dev, CI, trusted bursty work |
| **MPS** | Processes share the GPU at the same time | Partial | Many small inference processes |
| **MIG** | Supported GPUs (A100, H100 and newer) are split in hardware into up to 7 slices, each with its own memory | Strong | Several teams or models on one GPU |

Time-slicing is one ConfigMap in the GPU Operator:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: time-slicing-config
  namespace: gpu-operator
data:
  any: |-
    version: v1
    sharing:
      timeSlicing:
        resources:
          - name: nvidia.com/gpu
            replicas: 4
```

Each physical GPU now shows up as 4. The catch NVIDIA's docs are clear about: there's no memory or fault isolation between those 4, and GPU metrics can no longer be tied to a single container.

MIG gives real isolation, but the slices are fixed: changing the layout means draining the workloads from that GPU first.

## The newer way: Dynamic Resource Allocation

The device plugin can only say "this node has 4 GPUs". It can't express "I need a GPU with at least 40 GB of memory" or "give these two containers the same GPU". **Dynamic Resource Allocation (DRA)** fixes that. It became generally available in Kubernetes 1.34, in August 2025.

With DRA, a workload makes a **claim** describing what it needs, and a driver from the hardware vendor finds a device that matches:

```yaml
apiVersion: resource.k8s.io/v1
kind: ResourceClaimTemplate
metadata:
  name: one-gpu
spec:
  spec:
    devices:
      requests:
        - name: gpu
          exactly:
            deviceClassName: gpu.nvidia.com
```

The pod then refers to the claim instead of a count. NVIDIA ships DRA support as a separate driver, and its GPU-sharing features through DRA are newer than the core API, so I'd check their status for the exact versions in use before relying on them.

## Scheduling many GPU jobs

The default scheduler places pods one at a time. Training jobs often need, say, 8 GPUs *at once*; getting 6 and waiting for 2 just wastes the 6. That's **gang scheduling**: all or nothing. Queueing systems like Kueue, and NVIDIA's open-source KAI Scheduler, add it, along with queues and fair sharing between teams.

## Where people get caught out

I haven't hit these myself yet. They're the ones the documentation and other engineers warn about most, and the first things I'd test:

- **Driver and CUDA version mismatches.** The container's CUDA version needs a host driver that supports it.
- **Huge images and slow starts.** AI images are often 10 GB or more, and model weights can be far larger. Pulling them on every new node adds minutes; caching them on the node matters.
- **Idle GPUs.** A pod can hold a GPU and do nothing. Watch GPU utilisation from the DCGM exporter, not just "is the pod running".
- **Autoscaling on the wrong signal.** CPU usage says little about a GPU workload. For inference, queue length or GPU utilisation is the better trigger.

## From study to a real environment

| Lab first step | On AWS |
|---|---|
| A single GPU node, GPU Operator via Helm | EKS with GPU instances; the accelerated AMI already includes the driver |
| Manual node | Karpenter launching GPU nodes only when a pod needs one |
| Time-slicing for dev | MIG for shared production inference |
| Prometheus + DCGM exporter | Same, plus cost per team |

## FAQ

**Do I need the GPU Operator?** Not strictly, but installing and upgrading drivers, toolkit and plugin by hand on every node is exactly the work it removes.

**Time-slicing or MIG?** Time-slicing for trusted, non-critical work. MIG when different teams or production models share a GPU and must not affect each other.

**Is DRA ready?** The core API is GA. The vendor features built on it are moving fast, so check the driver's release notes.

## Why this matters

GPUs are often the biggest line on an AI team's cloud bill. Getting scheduling and sharing right is the difference between buying more GPUs and using the ones you have.

## Links

- [NVIDIA GPU Operator documentation](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html)
- [Kubernetes v1.34: DRA has graduated to GA](https://kubernetes.io/blog/2025/09/01/kubernetes-v1-34-dra-updates/)
- [GPU sharing: MIG vs MPS vs time-slicing](https://scaleops.com/blog/kubernetes-gpu-sharing/)
- Next: [Running LLMs on Kubernetes with KServe](/blog/llms-on-kubernetes-kserve)
