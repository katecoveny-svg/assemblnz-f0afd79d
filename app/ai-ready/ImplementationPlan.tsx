"use client";
import { useState } from "react";
import Link from "next/link";
type Check = {
  id: string;
  label: string;
  status: string;
  detail: string;
  fix: string;
  scored?: boolean;
};
type Report = {
  site: string;
  url: string;
  score: number;
  checks: Check[];
  checkedAt: string;
};
const sectors = {
  services: {
    label: "Professional services",
    moment: "While an enquiry is reviewed",
    output: "A meeting brief",
    example:
      "Collect the customer’s goal, deadline and questions. Prepare a brief for the adviser to review.",
    visual: "Interactive service finder",
    detail:
      "Let people explore the relevant service, see what to prepare and leave with their own checklist.",
  },
  retail: {
    label: "Retail & food",
    moment: "While an order is prepared",
    output: "A preference summary",
    example:
      "Ask which substitutions are acceptable and prepare a customer-approved summary for the fulfilment team.",
    visual: "Build-your-own product studio",
    detail:
      "Let customers explore finishes, colours or combinations and save a visual shortlist for review.",
  },
  property: {
    label: "Architecture & property",
    moment: "Before a project meeting",
    output: "A project discussion pack",
    example:
      "Collect questions about spaces, priorities and approved options. Prepare an editable pack for the project team.",
    visual: "An interactive project story",
    detail:
      "Explore an approved model, compare agreed options and return to the same view after a meeting.",
  },
  mobility: {
    label: "Automotive & mobility",
    moment: "While a vehicle is serviced",
    output: "A service explanation",
    example:
      "Explain approved inspection findings, collect questions and prepare options for the service adviser.",
    visual: "A vehicle walk-through",
    detail:
      "Use approved vehicle imagery to explain features and prepare a customer-selected comparison.",
  },
  care: {
    label: "Care & community",
    moment: "Before an appointment or visit",
    output: "A visit preparation pack",
    example:
      "Prepare non-clinical questions, access preferences and practical details for a named team. Do not infer health needs.",
    visual: "An accessible place preview",
    detail:
      "Show approved spaces, arrival information and accessibility details before a visit. Keep sensitive information out of the demo.",
  },
};
type Sector = keyof typeof sectors;
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const download = (body: string, name: string, type: string) => {
  const u = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1500);
};
export function ImplementationPlan({ report }: { report: Report }) {
  const [sector, setSector] = useState<Sector>("services");
  const [goal, setGoal] = useState("Reduce repeated customer questions");
  const idea = sectors[sector];
  const fixes = report.checks.filter(
    (c) =>
      c.status !== "pass" &&
      c.scored !== false &&
      c.id !== "llms" &&
      c.id !== "questions",
  );
  const selected = fixes.length
    ? fixes
    : [
        {
          id: "review",
          label: "Verify the rendered customer journey",
          status: "review",
          detail:
            "The measured foundations passed. This does not prove search visibility or journey quality.",
          fix: "Use Search Console URL Inspection, then complete the main customer task on a phone with keyboard access.",
        },
      ];
  const slug = new URL(report.url).hostname.replace(/[^a-z0-9.-]/gi, "-");
  const plan = {
    business: report.site,
    url: report.url,
    checkedAt: report.checkedAt,
    sector: idea.label,
    goal,
    basis:
      "Public-page check plus your selected business type and goal. Proposed concepts, not a completed implementation.",
    steps: selected.map((c, i) => ({
      priority: i + 1,
      task: c.label,
      evidence: c.detail,
      implementation: c.fix,
      owner: "Website owner or developer",
      verify:
        "Compare the published change with the source, then rerun the check and inspect the rendered page.",
    })),
    concept: {
      moment: idea.moment,
      output: idea.output,
      preparation: idea.example,
      visual: idea.visual,
      detail: idea.detail,
    },
    pilot: {
      scope: "One journey, approved or synthetic data, one named reviewer.",
      measure:
        "Record the baseline, then compare completion, understanding, handoff quality and corrections.",
      gate: "Review consent, accessibility and evidence before any live integration.",
    },
  };
  const saveStarter = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: report.site,
      url: report.url,
      description:
        "REPLACE WITH A VERIFIED DESCRIPTION THAT MATCHES THE VISIBLE PAGE",
    };
    download(
      "# Website implementation starter\n\nSource: " +
        report.url +
        "\nChecked: " +
        report.checkedAt +
        "\n\nDRAFT: Confirm the business name (currently the page title), description and appropriate schema type before publishing. Never publish the placeholder.\n\n## Organization JSON-LD\n\n```json\n" +
        JSON.stringify(schema, null, 2) +
        '\n```\n\nAdd the reviewed JSON to a script element with type="application/ld+json". Match visible page facts. Validate using a structured-data validator.\n\n## Visible introduction\n\n[Business name] helps [customers] with [specific service] in [verified service area]. Start by [actual next step].\n\n## Three useful customer answers\n\n- What can you help me with?\n- What information do I need before contacting you?\n- What happens after I enquire, and who can I contact?\n\nAnswer from approved business information. Do not invent prices, dates or policies.\n\n## Release checklist\n\n- Verify all placeholders and claims with the business owner.\n- Check rendered content on mobile and with a keyboard.\n- Inspect indexing and crawl settings in Search Console.\n- Keep training and search crawler permissions separate.\n- Rerun the public-page check; no ranking or citation outcome is guaranteed.\n',
      slug + "-implementation-starter.md",
      "text/markdown",
    );
  };
  const savePlan = () => {
    const rows = plan.steps
      .map(
        (s) =>
          `<article><small>PRIORITY ${s.priority} · WEBSITE OWNER / DEVELOPER</small><h2>${escape(s.task)}</h2><p>${escape(s.evidence)}</p><p><b>Implement:</b> ${escape(s.implementation)}</p><p><b>Verify:</b> ${escape(s.verify)}</p></article>`,
      )
      .join("");
    download(
      `<!doctype html><html lang="en-NZ"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(report.site)} · action plan</title><style>body{margin:0;background:#fffdfb;color:#492b3e;font:17px/1.6 system-ui}main{max-width:980px;margin:auto;padding:5vw}header{background:#240b21;color:#fffdfb;padding:48px;border-radius:20px}h1{font-size:clamp(36px,6vw,70px);line-height:1.05;letter-spacing:-.05em}small{font-size:12px;letter-spacing:.06em}article{padding:28px 0;border-bottom:1px solid #dfd8da}.flow{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.flow p{background:#f5f1f2;padding:22px;border-radius:12px}a{color:inherit}@media(max-width:600px){.flow{grid-template-columns:1fr}header{padding:24px}}@media print{header{background:white;color:#492b3e}article{break-inside:avoid}}</style><main><header><small>assembl · WEBSITE ACTION PLAN · PREPARED DRAFT</small><h1>${escape(report.site)}</h1><p>${escape(goal)}</p><p>${escape(report.url)} · ${escape(report.checkedAt.slice(0, 10))}</p></header><p>${escape(plan.basis)}</p>${rows}<article><small>PROPOSED EXPERIENCE · ${escape(idea.label)}</small><h2>${escape(idea.visual)}</h2><p>${escape(idea.detail)}</p><div class="flow"><p>01 · ${escape(idea.moment)}</p><p>02 · ${escape(idea.output)}</p><p>03 · Customer review → named team</p></div><p>${escape(idea.example)}</p><p>Customer can skip. Prepare, save and share are separate permissions. Nothing sends or books in this concept.</p></article><article><h2>Your smallest useful pilot</h2><p>${escape(plan.pilot.scope)}</p><p>${escape(plan.pilot.measure)}</p><p>${escape(plan.pilot.gate)}</p></article><footer><p>These checks do not measure rankings, citations or AI visibility. <a href="https://developers.google.com/search/docs/appearance/ai-features">Google’s guidance</a></p><p>Prepared with assembl · <a href="https://www.assembl.co.nz/contact">Discuss this plan</a></p></footer></main></html>`,
      `${slug}-action-plan.html`,
      "text/html",
    );
  };
  return (
    <section
      className="implementation-plan"
      aria-labelledby="implementation-title"
    >
      <p className="airdy-doc-kicker">YOUR NEXT STEP · NO EMAIL REQUIRED</p>
      <h3 id="implementation-title">From findings to useful work.</h3>
      <p>
        Choose your context to shape a practical plan. These are proposed
        starting points for your business to review.
      </p>
      <div className="plan-inputs">
        <label>
          Business type
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value as Sector)}
          >
            {Object.entries(sectors).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          First priority
          <select value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option>Reduce repeated customer questions</option>
            <option>Prepare better enquiries</option>
            <option>Explain a complex product or place</option>
            <option>Improve the handoff to our team</option>
          </select>
        </label>
      </div>
      <p>
        <b>Your priority:</b> {goal}
      </p>
      <div className="plan-fixes">
        {selected.slice(0, 3).map((c, i) => (
          <article key={c.id}>
            <span>0{i + 1} / FOUNDATION</span>
            <h4>{c.label}</h4>
            <p>{c.fix}</p>
            <small>
              Owner: website team · Verify in the published page and rerun the
              check.
            </small>
          </article>
        ))}
      </div>
      <div className="plan-concept">
        <div>
          <span>PROPOSED EXPERIENCE</span>
          <h4>{idea.visual}</h4>
          <p>{idea.detail}</p>
        </div>
        <ol>
          <li>
            <b>01 / The moment</b>
            {idea.moment}
          </li>
          <li>
            <b>02 / Prepare</b>
            {idea.output}
          </li>
          <li>
            <b>03 / Review</b>Customer edits → named team
          </li>
        </ol>
        <p>{idea.example}</p>
        <small>
          Optional participation. Separate permission to share. No live
          integration implied.
        </small>
      </div>
      <div className="airdy-ctx-row">
        <button type="button" onClick={savePlan}>
          Download visual action plan
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() =>
            download(
              JSON.stringify(plan, null, 2),
              `${slug}-implementation.json`,
              "application/json",
            )
          }
        >
          Developer handoff
        </button>
        <button type="button" className="ghost" onClick={saveStarter}>
          Implementation starter
        </button>
        <Link href="/contact">Discuss a small pilot ↗</Link>
      </div>
      <p className="airdy-note">
        Your HTML plan opens in a browser and prints to PDF. Review before
        sharing; no automatic publishing.
      </p>
    </section>
  );
}
