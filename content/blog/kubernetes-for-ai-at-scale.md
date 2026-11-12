---
title: "Running AI training on Kubernetes: what OpenAI learned in 2021, and what changed by 2026"
date: 2026-11-11
excerpt: In 2021 OpenAI wrote about training GPT-3 on a 7,500-node Kubernetes cluster. Five years later, clusters reach 100,000 nodes. My notes on which lessons still hold, which problems now have standard tools, and what matters for a team with 50 GPU nodes, not 50,000.
tags: [Kubernetes, GPU, AI Infrastructure, Scaling]
source: https://openai.com/index/scaling-kubernetes-to-7500-nodes/
kind: notes
---

*What you'll get: the problems you hit when Kubernetes runs AI training instead of web apps, how OpenAI handled them in 2021, and the tools that replace their workarounds in 2026.*

A note on where this comes from: I've never run a cluster anywhere near this size. This is my reading of OpenAI's 2021 post and AWS's 2025 write-up on 100,000-node EKS clusters, both credited at the end, plus what I know from running smaller clusters.

## The problem, in plain words

Kubernetes was built for web services: many small, identical copies of an app, each using a slice of a server, any of which can die and be replaced. AI training is the opposite:

- **One job uses many whole servers,** each with 8 GPUs, for days or weeks.
- **All parts must start together.** A training job that gets 60 of its 64 servers just sits there, holding 60 servers' worth of expensive GPUs and doing nothing.
- **One bad GPU slows everyone.** Training steps wait for the slowest machine, so a single faulty GPU can stall the whole job.

In 2021, OpenAI ran research including GPT-3, CLIP and DALL·E on a single Kubernetes cluster of 7,500 nodes. Their post is about what broke as they grew, and it's still one of the clearest real stories about Kubernetes for AI.

## Why this is different

If you run Kubernetes for web apps, most of the tools are the same. What's different is what goes wrong:

- **The control plane gets crushed.** Thousands of nodes means thousands of things watching the API server.
- **Networking becomes the bottleneck.** Training machines constantly exchange large amounts of data.
- **Scheduling has to be "all or nothing".** The default scheduler places pods one at a time.
- **Capacity is scarce and shared.** GPUs can't be bought instantly, and several research teams want them at once.

## What OpenAI hit, and what each problem looks like in 2026

| Problem | OpenAI's 2021 approach | The 2026 standard |
|---|---|---|
| Pod networking too slow | Replaced the Flannel overlay network with native cloud networking | Native VPC networking by default on managed Kubernetes; EFA or InfiniBand between GPU nodes for training |
| API server memory | Up to 70 GB of memory per API server at 7,500 nodes; careful tuning | Managed control planes, consistent reads from cache, streaming lists; EKS supports 100,000 nodes |
| All-or-nothing scheduling | A gang scheduling plugin | Kueue with JobSet, LeaderWorkerSet, or NVIDIA's KAI Scheduler |
| Bad GPUs | Their own passive and active GPU health checks | NVIDIA's GPU Operator with DCGM health metrics; managed node health monitoring and auto-repair |
| Sharing between teams | Team taints, so each team's pods land on its own nodes | Kueue queues and quotas, with borrowing between teams |
| Keeping capacity warm | "Balloon" pods: low-priority placeholders that hold nodes and get evicted when real work arrives | Reserved capacity (EC2 Capacity Blocks, Karpenter static capacity) |
| Monitoring at scale | Prometheus and Grafana, fighting metric volume | Same tools, plus DCGM GPU metrics and longer-term metric stores |

The pattern: in 2021 OpenAI had to build workarounds. In 2026 most of those problems have a named, open-source tool.

## How a training job flows today

```diagram
ai-training-at-scale
A researcher submits a training job for 64 nodes with 8 GPUs each. Kueue checks the team's quota and whether 64 nodes are free; if not, the job waits in the team's queue with nothing half-started. When there is room, all 64 pods are admitted together (gang scheduling), only onto nodes with healthy GPUs according to DCGM checks, and training exchanges data between GPUs over EFA or InfiniBand.
```

1. **A job asks for all its resources at once.**
2. **Kueue holds it in a queue** until the team has quota *and* all the pieces fit. This replaces both OpenAI's team taints and their gang scheduling plugin.
3. **All pods start together,** or none do.
4. **Only healthy nodes are used.** The GPU Operator's health metrics feed a check that takes bad nodes out of rotation.
5. **When something fails anyway,** the job restarts from a checkpoint instead of starting over. At thousands of GPUs, something always fails.

## What AWS changed to reach 100,000 nodes

AWS's 2025 write-up on EKS ultra-scale clusters shows how far the ceiling moved. A single cluster can now hold up to 100,000 nodes, which they put at up to 800,000 NVIDIA GPUs. To get there, they:

- **Rebuilt etcd's storage,** the database behind Kubernetes: its consensus moved to an internal AWS service, its data moved into memory, and busy resource types were split into separate partitions.
- **Used newer Kubernetes features** like serving reads from cache (about 30% less API server CPU and list calls about 3x faster in their tests) and streaming large lists instead of building them in memory.
- **Tuned the scheduler** to a sustained 500 pods per second.
- **Added static capacity to Karpenter,** so a minimum set of nodes is ready before batch jobs arrive. That's OpenAI's balloon idea, built in.

Google showed a 130,000-node GKE cluster in late 2025 as a benchmark; its documented production limit is 65,000.

## What this means for a normal team

Almost nobody needs 100,000 nodes, and AWS says so: for general workloads they still recommend several smaller clusters. But the lessons apply at 50 GPU nodes too:

- **Taint GPU nodes** so ordinary pods can't take them.
- **Use a queue with quotas** (Kueue) instead of first come, first served. It's the difference between teams sharing GPUs and teams fighting over them.
- **Schedule multi-node jobs all-or-nothing.** Half-started jobs waste the most expensive resource you have.
- **Watch GPU health, not just pod health.** A pod can be Running on a GPU that's failing.
- **Checkpoint long jobs.** Assume something will fail.
- **Avoid huge LIST calls** in your own controllers and scripts. That was a lesson at OpenAI's scale and still is at AWS's.

## FAQ

**Is OpenAI's 2021 post still worth reading?** Yes, for the problems. The solutions have mostly been replaced by standard tools.

**Kubernetes or Slurm for training?** Research labs and HPC centres still use Slurm a lot. Kubernetes wins when training and serving share a platform. Many places run both.

**Do I need Kueue for a small cluster?** Once two teams share GPUs, yes. It's simpler than building quotas yourself.

**One giant cluster or several smaller ones?** Several, unless one huge training job needs to span them all.

## Why this matters

GPUs are the most expensive thing in an AI platform, and the easiest to waste: a half-started job, a broken GPU slowing everyone, a team waiting while another team's reserved nodes sit idle. The scheduling and health tools above exist to turn GPU spend into finished training runs.

## Links

- [OpenAI: Scaling Kubernetes to 7,500 nodes (2021)](https://openai.com/index/scaling-kubernetes-to-7500-nodes/), the post this builds on
- [AWS: Under the hood of Amazon EKS ultra-scale clusters (2025)](https://aws.amazon.com/blogs/containers/under-the-hood-amazon-eks-ultra-scale-clusters/)
- [InfoQ: GKE's 130,000-node cluster](https://www.infoq.com/news/2025/12/gke-130000-node-cluster)
- [Kueue](https://kueue.sigs.k8s.io/)
- [My notes on GPUs on Kubernetes](/blog/gpus-on-kubernetes)
