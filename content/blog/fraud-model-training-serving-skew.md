---
title: "My fraud model looked healthy but was reading the data wrong"
date: 2026-11-11
excerpt: Every health check was green, yet my fraud model was making decisions on scrambled data, like a translator using the wrong dictionary. This is the most common way machine learning fails in production. How I found it, and the tests that now stop it.
tags: [MLOps, Fraud Detection, MLflow, Testing]
featured: 1
kind: build
---

*What you'll get: what training-serving skew is, how it hid in a working fraud system, and the three tests that now catch it.*

## The problem, in plain words

Every time you pay by card, a fraud model has a few milliseconds to decide: let it through, send it to a person to review, or block it. Get it wrong one way and a fraudster walks off with the money. Get it wrong the other way and a real customer is turned away at checkout, which is a lost sale and an angry customer.

I built a fraud scoring system to learn how teams run models like this in production. It had everything you see in architecture diagrams: a feature store, a model registry, a scoring API, dashboards. It started, it answered every request with `200 OK`, and the scores looked reasonable.

It was also reading the data wrong.

Models only understand numbers, so words like "visa" or "mastercard" get turned into numbers first. Think of it as a dictionary: during training, "visa" was looked up and became **2**. In the live system, a different piece of code used a different dictionary, and "visa" became **7412**. The model had learned what 2 means. It had never seen 7412, so it was guessing, on every payment, while every health check stayed green.

## Why this is different from a normal bug

If you work in DevOps, you already know most of what a model service needs: a container, health checks, autoscaling, metrics, a rollback plan. That's 80% of it. The missing 20% is that **a model can be completely wrong while every health check is green.**

- **Wrong answers look like answers.** A web service with a bug usually throws an error. A model with bad inputs still returns a score between 0 and 1.
- **The code runs twice, in two places.** Training turns raw data into numbers in a batch job. Serving does the same thing again, live, in a different program. If those two programs disagree, the model gets inputs it never learned from. This is called **training-serving skew**, and it's still the most common production failure in machine learning.
- **The future can leak into the past.** A feature like "this merchant's fraud rate over 30 days" must only use transactions *before* the one being scored. If it includes the current one, the model sees the answer during training, looks brilliant, and fails in production.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| Train a model on tabular data | XGBoost + Optuna | Strong on transaction data; Optuna searches the settings | Deep learning: more effort, little gain on tables |
| Keep every model and what it was trained with | MLflow | Stores the model *and* its helper files together | A plain bucket: no versions or metadata |
| Serve fast lookups of customer history | Redis behind Feast | Millisecond reads of precomputed features | Computing history live: too slow |
| Answer scoring requests | FastAPI | Small, fast, easy to test | A heavier serving framework for now |
| Watch it in production | Prometheus + Grafana | Same stack as the rest of my platform | A separate ML monitoring product |

## How a payment gets scored

```text
offline, on a schedule                      live, for each payment
transactions ─▶ history features ─▶ Redis   payment ─▶ enrichment ─▶ scoring API
                (past data only)      │                    ▲              │
                      │               └───── history ──────┘     allow / review / block
                      ▼
                 training ─▶ MLflow (model + encoders) ─▶ loaded by the scoring API
```

1. **A scheduled job computes history features** for every customer and merchant, such as their average amount over 30 days. It only looks at the past, and it writes the results to Redis.
2. **A payment arrives.** The enrichment service looks up that customer's history in Redis and adds live counts, like how many payments in the last hour.
3. **The scoring API turns everything into numbers** the model understands, including words like "visa" or "debit".
4. **The model returns a score,** and two thresholds turn it into allow, review or block.
5. **The prediction is stored.** When the real outcome is known later (a chargeback, or a reviewer's decision), it's joined back, so the real false positive rate can be measured.

Step 3 is where it went wrong.

## What broke, and how I found it

Training used a `LabelEncoder`, which gives each category a small number in alphabetical order. It saved those encoders to MLflow next to the model. The scoring service never loaded them. It used `hash(value) % 10000` instead, a completely different mapping. Six categorical features, all scrambled, on every request.

Nothing complained. The service was healthy, latency was fine, and scores came back. The only way to see it was to compare the two encodings directly.

So I wrote that comparison first, as a test that failed:

```python
def test_serving_encoding_matches_training():
    countries = ["BR", "CN", "GB", "NG", "RU", "US"]
    le = LabelEncoder().fit(countries)
    # what serving should load at startup: the classes training saved
    predict._label_encoders["ip_country"] = le.classes_.tolist()

    for value in countries:
        expected = int(le.transform([value])[0])                  # training's number
        actual = predict._encode_categorical("ip_country", value)  # serving's number
        assert actual == expected, f"ENCODING SKEW for {value!r}"
```

It loops over every value of one column and compares training's number with serving's. Before the fix it failed on the first value. The fix was small: at startup, the scoring service loads the encoders from the same MLflow run as the model and uses them. After the fix the test passes, and it stays in the suite so the bug can't quietly come back.

Fixing that one led to two more checks:

- **Feature layout.** The model expects its inputs in a fixed order. A second test checks that serving builds the exact columns, in the exact order, that training used.
- **No peeking at the future.** A third test builds a merchant whose *first* transaction is fraud and checks that its "fraud rate so far" reads 0, not 1. If the history job ever includes the current row, this test fails.

## Results

What I can say today:

- The three skew tests pass, and each one failed before its fix.
- On my laptop, the average scoring time is about 7 ms, but the p99 (the slowest 1 in 100 requests) was 64 to 84 ms against my 50 ms target. That's not good enough yet, and I haven't run a proper load test.
- **I don't have real accuracy numbers yet.** I'm moving the model from synthetic data to IEEE-CIS, a public set of about 590,000 real e-commerce transactions. Until that training run is done, I won't quote precision or recall.

Two choices for that dataset matter more than any setting:

- **Split by time, not at random.** In IEEE-CIS, later transactions on an account that charged back are also marked as fraud. A random split puts some of those later rows in training, which leaks the future.
- **Use only what's known when the card is swiped.** The dataset has about 400 engineered columns a live payment service could never produce. I dropped them, so the model trains on what it will actually receive.

## From the lab to a real environment

| In the lab | In production | What changes |
|---|---|---|
| Docker Compose on a laptop | Kubernetes, model served by KServe | Autoscaling, canary releases |
| Synthetic data, then IEEE-CIS | The company's own payment events | Labels arrive weeks later, as chargebacks |
| SQLite feedback store | Postgres or the data warehouse | Same interface, bigger store |
| One person runs training | A scheduled pipeline with an evaluation gate | A new model must beat the current one first |

The skew tests don't change at all. They're the part that moves to production as is.

## FAQ

**Why not just use one library for both training and serving?** That's the real fix, and a feature store is meant to do this. But even with one, someone has to prove the two paths match. The tests are that proof.

**Do you need a feature store?** For two features, no. Once several teams compute "average amount over 30 days" in different ways, yes.

**Why XGBoost and not a neural network?** On table-shaped transaction data, gradient-boosted trees are usually as good or better, and much easier to explain to a risk team.

**What would you monitor first?** The share of payments blocked. If it suddenly doubles, either fraud doubled or the model broke, and both need a person.

## Why this matters

A model with skew doesn't go down. It just makes worse decisions, quietly, until someone notices the fraud losses or the complaints. Three small tests turn that silent failure into a red build.

## Links

- The next part covers the first real training run on IEEE-CIS.
- [IEEE-CIS Fraud Detection dataset](https://www.kaggle.com/competitions/ieee-fraud-detection/data)
- [MLflow model registry](https://mlflow.org/docs/latest/)
