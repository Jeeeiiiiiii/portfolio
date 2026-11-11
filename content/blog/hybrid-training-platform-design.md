---
title: "Training models on your own servers, with the cloud as overflow (part 1: the design)"
date: 2026-11-11
excerpt: Uber spent years moving its ML workloads from its own data centres to the cloud, one scheduler in front of many clusters. This is the design for my Hybrid Training Platform, a small version of that idea - the same training jobs run on local servers first and spill over to AWS when they're full.
tags: [MLOps, Kubernetes, Hybrid Cloud, Design]
source: https://www.uber.com/blog/scaling-ai-ml-infrastructure-at-uber/
---

*What you'll get: why companies run ML on their own servers and in the cloud at the same time, what Uber's write-up teaches about it, the design I'm building, and what I'll measure. Nothing here is built yet; part 2 will have the results.*

## The problem, in plain words

Many companies own their servers: a data centre, or racks in someone else's. Those servers are already paid for, so using them is cheap. But they're fixed. When five teams want to train models in the same week, there isn't enough. When nobody does, they sit idle.

The cloud is the opposite: as much as you want, whenever you want, but you pay by the hour, and GPUs are expensive.

So the sensible setup is both. Use your own servers first, and send the overflow to the cloud. That's called **cloud bursting**. It's also the usual first step for a company moving to the cloud, because it moves work over gradually instead of all at once.

The hard part isn't the servers. It's making the same job run in both places without engineers caring where it lands.

## What Uber's write-up teaches

Uber has run ML since 2016 and announced its move from its own data centres to the cloud in 2023. Their 2024 post on scaling AI/ML infrastructure is mostly about hardware, but three ideas carry over to any company:

- **Engineers shouldn't see the clusters.** Uber's GPUs were spread over many Kubernetes clusters, and engineers had to know which one to use. Their fix was a single job controller in front of all of them that places each job by policy: least loaded, pack tightly, or close to its data.
- **Measure price-performance, not just speed.** They tested 17 GPU and CPU types across cloud providers in 2023. The best GPU for training wasn't the best for serving. The cheapest one that meets the target wins.
- **Idle GPUs are the real cost.** They track utilisation, run training at night when serving traffic is low, and push for fair sharing between teams.

They also set a 99% uptime target for everything training depends on, because a training run that takes weeks will hit failures.

## Why this is different from moving a web app to the cloud

If you've migrated apps to AWS, you know containers, Terraform and DNS cutovers. ML jobs add:

- **Data is heavy.** A training job needs its dataset nearby. Copying it across for every run costs time and money.
- **Jobs are batch, not services.** They queue, run for hours, and finish. The question isn't "where's the traffic?" but "where's free capacity right now?".
- **Hardware differs.** A job tuned for one GPU type may need different settings on another.
- **The bill can explode.** One forgotten 8-GPU job in the cloud can cost more than a month of the rest.

## The design

```text
engineer submits a training job (same YAML everywhere)
   │
   ▼
manager cluster: Kueue with MultiKueue
   │  is there room on our own servers?
   ├── yes ─▶ on-prem cluster (local kind / k3s)   data: MinIO (S3 API)
   └── no, and the job allows cloud ─▶ AWS EKS cluster (spot nodes)   data: S3
                                        │
                                        └─ budget cap per team per day
   │
   ▼
results and models ─▶ MLflow (one registry for both)
utilisation and cost per cluster ─▶ Grafana
```

1. **An engineer submits a normal Kubernetes job.** It says what it needs (CPU, memory, GPUs) and whether it may run in the cloud. It doesn't say where.
2. **A manager cluster decides where.** Kueue's MultiKueue feature sends the job to a worker cluster with free capacity: our own servers first, AWS second. This plays the part of Uber's job controller.
3. **Data stays close.** Both sides speak the S3 API (MinIO locally, S3 on AWS). A job whose data only exists on one side is placed there, like Uber's data affinity rule.
4. **Cloud spending has a cap.** Each team has a daily budget for the cloud side. Past it, jobs wait for local capacity.
5. **Both clusters report the same things:** utilisation, queue time, and cost per job, so "is bursting worth it?" has a number.

Everything is the same code on both sides: Terraform modules for the infrastructure, one Helm chart and Argo CD for what runs on it. Moving fully to the cloud later means changing a priority, not rewriting jobs.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| "Own servers" | kind / k3s on my machine | Free, real Kubernetes | A second cloud region pretending to be on-prem |
| Cloud | AWS EKS, spot nodes | Where most job ads are; spot is cheap for restartable jobs | On-demand only: 3–4x the price |
| One queue over both | Kueue + MultiKueue | Kubernetes-native, quotas per team, dispatch across clusters | A custom job controller like Uber's: too big for one person |
| Same storage API | MinIO locally, S3 on AWS | Jobs don't change between sides | NFS: doesn't exist in the cloud the same way |
| Infrastructure | Terraform modules | Same modules, two environments | Clicking in the console |
| Deploy | Argo CD + Helm | One chart, two clusters | Separate manifests per side |
| Training jobs | The credit and fraud models from my other projects | Real jobs, not sleep loops | Synthetic busy-work |

## The failure I'll cause on purpose

Halfway through a burst, the cloud cluster becomes unreachable. Jobs already running there should finish or be resubmitted. New jobs should stay queued for local capacity instead of failing. Nothing should be lost, and an alert should say what happened.

## What I'll measure

No numbers yet. Part 2 will report:

- **Queue time** for a batch of jobs, with and without cloud bursting.
- **Cost per training run** on local servers vs each cloud instance type, my small version of Uber's 17-SKU test.
- **Utilisation** of the local cluster before and after.
- **How long it takes to add cloud capacity** from "queue is full" to "job running on AWS".

The cloud side runs on a local AWS emulator first, then once on real EKS for a few hours, with the bill published and everything destroyed after.

## FAQ

**Why not move everything to the cloud?** Servers you already own are cheap to keep using. Many companies keep them for steady work and use the cloud for peaks.

**Why spot instances?** Training jobs that checkpoint can survive being interrupted, and spot is much cheaper. Serving traffic shouldn't run on spot alone.

**Isn't one big cluster simpler?** Often, yes. But own servers and the cloud are separate networks and separate failure domains, so separate clusters with one queue on top is the honest model.

## Why this matters

A cloud migration doesn't have to be a big bang. With one queue over both sides, the move happens one priority change at a time, and every step has a cost-per-job number behind it instead of a guess.

## Links

- [Uber: Scaling AI/ML infrastructure at Uber](https://www.uber.com/blog/scaling-ai-ml-infrastructure-at-uber/), the post this builds on
- [Kueue MultiKueue](https://kueue.sigs.k8s.io/docs/concepts/multikueue/)
- [My Model Sign-off design](/blog/model-signoff-design), whose models this platform will train
