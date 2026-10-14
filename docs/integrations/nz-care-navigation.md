# NZ care, health and later-life navigation

Review-branch implementation, 30 September 2026. This is public navigation and local preparation, not an emergency monitor, clinical tool, eligibility engine or transactional service.

## Scope and architecture

- Product: Personal DO, secondary “Around you” area.
- Extends the existing local preparation/evidence design with a typed, dated public-source catalogue. No new external-action runtime, storage, account integration, model request or API route.
- Eight guides: NZ Super; SuperGold; NASC/home support; residential care and funding; GP/appointment administration; carer respite; retirement-village questions; care advocacy and elder-abuse support.
- Each guide has a concrete starting point, four preparation steps, three questions, a private-document checklist, explicit boundaries and direct official sources.
- Key files: `apps/do/personal/care-navigation/catalogue.ts`, `app/do/personal/NzCareNavigation.tsx` and `NzCareNavigation.module.css`.
- Integration: `<NzCareNavigation storageScope={workspaceKey} />`. Parent supplies the existing verified-owner/guest scope. Component keys its stateful workspace to that scope, clearing guide selection and preparation ticks on account change. No persistence or automatic transfer.
- UI supports large text, a native topic selector, one-step mode, reversible preparation ticks, a selected-guide-only text download, and direct phone links. Phone links require the user’s click and an available device handler; DO does not make calls.

## Privacy and authority

No personal text, document upload, health question, diagnosis, asset figure, client number or credential is collected. No fetch, telemetry, local/session storage or provider request is made by this component. Guide choices and ticks are in React state only. The download is generated on-device and includes only the chosen public guide and its ticks; it is never sent to a service or household member.

Ticks say **preparation reviewed by you**. They do not assert a completed booking, assessment, application or service. Clearing them does not reverse an external action. The guide makes clear that any future model use of sensitive information and third-party sharing require a separate, specific choice. Generic appointment provider drafting remains part of the existing life-admin workflow, outside this component.

Healthline and 111 are immediately visible, without login, a model response, permission checkbox or disclosure. Specialised suicide/self-harm helplines are not included. Elder Abuse Response Service and independent advocacy are verified from their official public pages; no inference about the user is made. 111 TXT is linked with the explicit requirement to register first. A closure or new-tab action is never described as clearing browser history.

## Verified official sources

All catalogue entries were checked on **2026-09-30**, via their primary pages or the current primary-source search extract when direct rendering was unavailable. “Checked” is a fixed editorial review date, not a runtime fetch claim. The panel explicitly says the material is curated, not live, and directs people to recheck the source. After 90 days (or an invalid/future local clock), it adds an older-review warning. No thresholds, rates, payment calculations or guarantee of availability are embedded.

- NZ Super eligibility: https://www.workandincome.govt.nz/eligibility/seniors/superannuation/who-can-get-it.html
- NZ Super applications and timing: https://www.workandincome.govt.nz/online-services/superannuation
- NZ Super documents: https://www.workandincome.govt.nz/about-work-and-income/our-services/what-to-bring/nz-super
- SuperGold card and replacement: https://www.supergold.govt.nz/info_for_cardholders/how_to_get_a_supergold_card
- SuperGold offers/support entry point: https://www.supergold.govt.nz/
- Needs assessment: https://www.govt.nz/browse/health/help-in-your-home/needs-assessment/
- Needs-assessment directory: https://www.healthnz.govt.nz/hospitals-services/services-support/support-services/needs-assessment-service
- Services for older people: https://www.healthnz.govt.nz/hospitals-services/services-support/older-people
- Seniorline: https://www.healthnz.govt.nz/hospitals-services/services-support/support-services/older-people/seniorline
- Residential care: https://www.healthnz.govt.nz/hospitals-services/services-support/older-people/residential-care
- Residential Care Subsidy: https://www.workandincome.govt.nz/products/a-z-benefits/residential-care-subsidy.html
- Residential Care Loan: https://www.workandincome.govt.nz/products/a-z-benefits/residential-care-loan
- GP enrolment: https://www.healthnz.govt.nz/hospitals-services/services-support/general-practices
- Healthline: https://www.healthnz.govt.nz/hospitals-services/which-health-service-should-i-use
- Respite: https://www.healthnz.govt.nz/hospitals-services/services-support/older-people/respite-care
- Carer Support: https://www.healthnz.govt.nz/hospitals-services/eligibility-subsidies/carer-support-subsidy
- Advocacy: https://www.hdc.org.nz/making-a-complaint/talk-to-the-advocacy-service/
- Elder-abuse support: https://www.officeforseniors.govt.nz/our-work/raising-awareness-of-elder-abuse/elder-abuse-response-service
- Retirement village agreements: https://www.companiesoffice.govt.nz/all-registers/retirement-villages/registered-documents/occupation-right-agreement/
- Independent legal advice before signing: https://www.legislation.govt.nz/act/public/2003/0112/latest/DLM220864.html
- 111: https://www.police.govt.nz/call-111
- 105: https://www.police.govt.nz/use-105
- Accessible 111 TXT registration: https://www.police.govt.nz/111-txt/how-register-111-txt

Sources sometimes use different or older route structures. The catalogue uses the verified route above; it does not guess a service endpoint. Local availability and individual decisions always remain with the relevant provider/agency.

## Checks and remaining proof

- `node_modules/.bin/vitest run apps/do/personal/care-navigation/catalogue.test.ts app/do/personal/NzCareNavigation.test.ts`: **11 tests passed**.
- Focused ESLint over catalogue, component and tests: **passed**.
- `node scripts/brand-guard.mjs` and `node --import tsx scripts/lint-macrons.ts`: **passed**.
- Coverage: all eight practical guides; official-domain/date contracts; direct validated phone numbers; no embedded payment amounts/thresholds; conservative freshness; next-step behavior; selected-guide-only export; preparation/completion distinction; no personal input, persistence or fetch; guest emergency visibility; owner remount contract.
- Full typecheck, aggregate build, integration/browser proof and desktop/375px screenshots belong to the combined Personal DO integration. Component unit/SSR tests do not establish browser interaction or production/provider behavior.
- The slice’s plain `tsc --noEmit` attempt exhausted Node’s default approximately 2 GB heap before reporting. The integration owner must use the established higher-heap aggregate command. `pnpm typecheck` also could not start through the environment’s wrapper because its default package-manager home was absent; this is not a passing typecheck.

## Manual browser acceptance

1. As guest, verify 111 and Healthline are visible and clickable without any model/login/consent flow. Do not place a call during QA.
2. Select each guide, review its questions and direct official sources; toggle large text at 375px and 200% zoom without horizontal overflow.
3. Enable one-step mode, tick all preparation steps, then show all and untick one. Count and next-step content should agree; no external action is claimed.
4. Switch guides: each keeps its own ticks while mounted. Clear one guide: the other is unchanged. Refresh or switch account: all state is cleared.
5. Download a selected guide: verify only that guide’s public text, dates, URLs and ticks appear, with no other workspace content.
6. Keyboard-navigate selector, checkboxes, details, phone links and download; verify focus, live-status updates, label associations and 44px controls.

No production deploy, account signup, application, booking, payment, permission expansion or communication is included. Rollback is removing the mount/import and these isolated component/catalogue files.
