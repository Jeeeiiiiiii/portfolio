---
title: "Your model is healthy and wrong: how to notice when the world changes"
date: 2026-11-11
excerpt: A model is trained on the past and used on the present. When the two drift apart, nothing crashes. This is how I think about drift, which kinds exist, what to monitor first, and what my fraud project's drift job does and doesn't catch.
tags: [MLOps, Monitoring, Drift, Fraud Detection]
source: https://huyenchip.com/2022/02/07/data-distribution-shifts-and-monitoring.html
---

*What you'll get: what drift is, the three kinds worth knowing, what to monitor in what order, and how a real drift job turns it into an alert. Built on Chip Huyen's write-up on distribution shifts, credited at the end, with my own fraud project as the example.*

## The problem, in plain words

A model learns from history. Then it's put to work on today. As long as today looks like the history it learned from, it does fine. When the world changes, it keeps answering with the same confidence, just more often wrong.

Chip Huyen opens her write-up with a grocery demand model that worked well at launch and had quietly become a problem a year later. Nobody had broken anything. The world had moved.

In DevOps terms: the service is up, latency is fine, every request returns `200 OK`, and the business is losing money. That's what makes this hard.

## Why this is different from normal monitoring

If you run Prometheus and Grafana, you already have half of this. The other half:

- **Wrong answers don't throw errors.** A model can't tell you it's guessing.
- **The right answer arrives late.** For a fraud model, you only learn a payment was fraud when the customer disputes it, which can take weeks or months. You can't compute today's accuracy today.
- **"Normal" moves.** Weekends look different from weekdays, December from March. A naive check calls every Monday "drift".
- **Many alarms are false.** Feature checks fire on harmless changes, and a team that gets ten false drift alerts a week stops reading them.

## Three kinds of drift, in plain words

Think of the model as learning "given these inputs, how likely is fraud?". Things can change in three places:

| Kind | What changed | Fraud example |
|---|---|---|
| **The inputs changed** (covariate shift) | The mix of transactions | A new marketplace launches, so far more small digital purchases arrive |
| **The answers changed** (label shift) | How common fraud is | A fraud ring hits, and fraud jumps from 3% to 8% of payments |
| **The rule changed** (concept drift) | What fraud looks like | Fraudsters stop testing cards with tiny amounts and start using normal-looking ones |

The third is the nastiest. The inputs look the same as before, so input checks stay quiet, but what they mean has changed.

There's also a fourth, very common case, and it isn't the world at all: **you changed something.** A pipeline started sending amounts in cents instead of dollars, a field went missing, an old model version got deployed. Huyen quotes a monitoring company's CTO who estimated about 80% of the drift they catch comes from human error. My own fraud project's worst bug was exactly this kind: serving encoded categories differently from training ([that story is here](/blog/fraud-model-training-serving-skew)).

## What to monitor, in order

Huyen's order, which I agree with, from cheapest and fastest to most informative:

1. **Operational health.** Latency, errors, uptime. Same as any service. If this is broken, nothing else matters.
2. **Accuracy, when labels arrive.** The best signal, but late. For fraud: chargebacks and the analysts' review decisions, joined back to each prediction.
3. **The predictions themselves.** One number per request, so cheap to watch. If the share of blocked payments doubles overnight, either fraud doubled or the model broke. Both need a person.
4. **The inputs (features).** Their ranges, their distributions, missing values. More expensive, noisier, and the place false alarms come from.
5. **Raw data.** The most informative, but often owned by another team and hard to reach.

The point of watching predictions and inputs is that you don't have to wait for labels. They're early warnings, not proof.

## How a drift check actually works

The idea is simple: compare **recent data** with a **reference** (usually the data the model was trained on) and measure how different they are.

My fraud project uses **PSI** (Population Stability Index), which is common in banking:

```text
PSI = Σ (current% − reference%) × ln(current% / reference%)

< 0.1    no real change
0.1–0.2  some change, worth a look
> 0.2    significant change
```

1. **Split each feature into buckets** using the reference data, e.g. ten equal-sized ranges of transaction amount.
2. **Count what share of recent transactions** falls into each bucket.
3. **Compare the shares.** If 10% of training transactions were under $5 and now 30% are, that bucket adds a lot to the PSI.
4. **Push one number per feature to Prometheus,** and alert when it stays high.

```yaml
- alert: FeatureDriftDetected
  expr: max(fraud_feature_psi) > 0.2
  for: 30m
```

The `for: 30m` matters: a single noisy reading doesn't page anyone. The job also checks the model's score distribution (prediction drift) and basic data quality: null rate, duplicate IDs, impossible values like a negative amount. Those quality checks catch the "you changed something" kind, which is the most common one.

## What my drift job doesn't do yet

Writing this post made me read my own code again, critically:

- **It ignores weekly cycles.** By default it compares the oldest 70% of the data with the newest 30%. If those windows land on different parts of the week, normal patterns can look like drift. Huyen's advice is to pick windows that respect the cycle, e.g. compare this Monday with last Monday.
- **One metric has the wrong name.** My feedback store reports `false_positive_rate` as false positives divided by all flagged payments. That's really "what share of my flags were wrong" (1 − precision). The true false positive rate divides by all legitimate payments. Both are useful, but a dashboard that mislabels one as the other misleads whoever reads it. Renaming it is on my list.
- **There's no real data yet.** The drift job has run on synthetic data. The real test comes with the IEEE-CIS dataset, where I can replay transactions in time order and see whether the alerts fire when they should.

## What to do when drift is real

1. **Find out which kind it is.** Check for a pipeline change first: a new schema, a deploy, missing values. Most "drift" ends here.
2. **Check whether accuracy actually dropped,** using whatever labels you have. Inputs can drift without hurting the model.
3. **Retrain on recent data,** then compare the new model with the current one on the same test before switching. That's what my [Model Sign-off design](/blog/model-signoff-design) is for.
4. **Prefer stable features.** Huyen's example: a broad bucket like "top 10 / top 100" is steadier than a raw ranking number that moves every hour.

## From the lab to a real environment

| In the lab | In production |
|---|---|
| A batch job on synthetic data | A scheduled job on the last day or week of real traffic |
| PSI per feature, threshold 0.2 | Thresholds tuned per feature, seasonal reference windows |
| SQLite feedback store | Labels from chargebacks and analyst reviews, joined in the warehouse |
| One alert channel | Drift alerts to the model owner, outages to on-call |

## FAQ

**Do I need a monitoring product for this?** Not to start. PSI, a scheduled job and Prometheus cover the basics. Products help when you have dozens of models.

**How often should drift be checked?** As often as you could act on it. For fraud, daily is reasonable; hourly mostly produces noise.

**Should drift trigger retraining automatically?** Retraining can be automatic. Going live shouldn't be: the new model still has to beat the old one, and a person should approve it.

**Isn't drift detection just statistics?** The maths is simple. The hard part is choosing windows and thresholds so alerts mean something.

## Why this matters

A drifting model doesn't cause an outage. It causes a slow leak: a bit more fraud let through, a few more good customers blocked, every day. Monitoring predictions and inputs turns that slow leak into an alert you can act on, weeks before the labels would have shown it.

## Links

- [Chip Huyen: Data distribution shifts and monitoring](https://huyenchip.com/2022/02/07/data-distribution-shifts-and-monitoring.html), the write-up this post builds on
- [My fraud project: the training-serving skew bug](/blog/fraud-model-training-serving-skew)
- [Prometheus alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
