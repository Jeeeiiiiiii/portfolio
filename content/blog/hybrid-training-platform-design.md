---
title: "Training models on your own servers, with the cloud as overflow — the plan"
date: 2026-11-11
excerpt: Most cloud migrations happen gradually, with old servers and the cloud running side by side. This is my plan for a Hybrid Training Platform that practises that stage - the same training jobs run on local servers first and spill over to AWS when they're full, with the cost of every job measured.
tags: [MLOps, Kubernetes, Hybrid Cloud, Design]
kind: design
---

*What you'll get: why companies run ML on their own servers and in the cloud at the same time, why I'm building this, the design I'm building, and what I'll measure. This is a plan for a project I'm building now. Nothing here is built yet; a follow-up post will show what happened.*

## The problem, in plain words

Many companies own their servers: a data centre, or racks in someone else's. Those servers are already paid for, so using them is cheap. But they're fixed. When five teams want to train models in the same week, there isn't enough. When nobody does, they sit idle.

The cloud is the opposite: as much as you want, whenever you want, but you pay by the hour, and GPUs are expensive.

So the sensible setup is both. Use your own servers first, and send the overflow to the cloud. That's called **cloud bursting**. It's also the usual first step for a company moving to the cloud, because it moves work over gradually instead of all at once.

The hard part isn't the servers. It's making the same job run in both places without engineers caring where it lands.

## Why I'm building this

Most cloud migrations I've read about, and the ones engineers describe on forums, aren't a single weekend cutover. They happen workload by workload, with the old servers and the cloud running side by side for months. I wanted to practise that middle stage, where both exist at once, because that's where the hard questions are:

- **Who decides where a job runs?** If engineers have to pick a cluster, every new cluster is more for them to learn. The platform should decide, by a rule: free capacity, cost, or where the data is.
- **Is the cloud actually cheaper for this job?** The fastest machine isn't always the best value. The right answer is the cheapest machine that finishes in time, and that needs measuring per job, not guessing.
- **What's sitting idle?** Servers that are paid for and doing nothing are the real waste. Training can run at night or at weekends when other work is quiet.

## Why this is different from moving a web app to the cloud

If you've migrated apps to AWS, you know containers, Terraform and DNS cutovers. ML jobs add:

- **Data is heavy.** A training job needs its dataset nearby. Copying it across for every run costs time and money.
- **Jobs are batch, not services.** They queue, run for hours, and finish. The question isn't "where's the traffic?" but "where's free capacity right now?".
- **Hardware differs.** A job tuned for one GPU type may need different settings on another.
- **The bill can explode.** One forgotten 8-GPU job in the cloud can cost more than a month of the rest.

## The design

```diagram
hybrid-training
An engineer submits a training job, the same YAML everywhere. A manager cluster running Kueue with MultiKueue sends it to the on-prem cluster (kind or k3s, data in MinIO) when there is room, or to an AWS EKS cluster on spot nodes (data in S3) when local capacity is full and the job allows cloud, within a daily budget per team. Both send models to one MLflow registry and report utilisation and cost to Grafana.
```

1. **An engineer submits a normal Kubernetes job.** It says what it needs (CPU, memory, GPUs) and whether it may run in the cloud. It doesn't say where.
2. **A manager cluster decides where.** Kueue's MultiKueue feature sends the job to a worker cluster with free capacity: our own servers first, AWS second.
3. **Data stays close.** Both sides speak the S3 API (MinIO locally, S3 on AWS). A job whose data only exists on one side is placed there, instead of copying the data for every run.
4. **Cloud spending has a cap.** Each team has a daily budget for the cloud side. Past it, jobs wait for local capacity.
5. **Both clusters report the same things:** utilisation, queue time, and cost per job, so "is bursting worth it?" has a number.

Everything is the same code on both sides: Terraform modules for the infrastructure, one Helm chart and Argo CD for what runs on it. Moving fully to the cloud later means changing a priority, not rewriting jobs.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| "Own servers" | kind / k3s on my machine | Free, real Kubernetes | A second cloud region pretending to be on-prem |
| Cloud | AWS EKS, spot nodes | Where most job ads are; spot is cheap for restartable jobs | On-demand only: 3–4x the price |
| One queue over both | Kueue + MultiKueue | Kubernetes-native, quotas per team, dispatch across clusters | A custom job controller: too much to build and maintain for one person |
| Same storage API | MinIO locally, S3 on AWS | Jobs don't change between sides | NFS: doesn't exist in the cloud the same way |
| Infrastructure | Terraform modules | Same modules, two environments | Clicking in the console |
| Deploy | Argo CD + Helm | One chart, two clusters | Separate manifests per side |
| Training jobs | The credit and fraud models from my other projects | Real jobs, not sleep loops | Synthetic busy-work |

## The failure I'll cause on purpose

Halfway through a burst, the cloud cluster becomes unreachable. Jobs already running there should finish or be resubmitted. New jobs should stay queued for local capacity instead of failing. Nothing should be lost, and an alert should say what happened.

## What I'll measure

No numbers yet. The follow-up post will report:

- **Queue time** for a batch of jobs, with and without cloud bursting.
- **Cost per training run** on local servers vs each cloud instance type, to find the cheapest machine that finishes in time.
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

- [Kueue MultiKueue](https://kueue.sigs.k8s.io/docs/concepts/multikueue/)
- [My Model Sign-off design](/blog/model-signoff-design), whose models this platform will train
