// ═══════════════════════════════════════════════════════════════
// /pikau/cbaff — distribution landing aimed at CBAFF members
// (Customs Brokers and Freight Forwarders Federation, ~400 firms)
// Wedge: 1 April 2026 Goods Management Levy restructure
//
// Single-offer pattern (matches PearlIndex /). The previous 3-tier
// SaaS pricing ($349/$549/$799) conflicted with the homepage pilot
// narrative and was retired 2026-04-29.
// ═══════════════════════════════════════════════════════════════
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calculator, Shield, Clock } from "lucide-react";
import { track } from "@/lib/analytics";

export default function PikauCbaffLanding() {
  useEffect(() => {
    track("page_version_seen", { page: "/pikau/cbaff", version: "single_offer_v1" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <header className="space-y-4">
          <Badge variant="secondary">For CBAFF members · 1 April 2026 ready</Badge>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground leading-tight">
            Every importer's cost model just broke.<br/>
            <span className="text-muted-foreground">Rebuild it once — keep it current automatically.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            The new per-consignment Goods Management Levy, separate air/sea rates, and removed low-value-goods subsidy mean every existing landed-cost calculator is wrong. PIKAU rebuilds the calculation in real time and keeps it tied to the live Working Tariff Document.
          </p>
        </header>

        {/* Single offer — matches the homepage pilot narrative */}
        <section className="grid md:grid-cols-2 gap-6 items-start">
          <Card className="border-primary shadow-md">
            <CardHeader>
              <Badge className="w-fit">Pikau pilot · 30 days</Badge>
              <CardTitle className="text-3xl font-light pt-2">
                From NZ$5,000<span className="text-base text-muted-foreground font-normal"> ex GST</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                One painful workflow, solved in 30 days. Fixed scope, fixed timeline, evidence-backed.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Landed Cost Calculator on the live 2026 levy schedule",
                "HS code + FTA preference check, audited NZD breakdown",
                "Biosecurity pre-clearance against the relevant IHS",
                "Every line item linked to its source for audit",
                "Evidence pack you can file, forward or footnote",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-primary" />
                  <span>{f}</span>
                </div>
              ))}
              <div className="flex gap-3 flex-wrap pt-4">
                <Button asChild>
                  <Link to="/contact?offer=pikau-pilot" data-cta="pikau-cbaff-book-pilot">
                    Book a pilot
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/sample-evidence-pack" data-cta="pikau-cbaff-see-pack">
                    See a sample pack
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Outcome guarantee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-foreground text-sm">
                <span className="font-medium">Landed-cost accuracy ≥ 99%</span> across the first 50 consignments, or the next 30 days are on us.
              </p>
              <p className="text-sm text-muted-foreground">
                Calculations grounded in the current Working Tariff Document, the 2026 Goods Management Levy schedule, and live FTA preference rules — refreshed via Firecrawl on the Customs/MPI source.
              </p>
              <p className="text-sm text-muted-foreground">
                CBAFF members: mention your member number when you book — setup credits apply.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <Pillar icon={Calculator} title="Landed Cost Calculator" body="HS code + origin + CIF + mode → 2026 levy + duty + GST + biosecurity → audited NZD breakdown. Every line item linked to its source." />
          <Pillar icon={Shield} title="Biosecurity Pre-Clearance" body="Document review against IHS for the commodity, missing-cert flagging before vessel berths, TSW response monitoring." />
          <Pillar icon={Clock} title="FTA Preference Builder" body="Identify applicable FTA + RoO test, draft Certificate of Origin request, calculate duty saving so the paperwork is justified." />
        </section>

        <section className="rounded-lg border bg-card p-6 space-y-3">
          <h2 className="text-xl font-light text-foreground">Talk to us before 1 April</h2>
          <p className="text-muted-foreground">
            The levy restructure is a one-off rebuild moment. We're taking a small number of CBAFF pilot slots before the cutover.
          </p>
          <div className="flex gap-3 flex-wrap pt-2">
            <Button asChild>
              <Link to="/contact?offer=pikau-pilot" data-cta="pikau-cbaff-book-pilot-bottom">
                Book a pilot
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact" data-cta="pikau-cbaff-talk">Talk to us</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Pillar({ icon: Icon, title, body }: { icon: typeof Calculator; title: string; body: string }) {
  return (
    <Card>
      <CardHeader><Icon className="w-6 h-6 text-primary" /><CardTitle className="text-base font-medium pt-2">{title}</CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}
