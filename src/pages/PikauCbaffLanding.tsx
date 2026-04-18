// ═══════════════════════════════════════════════════════════════
// /pikau/cbaff — distribution landing aimed at CBAFF members
// (Customs Brokers and Freight Forwarders Federation, ~400 firms)
// Wedge: 1 April 2026 Goods Management Levy restructure
// ═══════════════════════════════════════════════════════════════
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calculator, Shield, Clock } from "lucide-react";

export default function PikauCbaffLanding() {
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

        <section className="grid md:grid-cols-3 gap-4">
          <PriceCard tier="Wedge" price="$349" tagline="Landed Cost Calculator only" features={[
            "Unlimited consignments",
            "Live 2026 levy schedule",
            "HS code + FTA preference check",
            "Audited cost breakdown export",
          ]} />
          <PriceCard tier="Operator" price="$549" tagline="+ Biosecurity pre-clearance" features={[
            "Everything in Wedge",
            "MPI IHS auto-match",
            "TSW pre-validation",
            "Pre-arrival document review",
          ]} highlighted />
          <PriceCard tier="Bureau" price="$799" tagline="+ FTA + CBAM reporting" features={[
            "Everything in Operator",
            "Certificate of Origin builder",
            "EU CBAM emissions ledger",
            "White-label client portal",
          ]} />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-light text-foreground">Outcome guarantee</h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-foreground"><span className="font-medium">Landed-cost accuracy ≥ 99%</span> across the first 50 consignments, or your second month is free.</p>
              <p className="text-sm text-muted-foreground">Calculations grounded in the current Working Tariff Document, the 2026 Goods Management Levy schedule, and live FTA preference rules — refreshed via Firecrawl on the Customs/MPI source.</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <Pillar icon={Calculator} title="Landed Cost Calculator" body="HS code + origin + CIF + mode → 2026 levy + duty + GST + biosecurity → audited NZD breakdown. Every line item linked to its source." />
          <Pillar icon={Shield} title="Biosecurity Pre-Clearance" body="Document review against IHS for the commodity, missing-cert flagging before vessel berths, TSW response monitoring." />
          <Pillar icon={Clock} title="FTA Preference Builder" body="Identify applicable FTA + RoO test, draft Certificate of Origin request, calculate duty saving so the paperwork is justified." />
        </section>

        <section className="rounded-lg border bg-card p-6 space-y-3">
          <h2 className="text-xl font-light text-foreground">CBAFF member benefit</h2>
          <p className="text-muted-foreground">CBAFF members get setup credits and the first 30 days at $0. Mention your member number when you onboard.</p>
          <div className="flex gap-3 flex-wrap pt-2">
            <Button asChild><Link to="/sector/workflows">Try the Landed Cost Calculator</Link></Button>
            <Button variant="outline" asChild><Link to="/contact">Talk to us</Link></Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function PriceCard({ tier, price, tagline, features, highlighted }: { tier: string; price: string; tagline: string; features: string[]; highlighted?: boolean }) {
  return (
    <Card className={highlighted ? "border-primary shadow-md" : ""}>
      <CardHeader>
        <Badge variant={highlighted ? "default" : "outline"} className="w-fit">{tier}</Badge>
        <CardTitle className="text-3xl font-light pt-2">{price}<span className="text-base text-muted-foreground font-normal">/mo</span></CardTitle>
        <p className="text-sm text-muted-foreground">{tagline}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {features.map((f) => (
          <div key={f} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 mt-0.5 text-primary" /><span>{f}</span></div>
        ))}
      </CardContent>
    </Card>
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
