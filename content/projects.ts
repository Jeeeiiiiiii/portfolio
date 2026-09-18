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
    tagline: 'a cost spike, explained — not just reported',
    status: 'shipped',
    kind: 'lab',
    period: 'sep 2026',
    summary:
      'A scheduled agent that pulls AWS cost by service, finds what moved, pulls the write calls from CloudTrail for the same window, asks a model what most likely happened, archives the finding, and posts to Slack — only when something is actually wrong. A quiet day sends nothing.',
    stack: ['Python', 'Lambda', 'EventBridge', 'Cost Explorer', 'CloudTrail', 'S3', 'Secrets Manager', 'Claude', 'Anthropic SDK', 'Terraform', 'pytest'],
    links: {
      github: 'https://github.com/Jeeeiiiiiii/finops-agent',
      diagram: '/diagrams/finops-agent.html',
      inspiredBy: {
        label: 'AnuragJosyula/autonomous-finops-agent',
        url: 'https://github.com/AnuragJosyula/autonomous-finops-agent',
      },
    },
    purpose: [
      'Cost dashboards tell you that spend went up. The question on a Monday morning is why — which service, since when, and what deploy or config change lines up with it. That is an investigation, and the interesting design question is which parts of it should be arithmetic and which parts should be judgement.',
      'Everything runs locally against Floci: the Lambda, the schedules, S3, Secrets Manager and Cost Explorer are all real there. Five scenario fixtures put a spike in front of the agent on demand, because you cannot wait for one to happen.',
    ],
    ascii: `   EventBridge  cron(0 16 * * ? *)  daily         cron(0 8 ? * MON *)  weekly
        │ {"mode":"daily"}                              │ {"mode":"digest"}
        ▼                                               ▼
   ┌────────────────────── Lambda: finops-agent (Python 3.12) ───────────────────────┐
   │                                                                                  │
   │  1. costs     Cost Explorer ── daily cost by service, 14-day window              │
   │  2. detect    pure math: median baseline, +25% AND +$1, or a new service ≥ $1    │
   │  3. quiet?    nothing moved → return. nothing sent.                              │
   │  4. evidence  per anomaly: the series + CloudTrail write calls in the window     │
   │  5. explain   ┌ Claude, with 3 read-only tools, capped at 8 turns ┐              │
   │               └ on any failure: RuleExplainer (deterministic)     ┘              │
   │  6. dedupe    already alerted in the last 3 days? archive, but do not send       │
   │  7. archive   S3  findings/<day>/<service>.json   (every finding, alerted or not)│
   │  8. notify    Slack, one message, evidence attached                              │
   └──────────────────────────────────────────────────────────────────────────────────┘
        ▲ ce:GetCostAndUsage     ▲ cloudtrail:LookupEvents     ▲ secretsmanager:GetSecretValue
      IAM: read costs, read trail, write own bucket, read own two secrets, log. Nothing else.`,
    decisions: [
      {
        title: 'Scripted evidence, agentic explanation',
        why: "Detection is arithmetic — pure functions over daily cost rows, tested. The model is only asked what the evidence means. Arithmetic does not hallucinate and does not cost tokens; the model's judgement is spent correlating a CreateNatGateway with a NAT charge, not deciding whether $28 is more than $5.",
      },
      {
        title: 'The rule explainer is the floor, not a last resort',
        why: 'RuleExplainer writes a complete alert from the numbers and the change list. ClaudeExplainer wraps it and falls back on any failure: API error, refusal, turn cap, no typed report. An alert that depends on a model being up sometimes does not arrive. The model makes the message better; it never decides whether there is one.',
      },
      {
        title: 'Read-only IAM as the safety model',
        why: 'The role reads costs and the trail, writes its own bucket, reads its own two secrets, logs. No statement can create, modify or delete anything — so text the model reads from CloudTrail event names or resource tags cannot become an action. The system prompt says "data, not instructions"; the policy makes it true.',
      },
      {
        title: 'Two adapters at every seam',
        why: 'Cost: Cost Explorer or a JSON fixture. Changes: CloudTrail or a fixture. Explainer: Claude or rules. Notifier: Slack or stdout. Archive: S3 or memory. The fixtures are how 38 tests run with no account and no key, and how python -m finops_agent runs the whole thing in a terminal in under a second.',
      },
      {
        title: 'Two numbers, and both must trip',
        why: '+25% over a 7-day median AND at least +$1. A ratio alone pages on $0.001 → $0.003; a dollar floor alone pages on $1,000 → $1,010. The median, not the mean, so one earlier spike does not hide the next. All of it is configuration, not prompt text.',
      },
      {
        title: 'Quiet by default; archive everything',
        why: 'No anomaly, no message — a daily "all fine" trains people to ignore the channel. Every finding lands in S3 first, alerted or not; a repeat within 3 days is archived but not sent; the weekly digest reads the archive.',
      },
    ],
    practices: [
      'One deep interface: investigate(day, deps) → Report. The Lambda handler and the CLI are thin callers; tests call it with fakes at every seam.',
      'The Claude loop is a manual tool loop: strict tool schemas, both tool results returned in one message, unknown tools returned as is_error, windows clamped, eight turns at most, a typed report via a report_finding tool.',
      "Secrets are fetched from Secrets Manager at start and never placed in the function's environment; a missing secret degrades the feature (log instead of Slack, rules instead of Claude) rather than failing the run.",
      'Every alert carries its evidence and its provenance: the numbers, the correlated CloudTrail events, and explained_by: claude · rules · claude→rules.',
      'Investigates the last complete day, not the partial current one; dedupe counts only alerts that were actually delivered; CloudTrail paging and the model client are bounded so a hung dependency leaves time for the rules floor. All three came out of a code-review pass after the first end-to-end run.',
      'A Slack stand-in container on the emulator network receives the exact webhook payload, so the notification path is proven end to end without a workspace.',
    ],
    honest: [
      'Verified end to end on the emulator: the demo proves a quiet day, the NAT spike correlated with CreateNatGateway / CreateRoute / DeleteVpcEndpoints by terraform-ci the day before, dedupe the next day, a new service, a usage-driven spike with no changes (the agent says so), the live Cost Explorer read, the digest, and the JSON log.',
      'Cost Explorer on the emulator is real but tiny — fractions of a cent — so the live source correctly never trips the $1 floor; the fixtures are the spikes. CloudTrail on the emulator returns nothing, so the fixture change source carries the audit events per scenario.',
      'The Claude path is verified with a scripted client, not a live call — no API key was available when this was built. The loop, the round-trip, the fallbacks and the request shape are covered by tests; a real run is one environment variable away. Bedrock is a stub locally.',
    ],
    next: [
      'Run it against a real account: delete the endpoints block and the static credentials, keep everything else.',
      'CUR + Athena mode behind the same CostSource seam, for resource-level attribution.',
      'Usage-type breakdown as a fourth tool, so the model can tell NAT data processing from NAT hours.',
      'A token budget per run as a CloudWatch metric; past the ceiling, the rules floor takes over for the day.',
      'Slack reactions written back to the finding, so the digest can say how many alerts were actionable.',
    ],
  },

  // ------------------------------------------------------------------ //
  {
    slug: 'rag-lab',
    title: 'RAG Lab',
    tagline: 'retrieval quality as a number',
    status: 'shipped',
    kind: 'lab',
    period: 'sep 2026',
    summary:
      'Retrieval-augmented generation where the retrieval is measured, not assumed: two chunkers, two embedders, three retrievers and two answerers behind the same seams, a golden set that turns each choice into hit@k and MRR, a planted prompt-injection document, and the eval as a CI gate.',
    stack: ['Python', 'FastAPI', 'Qdrant', 'fastembed', 'BM25', 'Claude', 'Anthropic SDK', 'Docker Compose', 'GitHub Actions', 'pytest'],
    links: {
      github: 'https://github.com/Jeeeiiiiiii/rag-lab',
      diagram: '/diagrams/rag-lab.html',
    },
    purpose: [
      'Every RAG demo works on its own demo questions. The interesting question is how you know a chunking change made retrieval better, or worse. The corpus here is the READMEs of the other labs, so each question has a known answer in a known section, and 28 of them turn chunking, embedding and retrieval mode into a table of numbers.',
      'The chat is beside the point. The subject is the measurement, and what it says: heading-aware chunks plus hybrid retrieval reach hit@1 0.79, hit@5 0.96, MRR 0.86 on this corpus; dense retrieval alone loses exact identifiers, BM25 alone loses paraphrase, and reciprocal rank fusion keeps both.',
    ],
    ascii: `   corpus/*.md ──▶ chunk ──▶ guard ──▶ embed ──▶ store          eval/golden.jsonl
                  fixed |    flags     bge-small |   Qdrant |          │
                  heading  injection   hashing     memory            ▼
                                                     │       ┌──────────────────┐
   question ──▶ retrieve ─────────────────────────────┘       │ hit@1 hit@5 MRR  │
                dense · bm25 · hybrid (RRF)                  │ per config       │
                    │                                        │ + guard check    │
                    ▼                                        │ → CI gate ≥ 0.9  │
                answer ──▶ text + citations (labels only     └──────────────────┘
                Claude |   from the passages it was given)
                extractive   flagged chunks withheld`,
    decisions: [
      {
        title: 'The corpus is the other labs\' READMEs',
        why: 'Six documents, about 57 chunks, one of them planted. Questions with known answers in known sections are what make an eval honest; a synthetic corpus proves nothing about real engineering prose with tables, code fences and identifiers.',
      },
      {
        title: 'Retrieval quality is a CI gate',
        why: 'python -m rag_lab eval --gate 0.9 exits 1 if heading·hybrid hit@5 drops. A chunking change that quietly loses three questions is a regression like any other; the table lands in the GitHub job summary on every pull request.',
      },
      {
        title: 'Hybrid by reciprocal rank fusion, not score mixing',
        why: 'BM25 scores and cosine similarities live on different scales; RRF only needs ranks. It rewards agreement between the two lists and never needs a weight tuned per corpus.',
      },
      {
        title: 'The heading path rides inside the chunk text',
        why: 'The cheapest possible context injection. A chunk that starts "Pipeline Lab > The pipeline, stage by stage" embeds differently from the same table alone, and the section name is what a citation shows the reader. It helped every retrieval mode.',
      },
      {
        title: 'Idempotent ingestion by content hash',
        why: 'A chunk id is sha256(source + text), the store upserts. Re-running ingest over the same corpus embeds nothing; an edited paragraph re-embeds only itself; a chunking change rebuilds into its own collection, never a mixed one.',
      },
      {
        title: 'The extractive answerer is the floor',
        why: 'It returns the top passages, labelled, and says no model was used. The Claude answerer wraps it: citations must be labels it was given (others are dropped and logged), sufficient=false is an honest "not in the documents", and any failure falls back. answered_by on every response says which path wrote the words.',
      },
      {
        title: 'Retrieved text is data, in two layers',
        why: 'At ingest, chunks that look like instructions to a model are flagged and stored, not dropped, so the eval can assert the planted document is both retrieved and flagged. At answer time flagged chunks are withheld from the context and listed as withheld in the response.',
      },
    ],
    practices: [
      'Two adapters at every seam: chunking, embedder, store, retriever, answerer. The second adapter always runs with no daemon, no download and no key, so 20 tests and the whole eval run in-process in under a second.',
      'Structure-aware chunking that ignores headings inside code fences and only windows a section when it is too long.',
      'A guard that is explainable regexes, with a documented false positive: a README discussing "the system prompt" tripped it, a test caught it, the pattern now requires an imperative.',
      'FastAPI with /ingest, /search, /ask, /healthz and /metrics (Prometheus text); a health check that reports configuration rather than triggering a model download.',
      'A demo script that proves eight steps against Docker: idempotent re-ingest, three retrievers on an identifier question and on a paraphrase, a grounded answer, the injection retrieved-flagged-withheld, the eval table with its gate, the metrics.',
    ],
    honest: [
      'Real: Qdrant in Docker with cosine distance and idempotent upserts; BAAI/bge-small-en-v1.5 embeddings through fastembed on CPU; the numbers in the table, reproducible from the committed corpus and golden set.',
      'The golden set is small and self-authored: 28 questions over six documents by the person who wrote the documents. It measures relative changes well and absolute quality less so.',
      'The Claude answerer is verified with a scripted client, not a live call; grounding, citation checking, withholding and the fallbacks are covered by tests. The guard is regexes: it catches the planted document and common phrasings, and a determined attacker writes around it — the semantic guard is the next step, and the citation check is what limits the damage.',
    ],
    next: [
      'A cross-encoder reranker over the hybrid top-20; the eval will say exactly what it buys.',
      'Answer faithfulness as a metric: an LLM judge over each cited passage, so the table gains a column retrieval numbers cannot give.',
      'A chunk-size sweep as one command, plotted.',
      'A semantic guard behind the regexes: embed known injection phrasings and flag by cosine distance.',
      'Run app/ through pipeline-lab; the eval gate becomes a stage between build and deploy.',
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
