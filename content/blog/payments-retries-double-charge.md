---
title: Why retrying a failed payment can charge a customer twice
date: 2026-11-11
excerpt: Payment apps fail over to a backup provider so customers can still pay. I broke a provider on purpose, eight different ways, to see when that failover takes the money twice, and built the job and alerts that catch it.
tags: [Payments, SRE, Kubernetes, Observability]
featured: 2
---

*What you'll get: when payment failover causes double charges, how to choose a retry policy, and how to catch what the policy lets through.*

## The problem, in plain words

An online shop doesn't talk to Visa directly. It sends each card payment to a **payment provider**, a company that moves the money. Providers have outages, so many shops use a **payment orchestrator**: one app that sits in front of several providers and, when one fails, tries the next. The customer sees a successful payment and never knows anything went wrong.

That's the theory. In practice, "the provider returned an error" doesn't mean "the provider did nothing". A provider can take the money and then fail to say so: its server crashes after charging, or the connection hangs. If the orchestrator then retries on a backup provider, the customer is charged twice. And the shop sees one clean "succeeded".

I wanted to know exactly when this happens, so I built a platform around **Hyperswitch**, an open-source payment orchestrator, and broke its providers on purpose. This is infrastructure around an existing open-source app, not a payment system I wrote. It uses test cards and simulated providers only, and no real money moves.

## Why this is different

If you run web services, you already know retries, timeouts and health checks. That's most of it. The difference is that **in payments, a retry is not free.**

- **Retrying a web page is safe. Retrying a charge may not be.** The usual defence is an idempotency key: a payment ID the provider remembers, so a second request with the same ID is ignored. It only works if the provider supports it and the orchestrator sends it.
- **"Unknown" is a real answer.** When a provider times out, the honest state of the payment is "we don't know yet". Something has to settle it later.
- **The dashboards lie by default.** The obvious error counter counts card declines, which are normal, and misses some real outages entirely. More on that below.

## The tools, and why each one

| What I need | Tool | Why this one | What I didn't pick |
|---|---|---|---|
| A real payment orchestrator | Hyperswitch | Open source, real failover and retry rules | Writing my own: it would only prove my own assumptions |
| Providers that fail on demand | A mock provider I wrote | Can charge and *then* fail, which real sandboxes can't | Provider sandboxes: they don't fail like that |
| Find double charges after the fact | A reconciliation job | Compares what providers charged with what was stored | Trusting the orchestrator's own status sync: it didn't settle them |
| Alerts | Prometheus + Alertmanager → Slack | Standard, testable rules | A hosted monitoring product |
| Run it like production | kind, Argo CD, Kyverno | GitOps and signed images on a laptop | A managed cluster, for now |

## How a payment flows, and where it breaks

```text
customer ─▶ Hyperswitch ─▶ provider A (fails on demand)
                │   └─ retry rule matches? ─▶ provider B (healthy)
                ▼
             Postgres ◀── reconciler (every 15 s, read-only)
                              │ provider charges vs stored payments
                              ▼
             Prometheus ─▶ Alertmanager ─▶ Slack
```

1. **The shop sends a payment** to Hyperswitch, which routes it to provider A.
2. **Provider A fails** in one of eight ways I can choose: declines the card, is slow, returns 500 or 503, hangs, resets the connection, or does one of those *after* charging.
3. **Hyperswitch checks its retry rules.** If the error matches a rule, it retries on provider B. If not, the payment stays `processing`.
4. **Every 15 seconds, a reconciliation job** reads each provider's charges and compares them with Hyperswitch's stored payments. It only reports, because moving money back is a decision for a person.
5. **Alertmanager sends findings to Slack:** a double charge, a hidden charge, a payment stuck in `processing`, or a provider burning through its error budget.

## What I found

I ran each failure up to three times, with no retry rules, then with retries on server errors, then also with retries on timeouts.

| Provider A does this | No retry rules | Retry on 500/503 | Also retry on timeout |
|---|---|---|---|
| Declines the card | failed, 1 attempt | same | same |
| Returns 500 | `processing` | succeeded on B | same |
| Returns 500 **after charging** | `processing`, charge hidden | **double charge** | **double charge** |
| Hangs | `processing` after 30 s | same | succeeded on B after 30 s |
| Hangs **after charging** | charge hidden | same | **double charge** |
| Resets the connection **after charging** | HTTP 500, charge hidden | same | same |

In every double-charge row, the shop's API call returned one clean `succeeded`. Nothing in the response said provider A had also taken the money.

So the retry rules *are* the failover policy. Each rule is a decision about how much double-charge risk to accept for that error. Mine:

```json
[
  { "code": "500", "message": "internal_server_error" },
  { "code": "503", "message": "service_unavailable" }
]
```

- **Retry on 500 and 503,** because those usually mean the provider never got to the charge, and keep reconciliation behind it for when they did.
- **Never retry on a timeout.** A hang is the failure most likely to hide a charge, and retrying adds a second charge on top of a 30-second wait.
- **Always send your own payment ID.** Connection resets returned a bare HTTP 500 with no payment in the response. Without your own ID, you can't even find the payment.

## What broke, and how I fixed it

**The obvious alert was wrong.** I measured how each counter moves:

| 4 payments that… | Error counter | Calls − 2xx − 4xx |
|---|---|---|
| were declined | 4 (false alarm) | 0 |
| hit HTTP 500, recovered on B | 4 | 4 |
| hit connection resets | **0** (outage missed) | 4 |

Alerting on the error counter would page someone for normal card declines and stay silent through a total outage. Calls minus successful responses minus client errors was right in all five cases I tested, so the provider availability target (a 99.5% **SLO**, a reliability goal with a budget for failures) uses that.

**Then the first burst of failures went missing.** The router only creates a counter the first time it increments, and Prometheus's `rate()` can't see that first jump. My live test caught it. The rules now compare with an `offset` instead, and rule tests cover both cases.

**Retry rules can fail silently.** The router matches rules against a generic message, `internal_server_error`, not the provider's raw error text. A rule written against the raw text is accepted without complaint and never matches.

## Results

- **Reconciliation:** 13 of 13 known-answer checks passed, each failure caused on purpose, with no false alarms on healthy or recovered payments.
- **Alerts:** 14 of 14 live checks. With a 15-second reconciliation interval, a double charge reached the alert in 31 seconds and a connection-reset outage in 96 seconds.
- **On Kubernetes:** payments, failover and double-charge detection all work, with Argo CD delivering from Git and 19 of 19 GitOps checks passing.

These results show how the orchestrator behaves *when* a failure happens. They say nothing about how *often* real providers fail this way.

## From the lab to a real environment

| In the lab | In production |
|---|---|
| A mock provider | Real providers, with their own settlement report formats and timing |
| Reconciliation every 15 seconds | Daily settlement files, plus near-real-time checks where providers allow it |
| One Slack channel | On-call paging with escalation, and a second channel if Slack is down |
| kind on a laptop | A managed Kubernetes cluster; same manifests |

## FAQ

**Why not just turn retries off?** Then a provider outage becomes your outage. Retries on clear server errors are worth it, as long as something catches the rare double charge.

**Don't idempotency keys solve this?** They're the right first defence. The mock protocol I used can't send one, so I couldn't test it. Reconciliation is the safety net either way.

**Why does the job only report?** Refunding automatically on a wrong finding moves real money the wrong way. A person decides.

**What would this cost on AWS?** Not measured yet. That's a later part of this series.

## Why this matters

A double charge costs more than the refund: support time, a dispute fee, and a customer who may not come back. The retry policy decides how many of them you create, and reconciliation decides how fast you find them.

## Links

- [Hyperswitch](https://github.com/juspay/hyperswitch), the open-source orchestrator this is built around
- [How the platform is secured and kept available](/blog/payments-security-and-availability)
- [Google SRE workbook: alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
