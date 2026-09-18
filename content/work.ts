/**
 * What the day job actually consists of, for the "at work" section on the
 * about page. Written for a public site: no client brand names, ticket
 * numbers, hostnames, or findings that identify an employer's systems.
 */

export interface WorkHighlight {
  title: string;
  /** one line, lowercase mono */
  label: string;
  body: string;
  stack: string[];
}

export const workContext =
  'DevOps engineer on a multi-brand content platform: an enterprise CMS on Azure Kubernetes, built by a central platform team, that I onboard and operate brands on. My side is the brand layer and the monitoring layer on top of it.';

export const workHighlights: WorkHighlight[] = [
  {
    title: 'Operating eight brands on one platform',
    label: 'brand layer · helm · jenkins · bitbucket pipelines',
    body: 'Each brand is a configuration overlay on a shared CoreMedia platform, not its own stack: its own Helm values, TLS certificates, Jenkins jobs (configured as code with JCasC) and a Next.js front end. Twelve front-end apps ship through Bitbucket Pipelines → container registry → Helm → AKS, with a chart that carries deployment, service, ingress, HPA, ServiceMonitor and secrets. Onboarding a brand is a repeatable set of config, not a project.',
    stack: ['AKS', 'Helm', 'Jenkins JCasC', 'Bitbucket Pipelines', 'ACR', 'ingress-nginx', 'Next.js'],
  },
  {
    title: 'AI-assisted alert triage (HolmesGPT)',
    label: 'alertmanager → fastapi bridge → holmesgpt → root-cause email',
    body: '"Pod restart count high" is true and useless at 2 a.m. I built a bridge: Alertmanager fires a webhook to a small FastAPI service I wrote, which hands the alert to HolmesGPT running in-cluster; it looks at the pods, logs and events and emails a written root-cause analysis. The raw alert still goes out — the AI is additive, so a wrong answer costs reading time, not an outage. The chart is vendored and pinned; the model key lives only in a Kubernetes Secret created out of band. Proven on one brand, then rolled out to six more.',
    stack: ['Prometheus', 'Alertmanager', 'FastAPI', 'HolmesGPT', 'Helm', 'Kubernetes Secrets'],
  },
  {
    title: 'CoreMedia 10 → 12 migration, brand by brand',
    label: 'both versions live · one brand at a time · always a way back',
    body: 'New namespaces, new image paths, new ingress — for eight brands. The design decision that made it safe was keeping both targets in the pipeline at once, so a brand could be pointed at v12, verified against probes and dashboards, and pointed back if needed. The migration stopped being a big-bang event and became a series of small reversible ones.',
    stack: ['AKS', 'Helm', 'Bitbucket Pipelines', 'CoreMedia'],
  },
  {
    title: 'Observability and certificates',
    label: 'kube-prometheus-stack · eck · grafana · x509 exporter',
    body: 'I own the Grafana dashboards and Alertmanager routing for my brands, with scheduled Grafana reports so status stops being a manual ask. Certificate expiry became a metric with an alert (x509-certificate-exporter) instead of an outage; I handled the wildcard rotation across brands. Platform components (ECK, kube-prometheus-stack, the exporter) are managed by Argo CD — GitOps for infrastructure, push CD for apps.',
    stack: ['Grafana', 'Prometheus', 'ECK', 'Argo CD', 'AppDynamics'],
  },
  {
    title: 'Cluster operations',
    label: 'node pool migrations · kubernetes upgrades · four environments',
    body: 'AKS node pool migrations to a newer VM family and Kubernetes minor-version upgrades across PROD, DR, QUA and PP, handling the scaling, cordon/drain and application configuration updates that go with them. Day to day: first point of contact for developers deploying and troubleshooting across INT, Staging, UAT and PROD.',
    stack: ['AKS', 'kubectl', 'Helm', 'Azure'],
  },
  {
    title: 'Technical review of a legacy deployment estate',
    label: 'ansible on vms · ~35 deployables · aws + azure',
    body: 'Separately from the platform work, I mapped how a legacy Ansible-to-VM estate actually deployed — build templates, release scripts, inventories, the seven-environment config layering — and wrote it up as an architecture map with prioritised findings on secrets handling, missing test and scan gates, and the absence of infrastructure as code, so the owning team had something concrete to act on.',
    stack: ['Ansible', 'Azure DevOps', 'Maven', 'systemd', 'NGINX'],
  },
];
