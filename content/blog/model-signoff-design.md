---
title: "Better overall, worse for one group: a release gate for credit models"
date: 2026-11-13
excerpt: I built Model Sign-off, a release process where each new model is tested against the one in use, approved by a risk reviewer in a pull request, and leaves evidence for an auditor. On real credit data it caught a model that won overall but looked worse for one group.
tags: [MLOps, Governance, MLflow, Argo CD]
kind: build
---

*What you'll get: why a bank can't release a model on its author's word, the release gate I built, the model it stopped, the two things it got wrong at first, and what it measured on a laptop and on Kubernetes.*

## The problem, in plain words

Imagine a bank uses a model to decide who gets a credit card. A data scientist trains a new version and says it's better. Can it go live?

At a bank, not on their word. Someone has to prove the new model beats the current one **on the same test**. Someone from the risk team has to agree. And months later, when an auditor asks "why did this model change, and who approved it?", there has to be an answer that isn't a search through old emails.

Without a platform, that process is spreadsheets, screenshots and a long email thread. I built the version where it's a pull request, and ran three real models through it.

## Why this is different from normal releases

If you know CI/CD, you know most of this already: tests run, a reviewer approves, the release goes out. The difference with models:

- **"Tests pass" isn't enough.** A model can be correct code and still be worse than the one in production. It has to be *compared*, on data it has never seen.
- **Better on average can still be worse.** A model that wins overall can be worse for one group of customers. That's a fairness problem and, at a bank, a regulatory one.
- **The approver isn't an engineer.** A risk reviewer needs a report they can read, not a log file.
- **The evidence has to outlive the people.** What was tested, on which data, and who approved it is the actual deliverable for an audit.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| Store models and name the live one | MLflow 3.18, aliases | `@champion` and `@challenger` are names that move | Registry "stages": deprecated since MLflow 2.9 |
| Run training and the gate | Argo Workflows 4.0 on kind | Each step is a container; the same template runs on any cluster | Kubeflow: much more to run for this |
| Apply an approval | Argo CD 3.5, a sync hook | A merged file in Git is the approval; a refused one fails the sync | A custom approval UI |
| Models | scikit-learn, XGBoost | Strong on tabular data | — |
| Save models safely | skops format, named trusted types | MLflow 3's safer default; no pickle | Pickle: runs arbitrary code on load |
| Data | [UCI credit card default](https://doi.org/10.24432/C55S3H), 30,000 card holders | Real, public, CC BY 4.0 | Synthetic data: proves nothing about groups |

## How a release works

```diagram
model-signoff
Training registers a new model version in MLflow and nothing else. The gate scores it and the current @champion on the same frozen test set, with five checks: minimum quality (AUC at least 0.70), beats the current model by at least 0.005 AUC, no age, sex or education group worse by more than 0.01 AUC, fairness across sexes within 5 points, and stable scores (PSI at most 0.10). A 95 percent bootstrap interval decides each group drop: fail if the whole interval is below zero, review if the data can't confirm it, otherwise pass. A passed or flagged version becomes @challenger with a report a reviewer can read. Going live is a pull request that sets champion to that version, which a risk reviewer must approve through CODEOWNERS. On merge, an Argo CD sync hook runs promote: it refuses a version with no named approver, a failed version or an unnamed flagged group, so the sync fails and the champion stays; otherwise @champion moves and an evidence pack with approver, data hashes, checks and report hash is stored in MLflow.
```

1. **Training registers a version and nothing else.** It never touches the model in use.
2. **The gate scores the new version and the current one on the same rows.** The test rows are chosen by a hash of each customer's ID and then frozen; their SHA-256 is recorded, and if the file ever changes, every evaluation stops, because comparisons with earlier models would be meaningless.
3. **Five checks run:** a minimum quality floor, "beats the current model", "no group of customers got worse" (by age band, sex and education), "the share of real defaulters caught is similar for men and women", and "the score distribution is stable".
4. **A version that passes becomes `@challenger`** and gets a plain-language report, with a confidence interval for every group.
5. **Going live is a one-line pull request.** A CODEOWNERS rule makes a risk reviewer's approval mandatory.
6. **On merge, the champion moves** and an evidence pack is written: what was approved, by whom, why, the data hashes, every check, and a hash of the report, so a later edit to the report would show.

Sex, marital status and age are never model inputs. They're kept only to check the model.

## The important bits

Each model is one folder with a config file. The gate thresholds live there, next to the groups to check:

```yaml
gate:
  metric: roc_auc
  min_metric: 0.70          # absolute floor, also applies to the first model
  min_gain: 0.005           # must beat the champion by at least this much
  max_segment_drop: 0.01    # no group may be worse than the champion by more than this
  confidence: 0.95          # a group drop fails only if the whole interval is below zero
  bootstrap_samples: 1000
  fairness: {column: SEX, max_recall_gap: 0.05}
  max_score_psi: 0.10
```

The approval itself is a small file in Git. Merging a change to it is what releases a model:

```yaml
model: credit-default
champion: 2
approved_by: "risk reviewer (demo)"
reason: "Higher AUC in every segment"
```

Promotion is refused if the version failed the gate, if it was compared with a champion that has since been replaced, if a high-risk model has no named approver, or if the version was flagged and the file doesn't name the flagged group under `acknowledged`.

## What happened: three models

| Version | Model | Test AUC | Gate | Outcome |
|---|---|---|---|---|
| v1 | Logistic regression | 0.712 | Pass (first model) | Approved, became the model in use |
| v2 | XGBoost, same 20 inputs | 0.775 | Pass: better in every group | Refused without a named approver; approved with one |
| v3 | XGBoost + 5 engineered inputs | 0.780 | Review | Better overall, worse for one group; the reviewer declined |

v3 is the interesting one. Adding five features derived from payment history really did improve the model overall, by enough to pass "beats the current model". But for customers whose education was "other or unknown", its AUC fell from 0.708 to 0.656. I didn't plan that; the per-group check found it.

## What broke, and how I recovered

**The first "blocked" verdict was based on noise.** My first gate blocked v3 outright. Then I looked at the group size: 103 customers in the test set. I added a paired bootstrap, which resamples those customers 1,000 times to see how much the difference moves. The 95% interval of the change was −0.128 to +0.022. It includes zero, so the data can't tell whether v3 is really worse for them.

Blocking on that would stop good models; ignoring it would let real harm through. So the gate now has three outcomes: **fail** when the whole interval is below zero, **review** when a group looks worse but the data can't confirm it, and **pass**. A reviewed version can only go live if the approval names the group, so nobody approves it by accident.

**The same code trained a different model on Linux.** Same data, same seed, same pinned library versions. On my Windows laptop, v3's drop for that group was −0.051 (review). In the Linux pipeline pod it was −0.083, with an interval of −0.172 to −0.020: entirely below zero, so **fail**. XGBoost isn't bit-for-bit reproducible across platforms, and a borderline decision flipped. Inside the pipeline it is reproducible: training v3 twice gave identical results. So only models trained in the pipeline count, and laptop runs are for development.

**The frozen test set "changed" inside the pipeline.** Same rows, different SHA-256. pandas ends CSV lines with the operating system's line ending, so Windows and Linux hashed the same data differently. The guard refused to run, which is exactly what it's for. The line ending is now pinned, with a test.

**Smaller ones:** MLflow 3.18's server was killed for using too much memory at 768 MB and then at 1 GB, because it starts about eight background job workers I don't use; turning them off brought it under 768 MB. And every workflow pod was refused at admission, because the namespace enforces the `restricted` Pod Security level and Argo's helper containers don't meet it by default. I configured the executor for it instead of loosening the namespace.

## Results

On the laptop, the scenario script runs the whole story in about a minute: **10 of 10 checks** pass.

On Kubernetes (kind, one node), **10 of 10 checks**:

| Step | Measured |
|---|---|
| A pipeline trains and gates one model | 69–85 s |
| Approval commit → `@champion` moved by Argo CD | 61–65 s (Argo CD checks Git every 20 s) |
| Approval without a named approver | Sync failed, model in use unchanged |
| Approval for the failed v3 | Sync failed, model in use unchanged |
| Evidence pack | Stored in MLflow, report hash verified |

There are 26 unit tests, including the decision rules as a pure function (no MLflow or data needed) and a test that a changed test set is refused.

## From the lab to a real environment

| In the lab | In a bank |
|---|---|
| kind, one node, SQLite MLflow | EKS, MLflow on a database and object storage, behind SSO |
| `approved_by` typed into the file | Taken by CI from the pull request's approving review |
| A local Git server, commits by a script | GitHub with branch protection and required code-owner review |
| Pipelines started by hand | Started on a schedule or by new data |
| Fixed thresholds I chose | Thresholds agreed with risk and compliance |

The idea stays the same: the gate decides what is *allowed*, a person decides what is *released*, and Git keeps the record.

## FAQ

**Why not let the best model go live automatically?** In a regulated business, a person is accountable for each model. The gate does the comparison; a person signs.

**Isn't a pull request too technical for a risk reviewer?** They read the report linked in the pull request and click approve. That's less work than the email thread it replaces.

**Why not block every group that looks worse?** Because small groups are noisy. v3's drop for 103 customers could easily be chance. Blocking it automatically would stop good models; the review outcome hands that judgement to a person and makes them name it.

**Why not SageMaker?** I plan to run the same model there once and compare setup time, cost and effort. That comparison isn't built yet.

## Why this matters

A release process that leaves evidence turns an audit from weeks of digging into a link. It also makes releasing faster, because the approval is a click on a clear report, and the gate catches the model that looks better on paper and isn't, for some customers.

## What's not built yet

The CI workflow is written but hasn't run, because the repo has no GitHub remote yet. The fraud model as a second team, the SageMaker comparison and a project template are still to come. The data is one snapshot (Taiwan, 2005), so drift over time can't be tested with it.

## Links

- [The project page](/projects/model-signoff)
- [Model Hosting Platform](/blog/model-hosting-design): how the approved model is served
- Data: I-Cheng Yeh, *Default of Credit Card Clients*, UCI Machine Learning Repository, 2009, [doi:10.24432/C55S3H](https://doi.org/10.24432/C55S3H), CC BY 4.0
