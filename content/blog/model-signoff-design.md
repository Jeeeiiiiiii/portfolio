---
title: "How a bank decides a new model is allowed to go live — the plan"
date: 2026-11-11
excerpt: At a regulated company, a model can't go live because its author says it's better. This is the design for Model Sign-off, a release process where every new model is tested against the current one, approved by a risk reviewer in a pull request, and leaves evidence an auditor can read.
tags: [MLOps, Governance, MLflow, Design]
kind: design
---

*What you'll get: the problem a model release process solves, the design I'm building, and what I'll measure. This is a plan for a project I'm building now. Nothing here is built yet; a follow-up post will show what happened.*

## The problem, in plain words

Imagine a bank uses a model to decide who gets a credit card. A data scientist trains a new version and says it's better. Can it go live?

At a bank, not on their word. Someone has to prove the new model beats the current one **on the same test**. Someone from the risk team has to agree. And months later, when an auditor or a regulator asks "why did this model change, and who approved it?", there has to be an answer that isn't a search through old emails.

Without a platform, that process is spreadsheets, screenshots, a long email thread and a lot of waiting. I want to build the version where it's a pull request.

## Why this is different from normal releases

If you know CI/CD, you know most of this already: tests run, a reviewer approves, the release goes out. The difference with models:

- **"Tests pass" isn't enough.** A model can be correct code and still be worse than the one in production. It has to be *compared*, on data it has never seen.
- **Better on average can still be worse.** A model that wins on accuracy overall may be much worse on the most recent month, or for one group of customers. Those checks are part of the gate.
- **The approver isn't an engineer.** A risk reviewer needs a report they can read, not a log file.
- **The evidence has to outlive the people.** The record of what was tested, on which data, and who approved it is the actual deliverable for an audit.

## The design

```diagram
model-signoff
Training registers a new version in MLflow. The evaluation gate scores it on the same frozen test set as the current @champion; it must win on the agreed metric and pass stability checks, and it writes a report a non-engineer can read. A version that passes is tagged @challenger. Promotion is a pull request pointing @champion at it, which a risk reviewer must approve through CODEOWNERS. On merge, Argo CD applies it and an evidence pack is saved: model card, data hash, report, approver and date.
```

1. **Training finishes and registers the model** in MLflow, the model registry.
2. **The evaluation gate scores it** on a frozen test set, next to the model currently in production, called `@champion`. It must win on the agreed metric *and* pass stability checks, like "not worse on the newest month of data".
3. **If it passes, it's tagged `@challenger`** and the gate writes a report a non-engineer can read.
4. **Promotion is a pull request** that changes one line: which version `@champion` points to. A CODEOWNERS rule makes a risk reviewer's approval mandatory.
5. **On merge, Argo CD applies it,** and an evidence pack is saved: model card, a hash of the exact data, the report, who approved it, and when.

The audit trail is the Git history. "Who approved version 7?" is `git log`.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| Store models and name the live one | MLflow 3 with aliases | `@champion` / `@challenger` are just names that move | MLflow "stages": deprecated since 2.9 |
| Run training and evaluation | Argo Workflows on kind | Each step is a container; the same file runs on any cluster | Kubeflow: much more to run for this |
| Stability and drift checks | Evidently 0.7 | Readable reports | Older Evidently examples: the API changed in 0.7 |
| Start new model projects the same way | copier template | Can push template updates to existing projects | cookiecutter: one-time copy only |
| Approve and apply | GitHub pull requests + Argo CD | Approval and history are free | A custom approval UI |
| Compare with a managed service | SageMaker, one short run | Real answer to "why not managed?" | Guessing |

## Two models, as if from two teams

A platform only proves itself when a second team gets everything for free, so two models go through it:

- **Credit default:** the [UCI "Default of credit card clients" dataset](https://archive.ics.uci.edu/dataset/350), 30,000 real card holders, CC BY 4.0, downloadable in CI without a login.
- **Fraud:** the model from my [fraud detection project](/blog/fraud-model-training-serving-skew), onboarded with one config file.

## The failure I'll cause on purpose

A challenger that wins on overall accuracy but fails the stability check on the newest month. The gate should block it, the report should say why in plain words, and there should be no pull request to approve. If that works, the gate is doing its job.

## What I'll measure

No numbers yet. These are the ones the follow-up post will report:

- **Steps and minutes to onboard the second model,** compared with the first.
- **Time from "training finished" to "ready for approval".**
- **Self-hosted vs SageMaker:** setup time, cost for the same run, and how much I had to build myself.

## FAQ

**Why not let the best model go live automatically?** In a regulated business, a person is accountable for each model. Automation does the comparison; a person signs.

**Isn't a pull request too technical for a risk reviewer?** The reviewer reads the report linked in the pull request and clicks approve. That's less work than the email thread it replaces.

**Why both self-hosted and managed?** Because "why not just use SageMaker?" is the first question a hiring manager asks, and I want a measured answer.

## Why this matters

A model release process that leaves evidence turns an audit from weeks of digging into a link. It also makes releasing *faster*, because the approval is a click on a clear report instead of a meeting.

## Links

- [MLflow model registry aliases](https://mlflow.org/docs/latest/)
- [The project page](/projects/model-signoff)
- A follow-up post, with results, comes once it's built.
