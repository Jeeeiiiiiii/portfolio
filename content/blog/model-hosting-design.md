---
title: "From trained model to live endpoint in one pull request — the plan"
date: 2026-11-11
excerpt: Data scientists can train a model in a day, then wait weeks for infrastructure. This is the design for my Model Hosting Platform, one supported path where a team adds one file and gets an endpoint with gradual rollout, automatic rollback, scale-to-zero and cost per team.
tags: [MLOps, Platform Engineering, KServe, Design]
kind: design
---

*What you'll get: why teams need one supported way to host models, the design I'm building, and what I'll measure. This is a plan for a project I'm building now. Nothing here is built yet; a follow-up post will show what happened.*

## The problem, in plain words

A data scientist trains a model that works. Now it needs to answer requests from an app. That means a container, somewhere to run it, a URL, monitoring, a way to roll it back, and someone's approval. Each of those is a ticket to a different team, and each team does it slightly differently.

So a model that took a day to train takes weeks to go live, and when it breaks at 3 a.m., nobody has seen that exact setup before.

Platform teams fix this with a **paved road**: one supported way to do something, where the platform team solves the hard parts once and every model team uses them. This post is the design for mine.

## Why this is different from hosting a normal app

If you've hosted web services on Kubernetes, you already know 80% of this. The rest:

- **Models are big and slow to start.** Loading a model can take far longer than starting a web server. That affects autoscaling and especially scaling up from zero.
- **Many models get little traffic.** A company may have dozens of models that are idle most of the day. Paying for them to sit idle adds up, so they should scale to zero.
- **A new model can be correct and still too slow.** A canary, where a small share of traffic tries the new version first, has to watch latency, not just errors.
- **LLM calls cost money per word.** Teams calling Claude or another LLM need keys, budgets and a fallback, or one runaway script eats the month's budget.

## The design

```diagram
model-hosting
A team adds one file, serving/credit-model.yaml. CI checks it against a schema, a shared Helm chart renders a KServe endpoint, and Argo CD deploys it with 10% of traffic on the new version. If latency or errors pass the target, it rolls back on its own. Idle endpoints scale to zero with Knative, and OpenCost shows cost per team. Separately, apps call LLMs through a gateway that holds per-team keys, token budgets and usage metrics, and falls back from the Claude API to a small local model.
```

1. **A team adds one file:** which model (an MLflow alias), how much CPU and memory, the latency target, the owner, and minimum and maximum replicas.
2. **CI checks it against a schema,** so a typo fails in the pull request, not in the cluster.
3. **A shared Helm chart turns it into a KServe endpoint.** Every team gets the same probes, metrics and security settings without writing them.
4. **Argo CD deploys it from Git,** sending 10% of traffic to the new version first. If latency or errors break the target, it rolls back on its own.
5. **Idle models scale to zero,** and a cost view shows CPU and memory hours per team.
6. **For LLMs, apps call a gateway** instead of the providers directly. It holds the keys, enforces a token budget per team, and falls back to another model when a provider fails.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| Serve models on Kubernetes | KServe | Open source, CNCF project, standard model API | Seldon Core: source-available licence since January 2024 |
| Scale to zero | Knative (through KServe) | Built in | Custom scaling scripts |
| Traffic into the cluster | Gateway API | The current standard | ingress-nginx: retired March 2026 |
| Deploy from Git | Argo CD + Helm | One chart, many teams | A pipeline that runs `kubectl` |
| Cloud resources per team | Terraform modules | Cluster, model namespace (own IAM role, bucket, quotas), observability | Copy-pasted Terraform per team |
| Cost per team | OpenCost | Open source, works on any cluster | Cloud bill only: no per-team view |
| LLM gateway | LiteLLM proxy or Envoy AI Gateway | Keys, budgets, fallback already built | Writing my own proxy |
| Load testing | k6 | Scriptable, easy to read | — |

The Terraform runs against a local AWS emulator first, then once on real EKS with the cost published, then destroyed.

## Two models, as if from two teams

The credit and fraud models from my [Model Sign-off project](/blog/model-signoff-design) are served through it. Two teams, one chart. If the second team needs anything the first didn't, the platform is missing something.

## The failure I'll cause on purpose

A new model version that's correct but slow. The canary should see p95 latency break the target, roll back without a person, and send an alert with a timeline. That's the scenario this design exists for.

## What I'll measure

No numbers yet. The follow-up post will report:

- **Time from merging the pull request to a live endpoint.**
- **Cold start:** how long the first request waits after scale-to-zero.
- **p95 latency under a k6 load test.**
- **Cost per team per day,** and what the real EKS run cost.
- **Gateway overhead:** milliseconds added per LLM request.

## FAQ

**Why not let each team deploy however they like?** They can, but then every outage is new. The paved road is optional and easier, which is why teams use it.

**Doesn't scale-to-zero make the first request slow?** Yes. That's why cold start is on the list to measure, and why `minReplicas` is a setting: a payment-path model stays warm, a nightly report model doesn't.

**Why a gateway for LLMs?** One place to hold API keys, set budgets and switch providers, instead of every app doing it differently.

## Why this matters

When putting a model online is one reviewed file instead of five tickets, teams ship models in days, and the platform team fixes problems once for everyone.

## Links

- [KServe](https://kserve.github.io/website/)
- [Gateway API](https://gateway-api.sigs.k8s.io/)
- [ingress-nginx retirement](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)
- [The project page](/projects/model-hosting)
