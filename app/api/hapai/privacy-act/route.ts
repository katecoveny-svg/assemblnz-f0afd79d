import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { gate, gateBlockedResponse } from "@/lib/gating/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are an assembl privacy specialist for New Zealand. Generate a one-page Privacy Act 2020 summary for an organisation. You must work from the New Zealand Privacy Act 2020 only — do not reference GDPR, CCPA, Australian Privacy Principles or any other regime.

OUTPUT FORMAT — return HTML using only these tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <span class="ipp-pill">. No other tags. No markdown fences.

Use this exact structure:

<h1>[Organisation name] — Privacy Act 2020 one-pager</h1>
<p>One-paragraph plain-English summary: what they collect, who from, what for.</p>

<h2>Which Information Privacy Principles apply most to you</h2>
<p>Brief intro line.</p>

For each of the most relevant IPPs (typically 4-7 of the 13, depending on inputs):
<h3><span class="ipp-pill">IPP 1</span> [Short title]</h3>
<p>One sentence what the principle means.</p>
<ul><li>Specific thing they need to do based on inputs.</li></ul>

Always include IPP 3A if they collect personal information indirectly or mention any automated decision-making — IPP 3A came into force 1 May 2026.
Always include IPP 12 if they share data internationally.

<h2>Your "what to do this week" list</h2>
<ul><li>Three to five concrete actions, prioritised by risk.</li></ul>

<h2>If something goes wrong</h2>
<p>Notifiable privacy breach summary: who to tell, timeframes, what counts as "serious harm" in their context.</p>

<h2>People to know</h2>
<ul>
  <li><strong>Privacy Commissioner:</strong> privacy.org.nz · 0800 803 909</li>
  <li><strong>Their privacy officer:</strong> Every NZ business must appoint one — name TBC if not yet assigned.</li>
</ul>

RULES:
- New Zealand English. Lowercase "assembl". Use "automated decision-making" or "agent".
- Be specific to inputs. Do not be generic.
- IPPs: 1 (purpose), 2 (source), 3 (notification), 3A (indirect collection — new), 4 (manner), 5 (storage & security), 6 (access), 7 (correction), 8 (accuracy), 9 (retention), 10 (use), 11 (disclosure), 12 (cross-border), 13 (unique identifiers).
- Keep total length to roughly one printed A4 page.`;

const ALLOWED_TAGS = /<\/?(?!h1\b|h2\b|h3\b|p\b|ul\b|li\b|strong\b|span\b)[a-z][^>]*>/gi;

function sanitizeHtml(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(ALLOWED_TAGS, "")
    .replace(/<span(?! class="ipp-pill")[^>]*>/gi, "<span>")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fallbackPrivacyHtml(input: PrivacyRequest) {
  const org = escapeHtml(input.organisationName || "Your organisation");
  const data = input.dataTypes.length ? input.dataTypes.join(", ") : "personal information";
  const indirect = input.collectionSource.toLowerCase().includes("third") || input.collectionSource.toLowerCase().includes("partner");
  const international = input.sharedWith.toLowerCase().includes("overseas") || input.sharedWith.toLowerCase().includes("international");
  const ipp3a = indirect
    ? `<h3><span class="ipp-pill">IPP 3A</span> Indirect collection</h3><p>If you collect information from someone other than the person, you need to tell them clearly.</p><ul><li>Write a short notice explaining where the data came from and why you need it.</li></ul>`
    : "";
  const ipp12 = international
    ? `<h3><span class="ipp-pill">IPP 12</span> Cross-border disclosure</h3><p>Before sending personal information overseas, check the recipient has comparable privacy safeguards.</p><ul><li>Confirm overseas providers, cloud tools, or partners meet Privacy Act 2020 cross-border requirements.</li></ul>`
    : "";

  return `<h1>${org} — Privacy Act 2020 one-pager</h1><p>${org} collects ${escapeHtml(data)} for ${escapeHtml(input.description || "business operations")}. The main privacy task is to tell people what is collected, keep it secure, and delete it when it is no longer needed.</p><h2>Which Information Privacy Principles apply most to you</h2><p>These IPPs are the most relevant from the details supplied.</p><h3><span class="ipp-pill">IPP 1</span> Purpose</h3><p>Only collect information you need for a lawful purpose connected to your work.</p><ul><li>Write down each data type and the reason it is needed.</li></ul><h3><span class="ipp-pill">IPP 3</span> Notification</h3><p>People should know what is collected, why, and who receives it.</p><ul><li>Update your collection notice for ${org} before the next intake or onboarding process.</li></ul>${ipp3a}<h3><span class="ipp-pill">IPP 5</span> Storage and security</h3><p>Personal information must be protected against loss, misuse, and unauthorised access.</p><ul><li>Check access controls for ${escapeHtml(input.storage || "your storage location")}.</li></ul><h3><span class="ipp-pill">IPP 9</span> Retention</h3><p>Do not keep personal information longer than needed.</p><ul><li>Set a retention rule of ${escapeHtml(input.retention || "a defined period")} and review old records.</li></ul>${ipp12}<h2>Your "what to do this week" list</h2><ul><li>Name your privacy officer.</li><li>Write or update your privacy notice.</li><li>Check who can access stored personal information.</li><li>Set a deletion date for old records.</li></ul><h2>If something goes wrong</h2><p>If a breach could cause serious harm, notify the Privacy Commissioner and affected people as soon as practicable. Serious harm depends on sensitivity, who has the information, possible misuse, and whether protections reduce the risk.</p><h2>People to know</h2><ul><li><strong>Privacy Commissioner:</strong> privacy.org.nz · 0800 803 909</li><li><strong>Their privacy officer:</strong> Every NZ business must appoint one — name TBC if not yet assigned.</li></ul>`;
}

function appendAssemblWatermark(html: string, toolLabel: string, toolPath: string) {
  return (
    html +
    `<footer style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(35,33,31,0.12);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(35,33,31,0.62);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;line-height:1.5;">` +
    `<span><span style="font-family:'Fraunces',Georgia,serif;font-style:italic;text-transform:none;letter-spacing:0;font-size:14px;color:#3A3832;">assembl</span> · ${escapeHtml(toolLabel)}</span>` +
    `<a href="https://assembl.co.nz${toolPath}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">assembl.co.nz${escapeHtml(toolPath)} →</a>` +
    `</footer>`
  );
}

type PrivacyRequest = {
  organisationName: string;
  sector: string;
  description: string;
  dataTypes: string[];
  otherData: string;
  collectionSource: string;
  sharedWith: string;
  storage: string;
  retention: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<PrivacyRequest> | null;
  if (!body?.organisationName || !body?.sector || !body?.description) {
    return NextResponse.json({ error: "Complete the organisation details first." }, { status: 400 });
  }

  // Access gate: 1 free run for anonymous visitors, 5/day once an email lifts it.
  const gateVerdict = await gate(req, "hapai", "privacy-act");
  if (!gateVerdict.allowed) return gateBlockedResponse(gateVerdict);

  const input: PrivacyRequest = {
    organisationName: String(body.organisationName).trim().slice(0, 120),
    sector: String(body.sector ?? "").trim().slice(0, 80),
    description: String(body.description ?? "").trim().slice(0, 800),
    dataTypes: Array.isArray(body.dataTypes) ? body.dataTypes.map(String).slice(0, 16) : [],
    otherData: String(body.otherData ?? "").trim().slice(0, 300),
    collectionSource: String(body.collectionSource ?? "").trim().slice(0, 500),
    sharedWith: String(body.sharedWith ?? "").trim().slice(0, 500),
    storage: String(body.storage ?? "").trim().slice(0, 300),
    retention: String(body.retention ?? "").trim().slice(0, 200),
  };

  const message = `Organisation inputs:
${JSON.stringify(input, null, 2)}`;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("public-chat-llm", {
        body: {
          kete: "auaha",
          message,
          systemPromptOverride: SYSTEM_PROMPT,
          sessionId: crypto.randomUUID(),
        },
      });
      if (!error && typeof data?.response === "string" && data.response.trim()) {
        const cleaned = sanitizeHtml(data.response);
        return NextResponse.json({ html: appendAssemblWatermark(cleaned, "privacy act one-pager", "/hapai/privacy-act") });
      }
    }
  } catch (error) {
    console.error("[hapai/privacy-act] generation failed", error);
  }

  return NextResponse.json({
    html: appendAssemblWatermark(fallbackPrivacyHtml(input), "privacy act one-pager", "/hapai/privacy-act"),
  });
}
