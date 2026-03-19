import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";

const CookiePolicy = () => (
  <div className="min-h-screen star-field flex flex-col">
    <BrandNav />
    <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-8">Cookie Policy</h1>
      <p className="text-xs text-muted-foreground mb-6">Last updated: 19 March 2026</p>

      <div className="prose-sm space-y-6 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">1. What are cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your experience.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">2. How we use cookies</h2>
          <p>Assembl uses only essential cookies required for the Platform to function. We do not use third-party advertising or tracking cookies.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">3. Types of cookies we use</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-card">
                  <th className="text-left p-3 font-bold text-foreground">Cookie</th>
                  <th className="text-left p-3 font-bold text-foreground">Purpose</th>
                  <th className="text-left p-3 font-bold text-foreground">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="p-3">Session token</td>
                  <td className="p-3">Keeps you logged in</td>
                  <td className="p-3">Session / 7 days</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3">Preferences</td>
                  <td className="p-3">Remembers onboarding completion, brand scan data</td>
                  <td className="p-3">Session</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3">CSRF protection</td>
                  <td className="p-3">Prevents cross-site request forgery</td>
                  <td className="p-3">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">4. Local storage</h2>
          <p>We also use browser local storage and session storage for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Storing your onboarding preferences</li>
            <li>Caching brand scan results for your session</li>
            <li>Tracking free message limits (anonymous users)</li>
          </ul>
          <p>This data remains on your device and is not transmitted to our servers.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">5. Managing cookies</h2>
          <p>You can control cookies through your browser settings. Note that disabling essential cookies may prevent the Platform from functioning correctly. Most browsers allow you to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>View and delete existing cookies</li>
            <li>Block all or specific cookies</li>
            <li>Set preferences for certain websites</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">6. Updates</h2>
          <p>We may update this Cookie Policy as our use of cookies changes. Check this page for the latest information.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">7. Contact</h2>
          <p>Questions? Email <a href="mailto:assembl@assembly.co.nz" className="text-primary hover:underline">assembl@assembly.co.nz</a>.</p>
        </section>
      </div>
    </main>
    <BrandFooter />
  </div>
);

export default CookiePolicy;
