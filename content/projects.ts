/**
 * Every project surface (the /projects grid, /projects/[slug], the resume
 * page) reads from this one module. Add or edit a project here and it shows
 * up everywhere; nothing else knows the shape of a project.
 */

export type ProjectStatus = 'shipped' | 'in-progress' | 'in-design';
export type ProjectKind = 'lab' | 'platform' | 'architecture';

export interface ProjectDecision {
  title: string;
  why: string;
}

export interface Project {
  slug: string;
  title: string;
  /** one line under the title, lowercase mono */
  tagline: string;
  status: ProjectStatus;
  kind: ProjectKind;
  /** when the work was done / started; free text */
  period: string;
  /** 1–2 sentences for the grid card and <meta description> */
  summary: string;
  stack: string[];
  links: {
    github?: string;
    /** path under /public — an archify page embedded with ?embed=1&theme= */
    diagram?: string;
    /** in-site or external demo */
    demo?: string;
    /** the repo this was modelled on, if any */
    inspiredBy?: { label: string; url: string };
  };
  /** what it is for — the reason the project exists, in plain words */
  purpose: string[];
  /** monospace ASCII picture; rendered in a <pre> */
  ascii?: string;
  /** the design decisions, each with the reason behind it */
  decisions: ProjectDecision[];
  /** practices the project demonstrates, one line each */
  practices: string[];
  /** what was proven, what is not real, what was learned */
  honest: string[];
  /** what comes next, roughly ordered by value */
  next: string[];
}

export const projects: Project[] = [
  // ------------------------------------------------------------------ //
  {
    slug: 'pipeline-lab',
    title: 'Pipeline Lab',
    tagline: 'devsecops delivery pipeline onto kubernetes',
    status: 'shipped',
    kind: 'lab',
    period: 'sep 2026',
    summary:
      'A small app pushed through a real CI/CD pipeline onto EKS with a security gate on each side of the build (SAST, IaC scan, image scan, DAST), secrets from a remote store, and metrics, logs and traces in one Grafana.',
    stack: [
      'Terraform',
      'EKS',
      'ECR',
      'S3',
      'Secrets Manager',
      'GitHub Actions',
      'Helm',
      'Semgrep',
      'Trivy',
      'OWASP ZAP',
      'External Secrets',
      'Prometheus',
      'Loki',
      'Tempo',
      'Grafana',
      'OpenTelemetry',
    ],
    links: {
      github: 'https://github.com/Jeeeiiiiiii/pipeline-lab',
      diagram: '/diagrams/pipeline-lab.html',
    },
    purpose: [
      'The app is four HTTP routes and is beside the point. The pipeline and the platform are the subject: what does it take for a git push to end with a scanned, signed-off, observable version answering on a cluster?',
      'Everything runs on one machine against Floci, a local AWS emulator, on an EKS cluster Terraform creates there. The pipeline is a GitHub Actions workflow executed by a self-hosted runner, so the same Terraform and the same stage scripts apply to a real account once the emulator endpoints are removed.',
    ],
    ascii: ` git push                       GitHub Actions  (self-hosted runner, in a container)
    │      ┌──────────┬────────────┬─────────┬──────────────┬──────┬────────┬──────────┬─────────┐
    └─────▶│ semgrep  │ trivy      │ docker  │ trivy image  │ push │ helm   │ zap      │ publish │
           │ SAST     │ IaC scan   │ build   │ SBOM + vulns │ ECR  │ deploy │ DAST     │ S3      │
           └──────────┴─────┬──────┴─────────┴──────┬───────┴───┬──┴───┬────┴────┬─────┴────┬────┘
                      gate: CRITICAL          gate: CRITICAL    │      │         │          │
                                              with a fix        ▼      ▼         ▼          ▼
   AWS ───────────────────────────────────────────────────────────────────────────────────────
   ┌────────┐  ┌──────────────┐  ┌───────────────────────────────────────────────────┐  ┌──────┐
   │  ECR   │  │ Secrets Mgr  │  │  EKS                                              │  │  S3  │
   │ app:   │  │ app/api-key  │  │  ┌──────────┐   ┌─────────────┐  ┌─────────────┐  │  │ SBOM │
   │ <sha>  │──│ grafana/adm  │──│─▶│ external │──▶│ app (Helm)  │◀─│ ingress-    │◀─│  │ SAST │
   └────────┘  │ dast/token   │  │  │ secrets  │   │             │  │ nginx       │  │  │ DAST │
               └──────────────┘  │  └──────────┘   └──┬───┬───┬──┘  └─────────────┘  │  │ IaC  │
                                 │      metrics ◀──────┘   │   └──────▶ traces         │  └──────┘
                                 │  ┌────────────┐  ┌──────▼─────┐  ┌────────────┐    │
                                 │  │ Prometheus │  │ Loki       │  │ Tempo      │    │
                                 │  │ Alertmgr   │  │ (Promtail) │  │ (OTLP)     │    │
                                 │  └─────┬──────┘  └──────┬─────┘  └──────┬─────┘    │
                                 │        └───────────────▶ Grafana ◀──────┘          │
                                 └───────────────────────────────────────────────────┘`,
    decisions: [
      {
        title: 'Thin workflow, thick scripts',
        why: 'pipeline.yml only names stages; each stage is a script in scripts/ci/. The same stage runs identically on a push, in the toolbox container, and in a terminal. When a stage fails you re-run that script, not the workflow.',
      },
      {
        title: 'Two gates, both on CRITICAL',
        why: 'IaC misconfigurations fail at CRITICAL; image vulnerabilities fail at CRITICAL with a fix available. HIGH is reported, not blocking. A gate tuned to zero findings gets disabled within a week; a CRITICAL with a fix is the case nobody argues about. PLANT_VULN=1 proves both gates fire.',
      },
      {
        title: 'Images in ECR, everything else in S3',
        why: 'Immutable tags, the tag is the commit SHA. The image is what is deployed; the SBOM and reports are what is known about it. A versioned bucket keyed by tag keeps both sets when a commit is re-run.',
      },
      {
        title: 'Secrets in Secrets Manager, pulled by External Secrets',
        why: 'Terraform generates them; ESO writes them into Kubernetes Secrets. No secret in git, values files, or the image. Adding one is a Terraform resource plus one line in values.yaml.',
      },
      {
        title: 'Grafana is the only UI',
        why: 'Prometheus, Loki and Tempo behind it, with a log line linking to its trace and a trace linking to its logs. The app emits all three itself: /metrics, JSON logs with a trace_id, OTLP spans.',
      },
      {
        title: 'The app ships its own dashboard and alert rule',
        why: 'A ConfigMap and a PrometheusRule live in the app chart. The platform never changes when an app is added; the app declares what "healthy" means for itself.',
      },
      {
        title: 'Deploy only accepts a tag push actually published',
        why: 'After a gated scan run, deploy once tried to roll out an image the gate had refused to push and hung on ImagePullBackOff. Now push.sh writes pushed.txt and deploy.sh refuses to run without it.',
      },
    ],
    practices: [
      'Shift-left security: Semgrep (p/python, p/secrets, p/dockerfile) and Trivy config before the build; Trivy image + CycloneDX SBOM after; ZAP baseline against the running deployment.',
      'Accepted findings are recorded, not silenced: .trivyignore.yaml carries each exception with its reason.',
      'Hardened pod spec: read-only root filesystem (with an emptyDir at /tmp after gunicorn crashed without one), non-root, probes and resource limits from values.',
      'Contract in one place: port, health path, metrics path and secrets are read from values.yaml by every template.',
      'Pull requests run through image-scan and stop; pushes to main run everything, including the smoke test through the ingress.',
    ],
    honest: [
      'Verified end to end: all eight stages in the runner image, both gates proven to fail on a planted vulnerability, one request\'s trace id found in the pod log, in Loki and in Tempo, the error-rate alert going pending → firing.',
      'What the scanners actually found on the first runs: an EKS control-plane security group with egress to 0.0.0.0/0 (fixed), an unencrypted S3 bucket (now SSE-KMS), three CRITICAL CVEs in the python:3.12-slim base (fixed with apt-get upgrade), five missing response headers flagged by ZAP (fixed in the app).',
      'Not real locally: no load balancer (the ingress is a NodePort), static test credentials instead of IRSA, and the GitHub → runner hop was written but not exercised until the repo has a remote.',
    ],
    next: [
      'Sign what ships: cosign in push.sh and a Kyverno verifyImages policy so an unsigned image cannot start.',
      'A staging namespace deployed from pull requests to a PR-specific URL, with main promoting to prod.',
      'Pull-based delivery: Argo CD watching a deploy/ directory the pipeline commits the new tag into, so the pipeline never holds cluster credentials.',
      'Route the alert somewhere real (Alertmanager receiver), and an HPA under k6 load to make the dashboard earn its keep.',
    ],
  },

  // ------------------------------------------------------------------ //
  {
    slug: 'mesh-lab',
    title: 'Mesh Lab',
    tagline: 'istio on a private eks cluster',
    status: 'shipped',
    kind: 'lab',
    period: 'sep 2026',
    summary:
      'A private EKS cluster behind an NLB with Istio inside it. Shows how a service mesh shapes traffic without touching app code: weighted splits, mTLS between pods, and "who may call whom" policies enforced at the proxy.',
    stack: ['Terraform', 'EKS', 'NLB', 'Istio', 'Envoy', 'Helm', 'kubectl'],
    links: {
      github: 'https://github.com/Jeeeiiiiiii/mesh-lab',
      diagram: '/diagrams/mesh-lab.html',
    },
    purpose: [
      'The application is three sample services and is beside the point; the infrastructure and the mesh are the subject. What does the network look like when the cluster has no public addresses, and what does a mesh add once every pod has a sidecar?',
      'Terraform builds the VPC, subnets, NAT, security groups, IAM, EKS, NLB and a bastion for a real account; the only thing pointing it at the emulator is one endpoints block.',
    ],
    ascii: `                         VPC 10.0.0.0/16
   ┌──────────────────────────────────────────────────────────────┐
   │  public (1a)                  public (1b)                    │
   │  ┌──────────┐ ┌─────────┐    ┌─────────┐                     │
   │  │ bastion  │ │   NAT   │    │         │  ◄── NLB :80        │◄── internet
   │  └────┬─────┘ └────┬────┘    └─────────┘        │            │
   │       │ 443        │ egress                     │ 30080      │
   │  ─────┼────────────┼────────────────────────────┼──────────  │
   │       ▼            ▼                            ▼            │
   │  private (1a)                 private (1b)                   │
   │  ┌─────────────────────────────────────────────────────────┐ │
   │  │ EKS  ┌─────────────┐  ┌────────────┐  ┌──────────────┐  │ │
   │  │      │ ingress-gw  │─►│ helloworld │  │ httpbin      │  │ │
   │  │      │  (Envoy)    │  │ v1 90/v2 10│  │ GET-only ACL │  │ │
   │  │      └─────────────┘  └────────────┘  └──────────────┘  │ │
   │  │                         ▲ mTLS ▲          ▲ mTLS        │ │
   │  │      ┌─────────┐        └───────┴──────────┘            │ │
   │  │      │ istiod  │        ┌─────────┐                     │ │
   │  │      └─────────┘        │ sleep   │ (curl client)       │ │
   │  └─────────────────────────┴─────────┴─────────────────────┘ │
   └──────────────────────────────────────────────────────────────┘`,
    decisions: [
      {
        title: 'The cluster has no public addresses',
        why: 'endpoint_public_access = false. It gets out via one NAT gateway and is reached only through the NLB; kubectl goes through a bastion in a public subnet. Two AZs because an NLB and EKS both refuse fewer.',
      },
      {
        title: 'NLB, not ALB',
        why: 'The mesh wants the raw connection and terminates HTTP itself. The NLB hands TCP to the Istio ingress gateway on a NodePort.',
      },
      {
        title: 'Security groups reference each other, not CIDRs',
        why: 'bastion → cluster, nlb → node, cluster → node. The rule that matters for Istio: control plane → nodes on 1025–65535, because the API server calls the istiod injection webhook on 15017. Block that and every pod in an injected namespace fails admission.',
      },
      {
        title: 'Sidecar mode, three official Helm charts',
        why: 'base, istiod, gateway. Every pod in the demo namespace gets an Envoy proxy that owns all of its traffic. Four small resources then do the work: Gateway + VirtualService, DestinationRule, PeerAuthentication, AuthorizationPolicy.',
      },
    ],
    practices: [
      'Traffic splitting with no restarts: /hello routes 90% v1 / 10% v2 by pod label subsets; change the weights, re-apply, done.',
      'Mesh-wide STRICT mTLS: sidecars refuse any inbound that is not mTLS from another sidecar. The app never added a certificate.',
      'Authorization at the proxy: only sleep and the ingress gateway may call httpbin, and only GET. A POST gets 403 before the app sees the request.',
      'Outlier detection on the DestinationRule so a failing pod is ejected from the pool.',
      'A demo script that proves every claim: 50 requests → ~45 v1 / ~5 v2; X-Forwarded-Client-Cert carrying both SPIFFE identities; the 403s.',
    ],
    honest: [
      'Real locally: EKS is an actual k3s cluster the emulator runs, the bastion is an actual Amazon Linux container with its user data executed, and Istio, the sidecars, mTLS and the policies are genuinely running.',
      'Not real locally: the NLB is metadata (the demo port-forwards to the ingress gateway instead), the node group is one node, and security groups are created but not enforced by the emulator.',
      'Learned the hard way: an NLB delete makes the provider poll an API the emulator answers with a 500; the default 25 retries turn one resource into a half-hour hang. max_retries = 2 fixes it locally and must be removed for a real account.',
    ],
    next: [
      'Register the nodes into the NLB for real with the AWS Load Balancer Controller and a TargetGroupBinding.',
      'Ambient mode: same policies, no sidecars; compare the pod list before and after.',
      'Egress control: outboundTrafficPolicy REGISTRY_ONLY, then a ServiceEntry and an egress gateway for one host.',
      'Progressive delivery: Argo Rollouts driving the VirtualService weights from a Prometheus success-rate query.',
    ],
  },

  // ------------------------------------------------------------------ //
  {
    slug: 'order-lab',
    title: 'Order Lab',
    tagline: 'accept now, notify later',
    status: 'shipped',
    kind: 'lab',
    period: 'sep 2026',
    summary:
      'An order API on EC2 behind an ALB, Postgres as the system of record, a queue between accepting an order and notifying the customer, a Lambda that does the notifying, and CloudWatch watching all of it — with a dead-letter queue and an alarm for when it goes wrong.',
    stack: ['Terraform', 'ALB', 'EC2', 'Docker', 'ECR', 'RDS Postgres', 'SQS', 'Lambda', 'CloudWatch', 'Flask', 'boto3'],
    links: {
      github: 'https://github.com/Jeeeiiiiiii/order-lab',
      diagram: '/diagrams/order-lab.html',
    },
    purpose: [
      'One decision, and everything else follows from it: accepting an order and notifying the customer are separate. The API writes the order, puts a message on the queue, and answers. It never knows whether the notification went out.',
      'If the notifier is broken, orders still get accepted, messages wait, and after three failed attempts they land in a dead-letter queue where an alarm is watching.',
    ],
    ascii: `                                  VPC 10.1.0.0/16
   ┌───────────────────────────────────────────────────────────────────┐
   │  public (1a, 1b)                  private (1a, 1b)                │
   │  ┌───────────────┐   :8080   ┌──────────────────┐                 │
   │  │  ALB  :80     │──────────▶│  EC2  order-api  │                 │
   │  └───────────────┘           │  (Docker, ECR)   │                 │
   │         ▲                    └───┬──────────┬───┘                 │
   │         │ internet        :5432  │          │  SendMessage        │
   │         │                        ▼          ▼                     │
   │  ┌───────────────┐        ┌──────────┐  ┌───────────┐  3 fails   │
   │  │  NAT gateway  │        │   RDS    │  │ SQS orders│───────────┐ │
   │  └───────────────┘        │ Postgres │  └─────┬─────┘           │ │
   │                           └──────────┘        │ event source    ▼ │
   │                                               ▼          ┌─────────┐
   │                                     ┌──────────────────┐ │   DLQ   │
   │                                     │ Lambda  notify   │ └─────────┘
   │                                     └──────────────────┘   (alarm) │
   └───────────────────────────────────────────────────────────────────┘
                     │ logs (awslogs driver / Lambda)   │ metrics
                     ▼                                  ▼
             CloudWatch:  /order-lab/api   /aws/lambda/order-lab-notify
                          OrdersCreated  NotificationsSent  NotificationsFailed
                          alarms: dlq-not-empty, notification-failures`,
    decisions: [
      {
        title: 'Three tiers, each admitting only the tier in front of it',
        why: 'alb → app → db security groups by group reference. The ALB is the only public address. The database admits 5432 from the API group only and has no egress rule at all.',
      },
      {
        title: 'The Lambda is pulled, not called',
        why: 'An SQS event source mapping, not an HTTP call from the API. Visibility timeout longer than the Lambda timeout; redrive to a DLQ after three receives. Per-message failure reporting so one bad order does not fail its batch.',
      },
      {
        title: 'No agent on the instance',
        why: 'The API container ships structured JSON logs through Docker\'s awslogs driver straight into CloudWatch. The Lambda has its own log group. Both are filterable by the same trace_id.',
      },
      {
        title: 'Immutable instances',
        why: 'A new image means a new instance that pulls it at boot. Nothing is edited in place; the rollout is terraform apply -replace. An Auto Scaling group would do this for you; here it is done by hand so the mechanism is visible.',
      },
    ],
    practices: [
      'A trace id minted by the API, carried in SQS message attributes, logged by the Lambda — grep one id across both log groups and you have the trace.',
      'Custom metrics (OrdersCreated, NotificationsSent, NotificationsFailed) and two alarms, one on a custom metric and one on the DLQ depth.',
      'Least-privilege IAM: the instance role can pull an image, send to one queue and write logs/metrics; the Lambda role can consume one queue and write logs/metrics.',
      'A demo script that walks one order end to end and then places a poison order and watches it reach the DLQ and trip the alarm.',
    ],
    honest: [
      'Real locally: the instance is a real Amazon Linux container executing its user data; RDS is a real Postgres 16; SQS, the Lambda, the event source mapping and the DLQ redrive genuinely work; the custom-metric alarm really goes to ALARM.',
      'Not real locally: the ALB forwards nothing (a socat container stands in for it), the AWS/SQS metrics are not published so the DLQ alarm never sees a datapoint, and the DB password travels through user data — gap number one on the fix list.',
      'Stated plainly in the README: what a production system adds on each observability pillar (Logs Insights, the AWS-published metrics, X-Ray or Dynatrace, an SNS action and a composite alarm).',
    ],
    next: [
      'Take the password out of user data: Secrets Manager + secretsmanager:GetSecretValue in the instance role.',
      'Replace -replace with an Auto Scaling group and an instance refresh on image change.',
      'Drop the NAT gateway for VPC endpoints (ECR, SQS, CloudWatch Logs, Secrets Manager).',
      'Real traces with X-Ray, and put the whole thing through pipeline-lab\'s stages unchanged.',
    ],
  },

  // ------------------------------------------------------------------ //
  {
    slug: 'finops-agent',
    title: 'FinOps Agent',
    tagline: 'an agent that explains the bill, not just reports it',
    status: 'in-design',
    kind: 'architecture',
    period: 'sep 2026 — designing',
    summary:
      'An autonomous cost-anomaly investigator for AWS: a scheduled agent that detects a spend spike, correlates it with what changed in the account, asks a model to explain the likely cause, and posts to Slack only when something is actually wrong.',
    stack: ['Python', 'Lambda', 'EventBridge', 'Cost Explorer', 'CloudTrail', 'Athena', 'Bedrock', 'Claude', 'Slack', 'Terraform'],
    links: {
      inspiredBy: {
        label: 'AnuragJosyula/autonomous-finops-agent',
        url: 'https://github.com/AnuragJosyula/autonomous-finops-agent',
      },
    },
    purpose: [
      'Cost dashboards tell you that spend went up. The question on a Monday morning is why — which service, since when, and what deploy or config change lines up with it. That is an investigation, and investigations are what an agent loop is good at.',
      'The design is read-only by construction: the agent can look at cost data and audit logs, and can talk; it cannot change anything. Its worst case is a wrong paragraph in Slack, not a deleted resource.',
    ],
    ascii: `   EventBridge (daily)
         │
         ▼
   ┌───────────────────────────── Lambda: finops-agent (Python) ─────────────────────────────┐
   │                                                                                          │
   │   1. detect_spikes ──▶ Cost Explorer: daily cost by service, 7-day baseline              │
   │        │               flag: > 25% over baseline, or a service that did not exist        │
   │        ▼                                                                                 │
   │   2. cost_timeseries ──▶ per-service daily series for the flagged ones                   │
   │        │               (CUR mode: Athena over the usage report, resource-level)          │
   │        ▼                                                                                 │
   │   3. recent_changes ──▶ CloudTrail LookupEvents: write calls in the window,              │
   │        │               who / what / when, filtered to the spiking service                │
   │        ▼                                                                                 │
   │   4. explain ──▶ Bedrock (Claude, tool use): the model drives 1–3 as tools,              │
   │        │         ends with cause, confidence, and a recommended action                   │
   │        ▼                                                                                 │
   │   5. notify ──▶ Slack webhook, only if an anomaly survived; findings archived to S3      │
   └──────────────────────────────────────────────────────────────────────────────────────────┘
        IAM: ce:Get*, cloudtrail:LookupEvents, athena:*Query*, s3 read on the CUR bucket, bedrock:InvokeModel
             — no mutating permission anywhere`,
    decisions: [
      {
        title: 'Agentic, not scripted',
        why: 'The model drives the investigation through tool use rather than a fixed if/else tree. A spike in Lambda cost and a spike in NAT gateway cost need different follow-up questions; the tools stay small and the model decides which to ask.',
      },
      {
        title: 'Two cost modes',
        why: 'Cost Explorer needs zero setup and answers "which service". The Cost & Usage Report queried through Athena answers "which resource", at the price of a bucket and a Glue table. Start with the first; switch on the second when the question gets specific.',
      },
      {
        title: 'Thresholds are relative and explicit',
        why: '25% over a 7-day rolling baseline, or an absolute floor for a service that had no history. Both numbers live in configuration, not in the prompt, so they can be tuned without touching the model.',
      },
      {
        title: 'Quiet by default',
        why: 'No anomaly, no message. A daily "everything is fine" post trains people to ignore the channel. Findings are archived to S3 either way so the history exists.',
      },
      {
        title: 'Read-only IAM as the safety model',
        why: 'The agent recommends; a human acts. The role has no permission that can change state, so prompt injection through a resource tag or a CloudTrail event name cannot become an action.',
      },
      {
        title: 'Terraform, and a real account',
        why: 'Cost Explorer and CloudTrail have no emulator, so unlike the labs this runs against a real account. Terraform rather than a CloudFormation template so it matches the rest of the portfolio, with a cost ceiling on the Bedrock calls.',
      },
    ],
    practices: [
      'Small, single-purpose tools with typed inputs and outputs, so the model\'s context stays short and the tool results are easy to test without a model.',
      'Dedupe per service per day so a multi-day spike does not page every morning.',
      'Every alert carries its evidence: the numbers, the CloudTrail events it correlated, and the model\'s stated confidence.',
      'Serverless and cheap: a daily Lambda and a handful of Bedrock calls, on the order of a few dollars a month.',
    ],
    honest: [
      'This is at the architecture stage. The design above is what will be built; the repository will follow once the first end-to-end run works against a real account.',
      'Modelled on AnuragJosyula/autonomous-finops-agent, credited in the links. The differences are Terraform instead of CloudFormation, findings archived to S3, and the read-only IAM framing made explicit.',
    ],
    next: [
      'Build the four tools and a runner that exercises them without a model.',
      'First end-to-end run in Cost Explorer mode against a real account.',
      'CUR + Athena mode for resource-level attribution.',
      'A weekly digest mode alongside the daily anomaly check.',
    ],
  },

  // ------------------------------------------------------------------ //
  {
    slug: 'visitor-playground',
    title: 'Visitor Playground',
    tagline: 'this site\'s gitops guestbook',
    status: 'in-progress',
    kind: 'platform',
    period: 'may 2026 — present',
    summary:
      'A guestbook where every card arrives as a pull request. A visitor fills a form on the staging site, a GitHub App opens a PR against main, CI checks it, a preview deploys, and merging it publishes the card — content as code, reviewed like code.',
    stack: ['Next.js', 'TypeScript', 'zod', 'GitHub App', 'Octokit', 'GitHub Actions', 'Vercel', 'Cloudflare Turnstile', 'Upstash Redis'],
    links: {
      github: 'https://github.com/Jeeeiiiiiii/portfolio',
      demo: '/visitors',
    },
    purpose: [
      'A portfolio should demonstrate the workflow it claims, not just list it. This feature lets a visitor trigger a real GitOps flow — branch, commit, pull request, CI, preview environment, review, merge, deploy — and watch each step light up.',
      'The write path is deliberately narrow: the only file a visitor PR may touch is content/visitors.json, enforced in code and again by a CI check on the PR.',
    ],
    ascii: `   visitor on staging /visitors
        │  form + Turnstile token
        ▼
   POST /api/visitors/submit
     validate (zod) ─▶ verify captcha ─▶ rate limit ─▶ moderate ─▶ GitHub App
                                                                      │
                                                    branch visitor/<id>
                                                    commit content/visitors.json
                                                    open PR → main  (label: visitor-submission)
                                                                      │
        ┌────────────── GET /api/visitors/status?pr=N ◀──────────────┘
        │   checks (CI + path guard) · preview URL (Vercel) · merged?
        ▼
   the page shows the PR moving: opened → checks → preview → review → merged → live`,
    decisions: [
      {
        title: 'Content is a JSON file in git, not a database',
        why: 'The point is the review. A row in a database has no diff, no CI, no preview, no approval. A JSON file has all four for free.',
      },
      {
        title: 'A GitHub App, not a personal token',
        why: 'Installed on one repository with write access to contents and pull requests, and read access to checks, deployments and statuses so the page can show the PR moving. The private key lives in a Vercel environment variable; the app can only write one path, enforced in lib/visitors/github.ts and verified by the visitor-pr-guard workflow.',
      },
      {
        title: 'Submissions only off production',
        why: 'The form renders on staging and preview deploys; production shows the same page read-only. Production is the demo surface where merged cards appear, staging is the sandbox.',
      },
      {
        title: 'Auto-PR every submission, no moderation queue',
        why: 'Spam control happens at submit time: Turnstile, rate limit (1/min, 5/day per IP), a profanity filter, and a link allowlist. Review happens on GitHub, where the owner already lives. Stale visitor PRs close themselves after 7 days.',
      },
      {
        title: 'One deep module behind a thin route',
        why: 'submitVisitorCard() does validate → captcha → rate-limit → moderate → PR and returns a result union. The route handler only maps that to HTTP. Every step can be tested through that one function with fake adapters.',
      },
    ],
    practices: [
      'Branch protection on main: CI and the path-guard check must pass, one approving review, no force pushes.',
      'CI on every PR: lint, typecheck, build. A visitor PR that touches anything but content/visitors.json fails the guard.',
      'The same zod schema validates the client form, the API request, and the JSON file at build time.',
      'Secrets never logged; the captcha token and rate-limit identity never leave the server.',
    ],
    honest: [
      'Read path, schema, CI and guards have been in place since May 2026; the write path (GitHub App, captcha, rate limit, PR status) is wired in code and turns on once the external setup — App credentials, Turnstile keys, Upstash — is added as environment variables.',
      'Until then the form shows a "submissions open soon" state and the pipeline diagram on the page explains the flow.',
    ],
    next: [
      'Finish the external setup and run the first end-to-end submission on staging.',
      'Discord webhook on PR opened / merged so review does not depend on checking GitHub.',
      'Reuse the same pipeline for model-card submissions as an MLOps showcase.',
    ],
  },

  // ------------------------------------------------------------------ //
  {
    slug: 'patient-monitoring',
    title: 'Patient Monitoring System',
    tagline: 'two-tier aws with terraform, qr-coded records',
    status: 'shipped',
    kind: 'platform',
    period: '2024 — 2025',
    summary:
      'A patient monitoring system where a QR code on the wristband opens the patient\'s record, deployed on a two-tier AWS architecture provisioned with Terraform: application tier in public subnets, database tier in private ones.',
    stack: ['AWS', 'Terraform', 'EC2', 'RDS', 'VPC', 'PHP', 'MySQL'],
    links: {},
    purpose: [
      'The capstone project: a working application and the infrastructure under it, both written down as code so the environment could be rebuilt from nothing.',
    ],
    decisions: [
      {
        title: 'Two tiers, two subnets',
        why: 'The application layer and the database layer are separated so each can be scaled and secured on its own. The database has no public address.',
      },
      {
        title: 'Terraform for everything',
        why: 'VPC, subnets, security groups, EC2 and RDS are all declared. Standing the environment up again is one apply, not a checklist.',
      },
    ],
    practices: [
      'Infrastructure as code from day one, with the write-up published as a blog post.',
      'Application delivery through a GitOps-style flow so deploying a change did not mean logging into the box.',
    ],
    honest: [
      'This is where the labs started: the blog post on deploying a two-tier architecture with Terraform came out of this project.',
    ],
    next: [],
  },
];

export const projectSlugs = projects.map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const statusLabel: Record<ProjectStatus, string> = {
  shipped: 'shipped',
  'in-progress': 'in progress',
  'in-design': 'in design',
};

export const kindLabel: Record<ProjectKind, string> = {
  lab: 'lab',
  platform: 'platform',
  architecture: 'architecture',
};
