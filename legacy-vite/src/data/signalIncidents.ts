export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentCategory = "incident-triage" | "vuln-assessment" | "authz-review";

export interface Signal {
  label: string;
  value: string;
}

export interface TimelineEvent {
  time: string;
  label: string;
  detail: string;
}

export interface Incident {
  id: string;
  title: string;
  summary: string;
  severity: Severity;
  confidence: number;
  category: IncidentCategory;
  signals: Signal[];
  immediateActions: string[];
  escalationDecision: string;
  status: "open" | "escalated" | "resolved";
  timestamp: string;
  timeline: TimelineEvent[];
  aiReasoning: string;
  expandedAnalysis: string;
}

export const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    title: "Unauthorized API Access Detected",
    summary: "Multiple failed authentication attempts from IP 203.0.113.42 targeting admin endpoints. Pattern consistent with credential stuffing attack.",
    severity: "critical",
    confidence: 94,
    category: "incident-triage",
    signals: [
      { label: "Source IP", value: "203.0.113.42 (TOR exit node)" },
      { label: "Attempts", value: "2,847 in 15 min" },
      { label: "Target", value: "/api/v2/admin/*" },
      { label: "Geolocation", value: "Unknown (anonymized)" },
    ],
    immediateActions: [
      "Block IP 203.0.113.42 at WAF level",
      "Rotate admin API keys immediately",
      "Enable enhanced logging on admin endpoints",
    ],
    escalationDecision: "Auto-escalated to SOC Lead — severity exceeds threshold",
    status: "open",
    timestamp: "2026-03-29T08:14:00Z",
    timeline: [
      { time: "08:14:00", label: "Alert Triggered", detail: "Rate limit exceeded on /api/v2/admin/users" },
      { time: "08:14:12", label: "AI Classification", detail: "Classified as credential stuffing (94% confidence)" },
      { time: "08:14:15", label: "Signal Correlation", detail: "Matched TOR exit node database" },
      { time: "08:14:30", label: "Auto-Block", detail: "IP added to temporary blocklist" },
    ],
    aiReasoning: "High request velocity from a known TOR exit node targeting authenticated admin endpoints. Request payloads contain sequential username patterns consistent with credential stuffing toolkits. No successful authentications detected.",
    expandedAnalysis: "Deep packet inspection reveals requests originating from a known credential stuffing framework (Sentry MBA variant). The attack pattern follows a dictionary-based approach with 847 unique username/password combinations attempted. Cross-referencing with threat intelligence feeds confirms the source IP has been associated with 12 similar attacks in the past 30 days across different organizations. Recommended: implement CAPTCHA on login, enforce MFA for all admin accounts, and deploy bot detection middleware.",
  },
  {
    id: "INC-002",
    title: "CVE-2026-1234 Vulnerability in Auth Service",
    summary: "Critical vulnerability detected in authentication microservice. JWT validation bypass allows privilege escalation.",
    severity: "high",
    confidence: 87,
    category: "vuln-assessment",
    signals: [
      { label: "CVE", value: "CVE-2026-1234" },
      { label: "CVSS", value: "8.9 / 10" },
      { label: "Affected", value: "auth-service v2.3.1" },
      { label: "Patch", value: "Available (v2.3.2)" },
    ],
    immediateActions: [
      "Apply patch auth-service v2.3.2",
      "Audit recent JWT tokens for anomalies",
      "Review access logs for privilege escalation",
    ],
    escalationDecision: "Pending engineer review — patch deployment required",
    status: "open",
    timestamp: "2026-03-29T06:45:00Z",
    timeline: [
      { time: "06:45:00", label: "CVE Published", detail: "NVD published CVE-2026-1234" },
      { time: "06:45:30", label: "Auto-Scan", detail: "Dependency scanner flagged auth-service" },
      { time: "06:46:00", label: "Risk Assessment", detail: "AI scored exploitability at 87%" },
    ],
    aiReasoning: "The vulnerability allows JWT signature bypass through algorithm confusion. The auth-service is running a vulnerable version and is internet-facing, increasing risk significantly.",
    expandedAnalysis: "Algorithm confusion attack vector allows an attacker to switch from RS256 to HS256, using the public key as the HMAC secret. This effectively bypasses signature validation. Impact analysis shows 3 downstream services rely on JWT claims from this service for authorization decisions. Blast radius: complete authentication bypass for all protected resources.",
  },
  {
    id: "INC-003",
    title: "Excessive Permission Grant in IAM",
    summary: "Service account sa-data-pipeline granted admin-level permissions across all production resources. Violates least-privilege principle.",
    severity: "medium",
    confidence: 78,
    category: "authz-review",
    signals: [
      { label: "Account", value: "sa-data-pipeline" },
      { label: "Scope", value: "All production resources" },
      { label: "Granted By", value: "terraform-ci" },
      { label: "Time", value: "2h ago" },
    ],
    immediateActions: [
      "Restrict sa-data-pipeline to data-pipeline namespace only",
      "Review terraform-ci change history",
      "Implement permission boundary policies",
    ],
    escalationDecision: "Flagged for IAM team review",
    status: "open",
    timestamp: "2026-03-29T07:30:00Z",
    timeline: [
      { time: "07:30:00", label: "Permission Change", detail: "IAM policy updated via terraform-ci" },
      { time: "07:30:05", label: "Policy Scan", detail: "Overprivileged account detected" },
      { time: "07:30:10", label: "Classification", detail: "Classified as authorization review" },
    ],
    aiReasoning: "Automated CI pipeline applied an overly broad IAM policy. While likely unintentional, the blast radius of this service account with admin permissions is significant.",
    expandedAnalysis: "The terraform plan diff shows a wildcard resource selector was introduced in commit abc123f. This grants the data pipeline service account full CRUD access to all production resources including secrets, user data, and billing information. Historical access patterns show this account only needs read access to 2 specific data buckets.",
  },
  {
    id: "INC-004",
    title: "Anomalous Data Exfiltration Pattern",
    summary: "Internal service making unusual outbound connections to external S3-compatible endpoint. Data volume 340% above baseline.",
    severity: "critical",
    confidence: 91,
    category: "incident-triage",
    signals: [
      { label: "Service", value: "report-generator" },
      { label: "Destination", value: "s3.suspicious-cdn.io" },
      { label: "Volume", value: "4.2 GB (baseline: 950 MB)" },
      { label: "Duration", value: "Active for 47 min" },
    ],
    immediateActions: [
      "Isolate report-generator service immediately",
      "Block outbound to s3.suspicious-cdn.io",
      "Capture forensic snapshot of container",
    ],
    escalationDecision: "Auto-escalated — potential data breach in progress",
    status: "escalated",
    timestamp: "2026-03-29T09:02:00Z",
    timeline: [
      { time: "09:02:00", label: "Anomaly Detected", detail: "Outbound traffic spike detected" },
      { time: "09:02:15", label: "Threat Intel", detail: "Destination flagged as suspicious" },
      { time: "09:02:30", label: "Auto-Escalate", detail: "Data exfiltration pattern confirmed" },
    ],
    aiReasoning: "The report-generator service has established connections to an unrecognized external endpoint. The data transfer volume significantly exceeds historical baselines and the destination is not in any approved allow-list.",
    expandedAnalysis: "Network flow analysis reveals the service is streaming database query results to an external S3-compatible endpoint. The queries target customer PII tables. The suspicious endpoint was registered 72 hours ago. Container image analysis shows no recent deployments, suggesting possible runtime compromise through a dependency vulnerability.",
  },
  {
    id: "INC-005",
    title: "SSL Certificate Expiring in 48h",
    summary: "Production wildcard certificate for *.assembl.io expires in 48 hours. Auto-renewal failed due to DNS challenge timeout.",
    severity: "low",
    confidence: 99,
    category: "vuln-assessment",
    signals: [
      { label: "Domain", value: "*.assembl.io" },
      { label: "Expiry", value: "2026-03-31 08:00 UTC" },
      { label: "Issuer", value: "Let's Encrypt" },
      { label: "Renewal", value: "Failed (DNS timeout)" },
    ],
    immediateActions: [
      "Manually trigger certificate renewal",
      "Verify DNS provider API credentials",
      "Set up backup certificate authority",
    ],
    escalationDecision: "No escalation needed — ops team notified",
    status: "open",
    timestamp: "2026-03-29T05:00:00Z",
    timeline: [
      { time: "05:00:00", label: "Cert Check", detail: "Daily certificate audit" },
      { time: "05:00:10", label: "Expiry Warning", detail: "48h expiry threshold breached" },
      { time: "05:00:15", label: "Renewal Attempt", detail: "Auto-renewal failed" },
    ],
    aiReasoning: "Certificate expiry is a low-severity but high-confidence finding. The auto-renewal mechanism failed, likely due to DNS provider API rate limiting or credential rotation.",
    expandedAnalysis: "The Let's Encrypt ACME client logs show 3 consecutive DNS-01 challenge failures. The DNS provider (Cloudflare) API key was rotated 5 days ago but the cert-manager secret was not updated. This is a configuration drift issue that should be addressed in the infrastructure-as-code templates.",
  },
];

export const getSeverityColor = (severity: Severity) => {
  const map: Record<Severity, string> = {
    critical: "#EF4444",
    high: "#F97316",
    medium: "#EAB308",
    low: "#6B9BD2",
  };
  return map[severity];
};

export const getSeverityBg = (severity: Severity) => {
  const map: Record<Severity, string> = {
    critical: "rgba(239,68,68,0.15)",
    high: "rgba(249,115,22,0.15)",
    medium: "rgba(234,179,8,0.15)",
    low: "rgba(107,155,210,0.15)",
  };
  return map[severity];
};
