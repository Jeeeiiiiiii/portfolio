---
title: "Running LLMs on Kubernetes with KServe: what changes from normal model serving"
date: 2026-11-11
excerpt: Serving a large language model isn't like serving a fraud model. These are my study notes on why - GPU memory, the KV cache, two phases per request - and how KServe's LLMInferenceService, vLLM and llm-d handle it on Kubernetes.
tags: [Kubernetes, LLMOps, KServe, vLLM]
source: https://developers.redhat.com/articles/2026/04/21/kserve-llm-d-optimized-gen-ai-inference
kind: notes
---

*What you'll get: why LLM serving needs different infrastructure, what each piece in the current open-source stack does, and how I'd start.*

As with my [GPU notes](/blog/gpus-on-kubernetes), I haven't run this on GPUs yet. These are notes from the KServe, llm-d and Kubernetes documentation and from Red Hat's write-up on KServe with llm-d (credited at the end), organised the way I'd explain it to a teammate. Versions are as of November 2026.

## The problem, in plain words

My [fraud model](/blog/fraud-model-training-serving-skew) answers in a few milliseconds, uses a little CPU, and every request costs about the same. A large language model is different in almost every way:

- It needs one or more GPUs just to load.
- A request can take seconds, and the answer is streamed word by word.
- One request asks for 10 words, the next for 2,000, so the cost per request varies hugely.
- Two requests that start with the same long instructions can share work, if they land on the same server.

A normal load balancer that sends each request to the next server in line wastes a lot of very expensive GPU time. The newer tools exist to fix that.

## Why this is different

If you know Kubernetes Deployments, Services and autoscaling, you have most of the base. The new ideas:

- **Two phases per request.** **Prefill** reads the whole prompt at once and is compute-heavy. **Decode** writes the answer one token (a word or part of a word) at a time and is limited by memory speed. They stress the GPU differently.
- **The KV cache.** While answering, the model keeps a working memory of the conversation in GPU memory, called the KV cache. If a new request starts with the same text, a server that still has it cached can skip that part of prefill.
- **Smart routing beats round-robin.** Sending a request to the server that already has its prefix cached, or the one with the shortest queue, cuts the time to the first word.
- **CPU is the wrong scaling signal.** Queue length and GPU cache usage say much more.

## The pieces, and what each one does

| Piece | What it does | Analogy |
|---|---|---|
| **vLLM** | The engine that runs the model on the GPU, with efficient KV cache management | The kitchen |
| **KServe** | Kubernetes resources for deploying models, so you write one YAML instead of many | The restaurant manager |
| **llm-d** | Routing and scheduling for LLM servers: cache-aware routing, splitting prefill and decode | The host who seats you at the right table |
| **Gateway API Inference Extension** | Teaches the Kubernetes Gateway API about model servers (InferencePool, an endpoint picker) | The front door that knows the floor plan |

How they fit, according to the KServe 0.17 release notes from March 2026: KServe's **LLMInferenceService** is built on llm-d. One resource creates the vLLM deployment, the Service, the Gateway and route, the InferencePool and the endpoint picker. llm-d joined the CNCF sandbox in March 2026. KServe is a CNCF incubating project.

## How a request flows

```diagram
llm-serving-kserve
A client calls a Gateway API gateway, which asks the llm-d endpoint picker to choose a vLLM pod, scoring each by whether the prompt prefix is already cached and by queue length. In the chosen pod, prefill reads the prompt and passes the KV cache to decode, which streams tokens back to the client. Prefill and decode can also run in separate pods.
```

1. **The request arrives at a Gateway**, the Kubernetes standard for traffic coming into a cluster.
2. **The endpoint picker scores every model server.** Does it already hold this prompt's prefix in its KV cache? How long is its queue?
3. **The best-scoring vLLM pod runs the request:** prefill on the prompt, then decode, streaming tokens back.
4. **At larger scale, prefill and decode can run on separate pods,** each scaled for its own job, with the KV cache passed between them over a fast network.

## Why the symptoms look healthy

Red Hat's April 2026 write-up on KServe and llm-d describes what a first LLM deployment on Kubernetes typically looks like. Everything is green, and yet:

- **Tail latency is unpredictable.** Most users get a fast first word; some wait far longer, with no obvious cause.
- **GPUs look busy but aren't productive.** Utilisation is high, throughput isn't.
- **Cached work isn't reused.** Requests sharing the same long system prompt land on different pods, so each pod recomputes it.

The cause is that the round-robin load balancer, prefill and decode, and autoscaling all treat LLM requests like web requests. Their framing of the fix is a split into layers, each with one job:

| Layer | Its one job |
|---|---|
| Kubernetes | Run the pods and hand out GPUs |
| KServe | The model's lifecycle: deploy, version, canary, scale, expose an OpenAI-compatible API |
| vLLM | Run the model efficiently *inside* one pod: batching, KV cache management |
| llm-d | Decide *which* pod gets each request, across all of them |

Keeping them separate means you can swap the runtime or the scheduler without rebuilding the rest. The same idea as keeping your ingress separate from your app.

The numbers they cite come from the llm-d project's own benchmarks, comparing round-robin with cache-aware routing on the same model: roughly double the token throughput, and up to about 57x faster time to first token at the 90th percentile. I'd treat those as "what's possible on a workload with lots of shared prompts", not as what any deployment will get. The useful takeaway is the reason: the model didn't change, only where requests were sent.

## A minimal example

This is the shape of the example in the KServe 0.17 release notes:

```yaml
apiVersion: serving.kserve.io/v1alpha2
kind: LLMInferenceService
metadata:
  name: llama3-serving
spec:
  model:
    uri: hf://meta-llama/Llama-3.1-8B-Instruct
    name: meta-llama--Llama-3.1-8B-Instruct
  replicas: 3
  template:
    spec:
      containers:
        - name: vllm
          resources:
            limits:
              nvidia.com/gpu: "1"
  router:
    gateway:
      managed: {}
    route:
      httpRoute: {}
    scheduler:
      pool: {}
```

`model.uri` says where the weights come from. `replicas: 3` gives three vLLM pods with one GPU each. The `router` block asks KServe to create the gateway, the route and the cache-aware scheduler. The API is still `v1alpha2`, so expect changes between versions.

For a classic single model that doesn't need any of that, KServe's older `InferenceService` with the Hugging Face runtime, which uses vLLM underneath, is simpler.

## Where people get caught out

From the documentation and others' write-ups, the things I'd test first:

- **Loading time.** An 8-billion-parameter model is about 16 GB of weights. Downloading them on every pod start is slow; caching them on the node, which KServe supports, matters.
- **GPU memory planning.** Weights plus KV cache must fit. More concurrent users means more KV cache, so the batch size and context length you allow decide how many users one GPU serves.
- **Upgrades.** KServe moves fast, and some upgrades need the documented upgrade guide, not a plain `helm upgrade`.
- **Cost of idle replicas.** An idle LLM replica still holds a whole GPU. Scaling on queue length, and to zero where latency allows, is the main cost lever.

## What I'd measure

When I run this, the numbers that matter:

- **Time to first token,** with and without cache-aware routing, on prompts that share a long prefix.
- **Tokens per second per GPU** at a fixed latency target.
- **Cold start:** time from zero replicas to the first answer.
- **Cost per million tokens,** self-hosted versus an API like Claude, at my actual traffic.

That last one decides whether self-hosting makes sense at all. For a small team with modest traffic, an API is often cheaper. Self-hosting starts to pay with steady high volume, strict data rules, or a small model that's good enough.

## From study to a real environment

| First step | Production |
|---|---|
| One small model, one GPU, plain InferenceService | LLMInferenceService with several replicas and cache-aware routing |
| Weights pulled from Hugging Face on start | Weights cached in S3 or on the node |
| No auth | A gateway with per-team keys and token budgets |
| Manual scaling | Autoscaling on queue length |

## FAQ

**Why not just call an API?** Often you should. Self-host for cost at high volume, data that can't leave your network, or control over the model version.

**Do I need llm-d for one model on one GPU?** No. It earns its place with several replicas and shared prompts.

**Is Seldon Core an option?** It moved to a source-available licence in January 2024, so production use needs a paid licence. KServe is the open-source default.

## Why this matters

GPU time is the cost of an LLM service. Routing that reuses cached work and scaling on the right signal can serve the same users with fewer GPUs, which is the whole budget conversation.

## Links

- [KServe 0.17: LLMInferenceService](https://kserve.github.io/website/blog/kserve-0.17-release)
- [KServe and llm-d together (Red Hat Developer)](https://developers.redhat.com/articles/2026/04/21/kserve-llm-d-optimized-gen-ai-inference)
- [llm-d joins the CNCF](https://www.cncf.io/blog/2026/03/24/welcome-llm-d)
- Previous: [GPUs on Kubernetes](/blog/gpus-on-kubernetes)
