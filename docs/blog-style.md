# How posts are written

The model is Jeffrey Taylor's MLOps series on Medium (jeftaylo.medium.com, mid-2025). His posts work
because they explain **why** before **how**, map every new idea to something a DevOps reader already
knows, and stay readable for a non-technical person (a recruiter or manager) without losing the engineers.
This guide keeps that, drops what doesn't hold up, and adds what reviewers on r/mlops ask for.

## The shape of a project post

Use these sections in order. Rename them to fit the post; skip one only when it truly doesn't apply.

1. **Title + one-line subtitle.** The title names the problem, not the tool list
   ("Why my payment retries could charge a customer twice", not "Hyperswitch + Kafka + Argo CD").
   The italic line under it says what the reader will get. Long topics become a numbered series,
   with the series list at the top of each part.
2. **The problem, in plain words.** Two or three short paragraphs: who has this problem, what it costs
   when it goes wrong, and why I cared. One concrete number if I have a measured one.
3. **Why this is different.** What makes this harder than the usual DevOps version of the problem.
   Map it to what the reader knows: "If you know CI/CD you already have 80% of this; the missing 20% is…".
   Three or four bullets, each one idea, each explained in everyday terms.
4. **The tools, and why each one.** A short table: *what we need* → *tool* → *why this one*
   → *what I didn't pick and why*. "Why not X?" answers belong here or in the FAQ.
5. **Architecture and the flow.** One diagram, then a numbered walk-through: "1. A payment comes in…
   2. … 3. …". Each step says what happens and why it exists. A reader who skips the diagram should
   still follow the story.
6. **The important bits of config or code.** Small, correct snippets with a language on the fence, each
   followed by one sentence on what it does. Link the repo for the rest.
7. **What broke, and how I recovered.** At least one real failure: what I saw, how I found the cause,
   what I changed. Reviewers trust this section more than any diagram.
8. **Results.** Only numbers I measured, with how I measured them (tool, load, hardware). If there is no
   number yet, say what I will measure, not what I hope.
9. **From the lab to a real environment.** A small table: lab piece → what it becomes in production
   (kind → EKS, MinIO → S3, SOPS → Secrets Manager + External Secrets, a mock connector → a real PSP).
   Say what changes and what stays the same.
10. **FAQ.** Three to five questions a manager or interviewer would ask: "Why not Kubeflow?",
    "Do we need a feature store?", "What would this cost on AWS?", "Why not a managed service?".
11. **Why this matters.** The business reason in two or three sentences: money not lost, faster releases,
    fewer 3 a.m. pages, an audit that passes.
12. **Links.** The repo, the docs this post leans on, and the next part of the series.

## Voice

- First person, plain, direct. Short sentences. One idea per paragraph.
- Explain every term the first time it appears, in a few words: "drift (the live data slowly stops
  looking like the training data)".
- Analogies are welcome when they make a mechanism clear; drop them once they stop helping.
- Bold sparingly: a key term once, not whole sentences.
- No hype words: revolutionary, game-changer, dive into, unlock, seamless, enterprise-grade, Fortune 500.
- 1200–2000 words per post. Longer than ~2500 → split into a series.

## What not to copy from the model posts

- **Claims that can't be measured in a lab.** "95% faster deployments" and "zero incidents" mean nothing
  without a before/after and a real team. Only state numbers I measured, and say how.
- **Link stuffing.** Link to my own posts only where the reader needs the background.
- **Outdated tools** (checked November 2026):
  - Seldon Core moved from Apache 2.0 to the Business Source License in January 2024, so production use
    needs a paid licence. Use **KServe** (open source, CNCF incubating since late 2025).
  - MLflow registry **stages** (Staging/Production) are deprecated since MLflow 2.9. Use **aliases**
    (`@champion`, `@challenger`); MLflow 3 adds the LoggedModel concept.
  - **ingress-nginx** was retired in March 2026: no more fixes, including security fixes.
    Use the **Gateway API** (Envoy Gateway, Istio or another implementation).
  - **Evidently 0.7** (April 2025) replaced the old API; examples written for 0.4 no longer run.
  - **Sealed Secrets** is still maintained, but the old Bitnami images moved to `bitnamilegacy`.
    Pin the image, or use SOPS / External Secrets Operator.
  - **DVC** was acquired by lakeFS in November 2025 and continues as open source.
- **Still current:** Kubernetes (k3s/kind for labs), Argo Workflows, Argo CD/Flux, Kustomize,
  MLflow, Prometheus/Grafana, Terraform, Ansible.
- **Worth writing about now:** LLM serving on Kubernetes (KServe LLMInferenceService, llm-d, vLLM, the
  Gateway API Inference Extension), LLM/AI gateways with per-team budgets, evaluation gates in CI,
  AI governance evidence for banks, cost per model, and "managed vs self-hosted" decisions.
  Training-serving skew is still the most common production failure, so show how it's prevented.

## Before publishing — checklist

- [ ] Could a non-technical reader explain the problem and why it matters after the first two sections?
- [ ] Every number is measured, and the post says how.
- [ ] There is a failure-and-recovery section.
- [ ] There is a lab → production table and an FAQ.
- [ ] Tools are current (see the list above), with versions where they matter.
- [ ] Public-content rules: no employer brand names, tickets, hostnames or internal findings.
      Fintech labs say "infrastructure around an existing open-source app", "PCI DSS-inspired"
      (never "compliant"), and "simulated / paper trading only".
- [ ] Frontmatter is valid; add `featured: <n>` only for posts that belong in the home page's top five.
