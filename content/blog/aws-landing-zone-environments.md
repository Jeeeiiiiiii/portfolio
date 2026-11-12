---
title: "An AWS landing zone: how dev, staging and production stay apart"
date: 2026-11-11
excerpt: Most teams start with one AWS account and regret it. These are my notes on how a landing zone separates environments into accounts, how engineers get access, which guardrails stop mistakes, and how a release moves from dev to production without anyone holding production keys.
tags: [AWS, Security, Control Tower, Platform Engineering]
kind: notes
---

*What you'll get: what a landing zone is, how to lay out accounts for dev, staging and production, how access and guardrails work, and how releases get promoted between them.*

A note on where this comes from: my labs run against a local AWS emulator, and I haven't set up Control Tower for a real organisation of my own. This post is built from AWS's documentation and prescriptive guidance, written as the design I'd propose. Details are as of November 2026.

## The problem, in plain words

Picture a company with one AWS account. Developers test there, the production database lives there, and the CI pipeline has admin rights there. One wrong `terraform destroy`, one leaked key, or one developer experimenting in the wrong region, and production is hit.

A **landing zone** is the starting layout that prevents this: many AWS accounts instead of one, each with a clear job, shared rules applied from the top, central logging, and one place where people sign in. **AWS Control Tower** is AWS's managed service for setting one up.

## Why accounts, not just separate VPCs or tags

If you know Kubernetes namespaces, an AWS account is closer to a whole separate cluster:

- **An account is a hard wall.** Nothing in the dev account can touch production unless someone explicitly allows it.
- **Mistakes stay small.** A broken IAM policy in dev breaks dev.
- **Costs are clear.** Each account has its own bill.
- **Rules can differ.** Developers can have broad rights in dev and read-only in production.

## The layout

```diagram
landing-zone-accounts
The management account handles billing and Control Tower only, with no workloads. Under it: a Security OU with the Log Archive account (every account's CloudTrail and Config logs) and the Audit account (GuardDuty, Security Hub); an Infrastructure OU with the Network account (Transit Gateway, shared VPCs, DNS) and Shared Services (CI/CD, ECR); a Workloads OU with a NonProd OU (dev and staging accounts) and a Prod OU (prod account); and a Sandbox OU for personal experiments with a strict budget and no connection to the rest.
```

An **OU** (organizational unit) is a folder of accounts that share rules. Control Tower creates the Security OU with its Log Archive and Audit accounts. The rest you add in AWS Organizations.

Two rules of thumb from AWS's guidance and others: design OUs around **policy boundaries**, not the org chart, and keep the tree shallow, because rules add up as you go down and deep trees are hard to reason about during an incident.

## How engineers get access

Nobody gets an IAM user with a long-lived key. People sign in once through **IAM Identity Center**, connected to the company's identity provider, and pick an account and a role.

Access is a **permission set** (a role template) given to a **group** on specific **accounts**:

| Group | Dev | Staging | Prod |
|---|---|---|---|
| Developers | PowerUser | ReadOnly + deploy logs | ReadOnly |
| Platform team | Admin | Admin | Operator (no IAM changes) |
| On-call | ReadOnly | ReadOnly | Incident role, time-limited |
| Auditors | ReadOnly | ReadOnly | ReadOnly |

Production changes go through the pipeline, not through people's consoles. For emergencies there's a separate **break-glass** role, logged and alarmed every time it's used.

## Guardrails: what nobody can do

**Service control policies (SCPs)** set the maximum any role in an account can do, even an admin. They don't grant anything; they cap it. Typical ones:

- Don't leave the organization.
- Don't use regions we don't operate in.
- Don't turn off CloudTrail, GuardDuty or Config.
- Don't use the root user.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyOutsideAllowedRegions",
    "Effect": "Deny",
    "NotAction": ["iam:*", "organizations:*", "sts:*", "support:*"],
    "Resource": "*",
    "Condition": {
      "StringNotEquals": { "aws:RequestedRegion": ["ap-southeast-1", "ap-southeast-2"] }
    }
  }]
}
```

`NotAction` leaves global services like IAM alone, since they don't live in a region. AWS's own example lists more of them (CloudFront, Route 53 and others); use that list in a real account. Everything else outside the two allowed regions is denied, for every role in every account under this OU.

**Resource control policies (RCPs)**, added in late 2024, cap the other side: what can be done *to* your resources. The common one is a data perimeter: S3 buckets and other resources only accept access from principals in your own organization (`aws:PrincipalOrgID`), so a misconfigured bucket policy can't open data to the world.

**Control Tower controls** add three kinds of checks: preventive (SCP-based), detective (AWS Config rules that flag drift), and proactive (CloudFormation hooks that stop non-compliant resources before they're created).

SCP mistakes cause outages, so guardrails are code: kept in Git, reviewed, tested with the IAM policy simulator, and rolled out to Sandbox, then NonProd, then Prod.

## How the environments connect

- **Network:** each environment has its own VPCs. A Transit Gateway in the Network account connects what needs connecting, with route tables that keep dev from reaching production. IPAM hands out address ranges so they never overlap.
- **Logs:** every account sends CloudTrail and Config to the Log Archive account, where even admins of the workload accounts can't delete them.
- **Security findings:** GuardDuty and Security Hub are run from the Audit account for the whole organization.

## How a release is promoted

```diagram
landing-zone-delivery
A git push starts CI in Shared Services, which uses GitHub OIDC and stores no keys. It builds the image once, tags it by commit, signs it and stores it in ECR. Deploys to dev and staging each assume that account's deploy role, deploy and run tests; production needs an approval first, then assumes its deploy role and deploys.
```

1. **Build once.** The pipeline builds the image a single time and stores it in a shared ECR registry. Every environment runs that exact image, by digest. What passed staging is byte for byte what reaches production.
2. **No stored keys.** GitHub Actions gets short-lived AWS credentials through OIDC. There is no access key to leak.
3. **One deploy role per account.** Each environment account has a role that only the pipeline can assume, with only the rights needed to deploy.
4. **Production needs approval.** A protected environment in the pipeline requires a named approver before the prod role is assumed.
5. **Configuration differs, the artifact doesn't.** Environment settings come from each account's own Parameter Store or Secrets Manager, never baked into the image.

## New accounts on demand

Control Tower's **Account Factory** creates new accounts with the baseline already applied. **Account Factory for Terraform (AFT)** does the same from a pull request, so a new team's account is a reviewed file in Git, like everything else.

## What's new to know

Landing zone version 4.0 (November 2025) made integrations that used to be always on, like AWS Config and the organization CloudTrail, optional. It also allows using Control Tower just for its managed controls on an existing organization. That makes it easier to adopt in a company that already has accounts.

## From this design to a real rollout

| Step | What to watch |
|---|---|
| Enable Control Tower in a fresh management account | Nothing else should run there |
| Add Infrastructure, Workloads and Sandbox OUs | Keep it shallow |
| Connect Identity Center to the identity provider | Groups, not individual users |
| Apply SCPs to Sandbox first | Test with the policy simulator before NonProd and Prod |
| Move the pipeline to OIDC and per-account deploy roles | Delete the old access keys |

## FAQ

**Is Control Tower required?** No. You can build the same with Organizations and Terraform. Control Tower saves time and keeps the baseline maintained, but it has upgrades of its own to plan for.

**One account per environment, or per team per environment?** Start with one per environment. Split by team when teams need different rules or separate bills.

**Can developers still debug production?** Yes, with read-only access and logs. Changes go through the pipeline.

## Why this matters

A landing zone turns "please be careful in production" into rules the platform enforces. The blast radius of any mistake shrinks to one account, every action is logged somewhere nobody can erase, and releases reach production the same way every time.

## Links

- [AWS Prescriptive Guidance: designing a Control Tower landing zone](https://docs.aws.amazon.com/pdfs/prescriptive-guidance/latest/designing-control-tower-landing-zone/designing-control-tower-landing-zone.pdf)
- [Planning and implementing your landing zone](https://aws-samples.github.io/cloud-operations-best-practices/docs/guides/AWS%20Control%20Tower/planning-your-landing-zone/)
- [Control Tower document history (landing zone 4.0)](https://docs.aws.amazon.com/controltower/latest/userguide/doc-history.html)
