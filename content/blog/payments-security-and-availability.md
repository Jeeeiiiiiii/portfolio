---
title: "Payments platform notes: what keeps it secure and running"
date: 2026-11-11
excerpt: Short notes from my payments lab on the controls that matter most - only signed images can run, Git is the only way in, pods can only talk to who they need, and alerts that still work when things fail.
tags: [Payments, Security, Kubernetes, Supply Chain]
featured: 4
---

*What you'll get: six controls from my payments platform, each with what it stops and the check that proves it works.*

This is a companion to [Why retrying a failed payment can charge a customer twice](/blog/payments-retries-double-charge). That post is about money; this one is about the platform underneath. Everything here runs on a local Kubernetes cluster (kind) around Hyperswitch, an open-source payment app. The design is PCI DSS-inspired, not certified, and no real card data is involved.

## 1. Only images I built and signed can start

**The risk:** someone pushes an image to the registry, or a dependency ships something bad, and it ends up running next to payment traffic.

**The control:** every image is scanned, gets an **SBOM** (a list of everything inside it), and is signed with cosign. A Kyverno admission policy, a check Kubernetes runs before it creates anything, refuses any pod in the `fintech` namespace that fails these checks.

| Image | Result |
|---|---|
| Signed, with SBOM, referenced by digest | Admitted |
| Unsigned | Refused |
| Signed, but no SBOM | Refused |
| Signed by an untrusted key | Refused |
| Referenced by tag instead of digest | Refused |
| From another registry | Refused |

10 of 10 checks passed. The scan gate isn't for show either: the first scan found 3 HIGH issues in `musl` and `zlib` from the base image, which the images now patch.

## 2. Even the scanner is pinned

In March 2026, several Trivy releases and most `trivy-action` tags were compromised ([CVE-2026-33634](https://osv.dev/vulnerability/CVE-2026-33634)). A security scanner runs with access to your code and your registry, so it is part of the supply chain too. Trivy stays on a known-good version pinned by digest, every tool runs from a digest-pinned container, and CI actions are pinned to commit SHAs.

## 3. Git is the only way in

Argo CD deploys the platform from Git. If someone changes the cluster by hand, Argo CD puts it back:

- A manual scale-down was reverted within seconds.
- A deleted network policy came back.
- Even a deleted *signature policy* came back.

A bad release is stopped too. With an unsigned image in Git, Kyverno refused the update, the old version kept running, and a `git revert` recovered it. Because nothing on the cluster was broken, a dedicated alert, `GitOpsReleaseBlocked`, tells a person the release didn't ship. 19 of 19 GitOps checks passed.

## 4. Pods can only talk to who they need

Every namespace starts from **default deny**: no pod can reach another unless a network policy allows it. In the test, a pod in an unlisted namespace timed out trying to reach the mock provider, and a pod in the allowed namespace got through. Workloads run as non-root, with read-only filesystems, under the `restricted` Pod Security level.

## 5. Secrets stay out of Git

The Slack webhook URL is a credential, so it lives in one ignored local file. Alertmanager reads it from that file each time it sends, so it never appears in Git or in a config map, and it can be changed without a restart. Alertmanager also redacts it in its own logs.

## 6. Availability: failing safe, and noticing

- **The payment path survives a broker outage.** With Kafka stopped, payments kept succeeding, and the five events from that window were delivered once Kafka came back.
- **A dead pod is replaced fast.** A deleted router pod came back in 11 seconds. With one replica that shows recovery, not zero downtime; production needs at least two.
- **The checker is checked.** If reconciliation can't run, `ReconciliationFailing` and `ReconciliationStale` fire, and known findings stay visible rather than looking fixed.
- **Alerts on what customers feel:** a 99.5% provider availability target, with a fast alert when the error budget burns 14.4 times too fast and a slow one at 6 times.

## What's still missing

I'd rather list these than have someone find them:

- **The signing key is a local file.** The CI workflow signs keyless instead, but it hasn't run yet because the repo has no remote.
- **Only this project's images are verified.** Hyperswitch, Argo CD and Kyverno images aren't checked.
- **The reconciler's API key is a plain Kubernetes Secret,** created by hand. Next step: External Secrets with a real secrets manager.
- **Nothing alerts when Slack fails,** because that alert would go through the same broken channel. A second channel or an external dead man's switch fixes that.
- **Kyverno's `ClusterPolicy` is deprecated** in 1.19 in favour of `ImageValidatingPolicy`, and needs migrating.

## Why this matters

Payment platforms get attacked through their supply chain and their operators as often as through their front door. Each control above is small. Together they mean that what runs is what was reviewed, and when something fails, a person hears about it.
