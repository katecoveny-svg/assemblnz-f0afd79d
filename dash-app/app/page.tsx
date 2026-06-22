import DashLoader from "@/components/DashLoader";

export default function Home() {
  return (
    <main className="page">
      <div className="k">Dash · by Assembl · agent-working demo</div>
      <h1>Get paid for the wait 🌭</h1>
      <p className="muted">
        Below is a pretend NZ AI agent running a long task. The Dash loader turns that wait into a
        reward. This runs in <b>demo mode</b> out of the box — wire up Supabase later to make it real.
      </p>

      {/* A pretend host app (e.g. an Ambit-style agent) with Dash mounted in its "working" state */}
      <div className="app">
        <div className="hdr">
          <div className="logo" />
          <div>
            <b>Kōwhai Assistant</b>
            <small>NZ AI agent · powered by Dash</small>
          </div>
        </div>
        <div className="msg me">Sort my March invoices and chase the overdue ones.</div>
        <div className="msg bot">On it — this&apos;ll take a couple of minutes. I&apos;ll work in the background.</div>

        {/* The whole product, in one component */}
        <DashLoader context="agent_working" hostName="Kōwhai Assistant" />
      </div>

      <p className="muted" style={{ marginTop: 24 }}>
        See your <a href="/wallet">wallet →</a> · Next steps in <code>README.md</code>,{" "}
        <code>WIRING-SUPABASE.md</code> and <code>dash-build-checklist.md</code>.
      </p>
    </main>
  );
}
