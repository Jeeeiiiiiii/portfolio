---
title: "From trained model to live endpoint in 26 seconds, with one file"
date: 2026-11-13
excerpt: I built a Model Hosting Platform where a team adds one file and gets a model endpoint, with gradual rollout that rolls a slow version back on its own, scale-to-zero outside office hours, cost per team, and an LLM gateway with per-team budgets. What I measured on kind, and what broke.
tags: [MLOps, Platform Engineering, KServe, Gateway API]
kind: build
---

*What you'll get: why teams need one supported way to host models, the platform I built, the slow release it caught and rolled back by itself, and what it measured on a laptop cluster.*

## The problem, in plain words

A data scientist trains a model that works. Now it needs to answer requests from an app. That means a container, somewhere to run it, a URL, monitoring, a way to roll it back, and someone's approval. Each of those is a ticket to a different team, and each team does it slightly differently.

So a model that took a day to train takes weeks to go live, and when it breaks at 3 a.m., nobody has seen that exact setup before.

Platform teams fix this with a **paved road**: one supported way to do something, where the platform team solves the hard parts once and every model team uses them. I built one. A team adds one file; 26 seconds after the commit, the model answers.

## Why this is different from hosting a normal app

If you've hosted web services on Kubernetes, you already know 80% of this. The rest:

- **Only approved models may run.** At a bank, the version that serves has to be the version a risk reviewer signed off, which my [Model Sign-off project](/blog/model-signoff-design) decides.
- **A new version can be correct and still too slow.** A canary, where a small share of traffic tries the new version first, has to watch latency, not just errors.
- **Many models are idle most of the day.** Paying for them around the clock adds up, so they should be able to sleep.
- **LLM calls cost money per word.** Teams calling an LLM need keys, budgets and a fallback, or one runaway script eats the month's budget.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| Serve models | KServe, Standard mode | Plain Deployments and autoscaling, nothing extra to run | Serverless mode: needs Knative; Seldon Core: paid licence since 2024 |
| Traffic into the cluster | Gateway API on Envoy Gateway | The current standard | ingress-nginx: retired March 2026 |
| Deploy from Git | Argo CD ApplicationSet + one Helm chart | One app per file, no per-model Argo config | An Application per model, by hand |
| Gradual rollout | A small "release guard" I wrote | Works with KServe Standard mode | Argo Rollouts, Flagger: fight KServe over the Deployment |
| Sleep outside office hours | KEDA cron trigger | Predictable; no request waits on a cold start | Scale-from-zero on request: Knative only |
| Cost per team | OpenCost | Open source, groups cost by a label | The cloud bill: no per-team view |
| LLM gateway | Agent Router on the same Envoy Gateway | Keys, budgets and fallback in one Envoy | LiteLLM proxy: another service to run |

## The paved road

```diagram
model-hosting
A team opens a pull request adding serving/credit-default.yaml. CI checks it against a JSON schema and asks MLflow whether that version exists and passed Model Sign-off's gate. On merge, an Argo CD ApplicationSet creates one application per serving file and renders a shared Helm chart. KServe in Standard mode creates a Deployment, an autoscaler at 70 percent CPU and an HTTPRoute on the shared Envoy Gateway. The model server loads exactly the pinned version from MLflow, refuses one that didn't pass the gate, and exposes latency metrics.
```

1. **A team adds one file** naming the model, the exact version, the owner, a latency target, replica bounds and resources.
2. **CI checks it** against a JSON schema and asks the model registry: does this version exist, and did it pass Model Sign-off's gate?
3. **Argo CD turns every serving file into an application** that renders one shared chart. Adding a file adds an endpoint; deleting it removes the endpoint.
4. **KServe creates the Deployment, the autoscaler and the route** on the shared Gateway. Every endpoint gets the same probes, security settings, team labels and latency metrics, because the platform writes them, not the team.
5. **The model server loads exactly the version pinned in Git.** It never follows an alias like `@champion` by itself, so what runs is always what was reviewed, and a rollback is a revert.

This is the whole file a team writes:

```yaml
model: credit-default    # MLflow registered model name
version: 2               # must have passed Model Sign-off's gate
team: credit-risk
owner: credit-risk-team
latency_p95_ms: 100      # the target the platform holds this endpoint to
replicas: {min: 1, max: 3}
resources: {cpu: 250m, memory: 768Mi}
# canary: {version: 3}   # optional: release v3 gradually next to v2
```

## Gradual release with automatic rollback

```diagram
hosting-canary
Adding a canary version to the serving file makes the chart render a second endpoint and a release config. The release guard, a small controller, owns the model's route and splits traffic between stable and canary. It waits until a canary pod is ready, then moves through 10, 50 and 100 percent, 30 seconds per step. At each step it reads only that step's requests from the canary pods' metrics. If the error rate is over 1 percent or p95 latency is over the file's target, it sets the canary to 0 percent and records a Warning event. Too few requests means keep watching; otherwise it moves to the next step and finally marks the canary promoted.
```

KServe's own canary needs its serverless mode, and Argo Rollouts or Flagger would fight KServe over the Deployment it already manages. So I moved traffic one level up, at the route. The guard is about 200 lines and does one thing: decide *how much* traffic the canary gets. Git still decides *what* is released.

The decision for each step is a small pure function:

```python
if n and window.errors / n > policy.max_error_rate:
    return Verdict("rollback", ...)
if n < policy.min_requests:          # 20: don't judge a step on too few requests
    return Verdict("wait", ...)
if p95_ms > policy.latency_p95_ms:
    return Verdict("rollback", ...)
return Verdict("promote" if last else "advance", ...)
```

## Idle hours, cost and the LLM gateway

A serving file can add a schedule, like weekdays 08:00–20:00. Outside it the endpoint scales to zero; inside it, it comes back. OpenCost prices every pod's CPU and memory and groups the cost by the team label the chart sets.

```diagram
hosting-llm-gateway
A team's app sends a request with its API key to the LLM gateway, Envoy with Agent Router. The gateway maps the key to a team and sets the team header itself, never trusting the client's. It charges each team's hourly token budget in Redis from the usage the provider reports. Requests for the model "assistant" go to the hosted provider, and if it fails, to a small local model on Ollama.
```

Teams get one OpenAI-compatible endpoint. The gateway knows the team from its key, keeps an hourly token budget per team, and falls back to a local model when the hosted provider fails.

## What broke, and how I recovered

**"Live 1 second after the commit."** My first measurement was wrong: the old endpoint hadn't finished being removed, so the old pod answered. The test now waits until the application, endpoint and pods are gone, and checks that as its own step.

**193 seconds from commit to live.** Argo CD's ApplicationSet only looks for new files every 3 minutes by default, separately from the 20-second app refresh. Setting it to 20 seconds brought it to 26.

**A canary would have taken traffic before it was ready.** The first guard sent 10% of traffic as soon as the canary appeared in Git, before its pod had loaded the model. It now waits for a ready pod, and the test checks that no request fails.

**The first cost report was about 40 times too high.** OpenCost's chart priced CPU at $1.25 a core-hour by default. Explicit prices fixed it, and then everything landed under `__unallocated__` because kube-state-metrics doesn't export pod labels unless they're allowlisted.

**Token budgets silently didn't apply.** The budget policy was on the Gateway and the fallback policy on the route. A route-level policy replaces a gateway-level one instead of merging, so Envoy Gateway marked the budget `Overridden`. Both now live in one policy.

**Smaller ones:** the autoscaler ignored the CPU target annotation in Standard mode (the predictor spec fields work); the Gateway never reported ready because kind has no load balancer (a ClusterIP Envoy service fixed it); and the gateway first measured ~920 ms of overhead, which was `kubectl port-forward` on Windows, not the gateway.

## Results

All measured on a laptop kind cluster. Latency from the laptop goes through `kubectl port-forward`, so it includes that hop.

| What | Measured |
|---|---|
| Commit a serving file → endpoint answering | **26 s** |
| Latency, 300 sequential requests (target p95 100 ms) | p50 5.5 ms, p95 7.7 ms |
| Load: 6 clients, 90 s | autoscaler 1 → 3 replicas, 21,937 requests, 0 errors, p95 43 ms |
| A release pinning the blocked v3, pushed past CI | new pod refused to load it; v2 answered all 565 requests |
| Healthy canary, 10 → 50 → 100% | promoted in 91 s, 2,324 requests, 0 failed |
| Canary made 150 ms slower | **rolled back 30 s after it got traffic**, at 10%; 40 of 397 requests reached it, 0 failed |
| Outside its schedule | scaled to 0 in 43 s; back 65 s after the window opened |
| Cost per team (lab prices) | ≈ $0.21 a day always on vs ≈ $0.075 on a weekday schedule |
| A team over its token budget (300/hour) | 429 after 7 requests; the other team unaffected, even when spoofed |
| Gateway overhead, measured inside the cluster | +6.2 ms per request |

That's 29 of 29 scenario checks across four test scripts, plus 25 unit tests.

## From the lab to a real environment

| In the lab | In production |
|---|---|
| kind, one node, images loaded by hand | EKS, images from ECR, signed and verified at admission |
| A local Git server, commits by a script | GitHub, branch protection, the CI workflow |
| `example.com` host and port-forward | DNS, TLS on the Gateway, auth in front of it |
| Guard reads pod metrics directly | Guard queries Prometheus |
| A stand-in hosted LLM provider | Claude behind the same gateway: a backend and a key, not a code change |

The Terraform for EKS (cluster, plus a namespace, quota, bucket and IAM role per team) is written and validated, but not applied: a real run needs an AWS account.

## FAQ

**Why not let each team deploy however they like?** They can, but then every outage is new. The paved road is easier, which is why teams use it.

**Why not scale to zero on demand?** In KServe that needs Knative, and the first request would wait for a model to load. A schedule fits internal models used in office hours; a payment-path model stays warm.

**Why write your own canary controller?** Because the off-the-shelf ones fight KServe for the Deployment. Moving weights on the route is the same idea Argo Rollouts uses, in about 200 lines.

**Is the cost number real?** The method is; the prices are lab prices I set. One small CPU model costs cents a day. The same schedule on a GPU endpoint is where it matters.

## Why this matters

When putting a model online is one reviewed file instead of five tickets, teams ship models in days. A slow release rolls itself back before most customers see it, and the platform team fixes each problem once, for everyone.

## What's not built yet

A real EKS run with the bill published, Claude behind the gateway (there's no API key in the lab), and a second team's model. The guard runs as one replica and compares against the latency target, not against the stable version. The CI workflow hasn't run, because the repo has no GitHub remote yet.

## Links

- [The project page](/projects/model-hosting)
- [Model Sign-off](/blog/model-signoff-design): how a version gets approved before it can be served
- [KServe](https://kserve.github.io/website/) and the [Gateway API](https://gateway-api.sigs.k8s.io/)
