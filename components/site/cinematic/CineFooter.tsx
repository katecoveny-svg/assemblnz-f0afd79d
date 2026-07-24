/**
 * Shared footer for the cinematic pages. The legal pages, trust centre and
 * creative playground already exist as routes — this just makes them
 * reachable from the public site, plus a sign-in path into the marketplace.
 */
export function CineFooter() {
  return (
    <footer>
      <nav className="foot-links" aria-label="legal and account">
        <a href="/concepts">concepts</a>
        <a href="/legal/privacy">privacy</a>
        <a href="/legal/terms">terms</a>
        <a href="/legal/disclaimer">disclaimer</a>
        <a href="/trust">trust centre</a>
        <a href="/creative-playground">creative playground</a>
        {/* Supabase auth lives on the demo host; www /login hard-redirects home. */}
        <a href="https://demo.assembl.co.nz/admin/login">sign in</a>
      </nav>
      <div>assembl · aotearoa new zealand · assembl@assembl.co.nz · © 2026</div>
    </footer>
  );
}
