# Assembl Enterprise Security & Compliance

**Document version:** 1.0
**Last updated:** 28 March 2026
**Classification:** Public — for enterprise prospects and partners

---

## Compliance Summary

| Standard | Status | Details |
|---|---|---|
| NZ Privacy Act 2020 | Compliant | All 13 Information Privacy Principles observed |
| GDPR | Aligned | For international clients and EU data subjects |
| SOC 2 Type II | Inherited | Via Supabase infrastructure (AWS) |
| NZISM | Aligned | NZ Information Security Manual framework |
| PCI DSS | Compliant | Payment processing via Stripe |
| AML/CFT | Considered | Financial agents include appropriate disclaimers |
| ISO 27001 | Aligned | Via Supabase/AWS infrastructure controls |

---

## About Assembl

Assembl is New Zealand's first business intelligence platform, providing 43 specialist AI agents across 16 industries. Built in Auckland by Kate Hudson, Assembl is designed for NZ businesses and operates within NZ/AU data residency requirements.

This document outlines the security, privacy, and compliance measures that protect your data when using Assembl.

---

## A. Data Protection

### Data Storage and Residency
- All data is stored in **Supabase**, hosted on **AWS ap-southeast-2 (Sydney region)** — the closest major cloud region to New Zealand.
- Data residency is maintained within the **AU/NZ region**, compliant with the NZ Privacy Act 2020 requirements for offshore data handling.
- No customer data is transferred to or processed in regions outside AU/NZ without explicit consent.

### Encryption
- **In transit:** All data encrypted using TLS 1.3 (HTTPS enforced across all endpoints).
- **At rest:** All data encrypted using AES-256 encryption via AWS infrastructure.
- **Database level:** Supabase provides transparent disk encryption on all database volumes.
- **Backups:** All backup data is encrypted at rest using the same AES-256 standard.

### Data Privacy
- **No training on customer data.** Assembl does not use customer conversations, documents, or data to train AI models.
- **Conversations are private.** Each user's interactions are isolated and accessible only to that user (and authorised account administrators on Business and Industry Suite tiers).
- **Data minimisation.** Assembl collects only the data necessary to provide the service.

### Data Retention and Deletion
- Customer data is retained for the duration of the active subscription.
- Upon account closure, all customer data is **permanently deleted within 30 days**.
- Customers can request data export at any time in standard formats (CSV, JSON, PDF).
- Deletion requests are processed in accordance with the NZ Privacy Act 2020, Information Privacy Principle 9.

### Security Audits
- Regular security assessments are conducted on the Assembl platform.
- Supabase undergoes independent third-party security audits as part of their SOC 2 compliance.
- Penetration testing is conducted periodically, with findings remediated promptly.

---

## B. Compliance

### NZ Privacy Act 2020
Assembl is fully compliant with the NZ Privacy Act 2020, including all 13 Information Privacy Principles (IPPs):

| IPP | Principle | How Assembl Complies |
|---|---|---|
| 1 | Purpose of collection | Data collected only for providing the Assembl service |
| 2 | Source of information | Information collected directly from the user |
| 3 | Collection from subject | Users provide their own data; no third-party collection |
| 4 | Manner of collection | Collection is lawful, fair, and not unreasonably intrusive |
| 5 | Storage and security | AES-256 encryption at rest, TLS 1.3 in transit, RLS on all tables |
| 6 | Access to information | Users can access their own data at any time via the platform |
| 7 | Correction of information | Users can update or correct their data at any time |
| 8 | Accuracy of information | Systems designed to maintain accurate, up-to-date records |
| 9 | Retention | Data deleted within 30 days of account closure |
| 10 | Use of information | Data used only for the purpose it was collected |
| 11 | Disclosure | No disclosure to third parties without consent |
| 12 | Unique identifiers | No unnecessary unique identifiers assigned |
| 13 | Overseas disclosure | Data hosted in AU/NZ region; no offshore transfer without consent |

### GDPR Alignment
For international clients and organisations with EU data subjects:
- Right to access, rectification, and erasure supported
- Data Processing Agreement (DPA) available upon request
- Lawful basis for processing: contract performance and legitimate interest
- Data portability supported via standard export formats

### SOC 2 Type II
- Assembl's infrastructure provider (Supabase/AWS) maintains SOC 2 Type II certification.
- This covers security, availability, processing integrity, confidentiality, and privacy controls.
- SOC 2 reports are available from Supabase upon request for enterprise due diligence.

### NZISM Alignment
- Assembl's security controls are aligned with the NZ Information Security Manual (NZISM).
- This includes controls for access management, encryption, logging, incident response, and data classification.
- Relevant for government and public sector clients evaluating Assembl.

### PCI DSS
- All payment processing is handled by **Stripe**, which is PCI DSS Level 1 certified.
- Assembl does not store, process, or transmit credit card data directly.
- Payment information is entered directly into Stripe's secure payment forms.

### AML/CFT Considerations
- Financial agents (LEDGER, VAULT, MINT, ANCHOR) include clear disclaimers that outputs are AI-generated guidance, not financial or legal advice.
- Users in regulated industries are reminded to verify outputs with qualified professionals.
- Assembl does not provide financial advice, hold client funds, or conduct transactions on behalf of users.

---

## C. Access Controls

### Authentication
- Email and password authentication with secure password requirements.
- **Multi-factor authentication (MFA)** available for all account tiers.
- Social login via Google OAuth 2.0 supported.
- Session tokens managed via Supabase Auth with automatic expiry.

### Role-Based Access Control (RBAC)
Assembl supports four access levels on Business and Industry Suite tiers:

| Role | Permissions |
|---|---|
| Admin | Full access: user management, billing, all agents, settings, audit logs |
| Manager | Access to all agents, team usage reports, no billing or user management |
| User | Access to assigned agents, own conversation history |
| Read-only | View shared reports and dashboards only, no agent interaction |

### Session Management
- Sessions expire automatically after a configurable inactivity period (default: 30 minutes for enterprise accounts).
- Active sessions can be viewed and terminated by account administrators.
- Concurrent session limits configurable on Industry Suite tier.

### Enterprise Access Features
- **IP allowlisting:** Restrict platform access to approved IP addresses or ranges (Industry Suite).
- **SSO integration:** SAML 2.0 and OAuth 2.0 for enterprise single sign-on.
- **Audit logging:** All user actions (logins, agent interactions, data exports, setting changes) are logged with timestamps and IP addresses.
- **API access controls:** API keys with scoped permissions and rate limiting.

---

## D. Agent Security

### Conversation Isolation
- **Row Level Security (RLS)** is enforced on all Supabase tables.
- Each user can only access their own conversations, documents, and data.
- No cross-contamination between client accounts — even on shared infrastructure.
- Administrators on Business and Industry Suite tiers can view team usage summaries but not individual conversation content (unless explicitly configured).

### Document Handling
- Documents uploaded to agents are scanned for malware.
- Uploaded files are sandboxed and processed in isolated environments.
- Documents are stored encrypted and accessible only to the uploading user.
- File size limits and type restrictions are enforced (PDF, DOCX, XLSX, CSV, images).

### AI Output Safety
- All agent outputs include the disclaimer: **"AI-generated — verify with qualified professional."**
- Agents do not provide binding legal, financial, medical, or regulatory advice.
- Outputs are generated fresh for each query — no persistent memory between sessions unless the user explicitly opts in.
- Agents cannot access the internet, external APIs, or data outside of Assembl's controlled environment during conversation.

### Brand Data Isolation
- On Business and Industry Suite tiers, brand data (logos, templates, style guides, training documents) is stored separately per account.
- Brand data is never shared between accounts or used to train models.
- Custom agent training data is isolated per organisation.

---

## E. Infrastructure

### Hosting
- **Application layer:** Hosted on Supabase (AWS infrastructure).
- **CDN and edge protection:** Cloudflare Pro plan providing global CDN, DDoS protection, and WAF (Web Application Firewall).
- **DNS:** Managed via Cloudflare with DNSSEC enabled.
- **Frontend:** Deployed via Lovable with automatic SSL.

### Availability
- **99.9% uptime SLA** on Business and Industry Suite tiers.
- Supabase provides high-availability database clusters with automatic failover.
- Cloudflare provides always-on DDoS mitigation and edge caching.

### Backup and Recovery
- **Automated daily backups** of all database data.
- **7-day backup retention** as standard; extended retention available on Industry Suite.
- Point-in-time recovery capability via Supabase.
- Backup integrity verified through automated restoration tests.

### Incident Response
- **4-hour acknowledgement** for critical security incidents.
- **24-hour initial assessment** with affected customers notified.
- Incident response plan covers: detection, containment, eradication, recovery, and post-incident review.
- Mandatory breach notification to the NZ Privacy Commissioner under the Privacy Act 2020 (notifiable privacy breaches, section 114).

### Monitoring
- Real-time application monitoring and alerting.
- Database performance monitoring via Supabase dashboard.
- Cloudflare analytics for traffic patterns and threat detection.
- Automated alerts for unusual access patterns or potential security events.

---

## F. Enterprise Features

### Dedicated Support
- Business tier: Priority email support with 24-hour response time.
- Industry Suite tier: Dedicated support channel with 4-hour response time during NZ business hours.
- Onboarding assistance for enterprise deployments.

### Custom Data Retention
- Configurable data retention policies to meet organisational or regulatory requirements.
- Options for extended retention, automatic archiving, or accelerated deletion.
- Retention policies apply to conversations, uploaded documents, and generated outputs.

### Private Deployment
- **Industry Suite tier** supports private deployment options for organisations requiring additional isolation.
- Dedicated Supabase project with separate database instance.
- Custom domain configuration available.

### White-Label Capability
- Industry Suite tier supports white-label deployment.
- Fully isolated data environment per white-label instance.
- Custom branding, domain, and agent configuration.
- Suitable for franchises, industry bodies offering member tools, and consultancies.

### Custom Agent Training
- Organisations can train agents on their own documents, policies, and procedures.
- Training data is stored separately and never shared between organisations.
- Custom-trained agents are available exclusively to the training organisation.

### Compliance Reporting and Audit Trails
- Full audit trail of all platform activity (logins, queries, exports, setting changes).
- Exportable audit logs in CSV and JSON formats.
- Compliance reports generated on demand for internal or external audits.
- Supports regulatory reporting requirements for NZ financial, health, and government sectors.

### Data Export
- All customer data exportable in standard formats: **CSV, JSON, PDF**.
- Bulk export available for conversation histories, generated documents, and analytics.
- API access for automated data extraction and integration with existing systems.

---

## Contact

For security questions, enterprise enquiries, or to request a Data Processing Agreement:

**Kate Hudson**
Founder, Assembl
kate@assembl.co.nz
assembl.co.nz

---

*Assembl is built in Aotearoa New Zealand, for New Zealand business. We take the security of your data as seriously as you do.*
