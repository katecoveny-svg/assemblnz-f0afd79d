import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assembl MCP · governed tools for work and proof',
  description: 'How Assembl exposes tenant-governed work, proof and approval requests through MCP.',
};

export default function McpDocsPage() {
  return (
    <main className="min-h-screen bg-[#fffdfb] px-6 py-16 text-[#313c42]">
      <article className="mx-auto max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#916A70]">assembl · mcp</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">A governed doorway into Assembl.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#667176]">
          Assembl MCP lets authorised tools such as ChatGPT or Codex read work and proof, create proposed internal work, and place drafts into the human approval queue. MCP does not bypass the Assembl runtime, permissions, approvals or evidence ledger.
        </p>

        <section className="mt-10 rounded-3xl border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold">Current tools</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            <li><strong>list_work</strong> — recent work in the authorised workspace.</li>
            <li><strong>get_work_item</strong> — task detail, plan and activity.</li>
            <li><strong>read_proof</strong> — evidence attached to work.</li>
            <li><strong>create_work_item</strong> — creates a proposed internal task only.</li>
            <li><strong>request_action_approval</strong> — places an email draft into the human approval queue; it does not send.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold">Authorization model</h2>
          <p className="mt-3 text-sm leading-6 text-[#667176]">
            OAuth 2.1 proves the user identity. Assembl then resolves the user to an explicit tenant membership and business permissions. Tenant identity cannot be supplied or overridden by a model tool call.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#667176]">
            Sending, publishing, spending, deleting and consequential external changes remain separate Assembl capabilities with their own policy and human-approval boundaries.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-black/10 bg-[#f5f1f2] p-6">
          <h2 className="text-xl font-semibold">For administrators</h2>
          <p className="mt-3 text-sm leading-6 text-[#667176]">
            Production access is granted per user and workspace. Revoke the OAuth grant or the Assembl MCP membership to remove access. Write tools can also be disabled globally without affecting read-only access.
          </p>
        </section>
      </article>
    </main>
  );
}
