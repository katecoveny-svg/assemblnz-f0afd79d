import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";

const PrivacyPolicy = () => (
  <div className="min-h-screen star-field flex flex-col relative">
    <ParticleField />
    <BrandNav />
    <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-2xl sm:text-4xl font-display font-bold text-foreground mb-4">Privacy policy</h1>
      <p className="text-sm text-primary mb-2 font-display italic">Your data is taonga — we treat it that way.</p>
      <p className="text-xs text-muted-foreground mb-8">Last updated: 31 March 2026</p>

      <div className="prose-sm space-y-6 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">1. Who we are</h2>
          <p>Assembl ("we", "us", "our") is a New Zealand-based business operating from Auckland. We provide specialist business intelligence agents through assembl.co.nz.</p>
          <p>Contact: <a href="mailto:assembl@assembl.co.nz" className="text-primary hover:underline">assembl@assembl.co.nz</a></p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">2. Our commitment — data as taonga</h2>
          <p>In Te Ao Māori, taonga means treasure — something precious that must be cared for with respect and responsibility. Assembl applies this principle of kaitiakitanga (guardianship) to every piece of data entrusted to us. Your information is not a commodity; it is a taonga we are privileged to hold.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">3. Privacy Act 2020 compliance</h2>
          <p>We comply with the New Zealand Privacy Act 2020 and the Information Privacy Principles (IPPs). We are committed to protecting your personal information and being transparent about how we collect, use, and store it.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">4. Information we collect</h2>
          <p>We may collect the following personal information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> Name, email address when you create an account</li>
            <li><strong>Contact form submissions:</strong> Name, email, and message content</li>
            <li><strong>Chat data:</strong> Messages sent to our specialist agents (used to provide the service)</li>
            <li><strong>Usage data:</strong> Pages visited, features used, anonymised analytics</li>
            <li><strong>Uploaded files:</strong> Documents or images you upload for processing by agents</li>
            <li><strong>Payment information:</strong> Processed securely by Stripe; we do not store card details</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">5. How we use your information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve our specialist agent services</li>
            <li>To respond to your enquiries and support requests</li>
            <li>To process payments and manage subscriptions</li>
            <li>To send service-related communications</li>
            <li>To comply with legal obligations under NZ law</li>
            <li>To detect and prevent fraud or misuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">6. What we will never do with your data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sell your personal information to third parties</li>
            <li>Use your data for AI model training</li>
            <li>Share your data with advertisers or marketing companies</li>
            <li>Store your data longer than necessary without clear purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">7. Third-party services</h2>
          <p>We use the following third-party services that may process your data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Cloud infrastructure:</strong> Database and authentication (industry-standard encryption)</li>
            <li><strong>Stripe:</strong> Payment processing (PCI DSS compliant)</li>
            <li><strong>AI model providers:</strong> To power agent responses (no personal data is used for model training)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">8. Data storage and security</h2>
          <p>Your data is stored securely using industry-standard encryption (TLS 1.3 in transit, AES-256 at rest). While our infrastructure may use overseas cloud servers, we take reasonable steps to ensure your data is protected in accordance with the Privacy Act 2020, including when transferred internationally (IPP 12).</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">9. Māori data sovereignty</h2>
          <p>We respect Te Mana Raraunga principles and tikanga Māori. Culturally sensitive data is handled with particular care, acknowledging the distinction between noa and tapu information. We are committed to ongoing dialogue with Māori communities about how their data is used and protected.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">10. Data retention</h2>
          <p>We retain your personal information only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Chat messages and uploaded files are not permanently stored beyond your active session unless you have an account.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">11. Your rights</h2>
          <p>Under the Privacy Act 2020, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access your personal information (IPP 6)</li>
            <li>Request correction of inaccurate information (IPP 7)</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for optional data processing</li>
          </ul>
          <p className="mt-2">To exercise these rights, email <a href="mailto:assembl@assembl.co.nz" className="text-primary hover:underline">assembl@assembl.co.nz</a> with the subject line "Privacy Request". We will respond within 20 working days.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">12. Cookies</h2>
          <p>We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising. See our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for details.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">13. Children's privacy</h2>
          <p>Our services are not directed at children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">14. Complaints</h2>
          <p>If you have a privacy complaint, please contact us at <a href="mailto:assembl@assembl.co.nz" className="text-primary hover:underline">assembl@assembl.co.nz</a>. If you are not satisfied with our response, you can lodge a complaint with the Office of the Privacy Commissioner at <a href="https://www.privacy.org.nz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy.org.nz</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">15. Changes to this policy</h2>
          <p>We may update this policy from time to time. Changes will be posted on this page with an updated date. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
        </section>
      </div>
    </main>
    <BrandFooter />
  </div>
);

export default PrivacyPolicy;
