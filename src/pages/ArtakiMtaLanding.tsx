// ═══════════════════════════════════════════════════════════════
// /arataki/mta — distribution landing aimed at MTA members
// (~4,000 mechanics, dealers, WoF inspectors, collision repair)
// Wedge: November 2026 WoF rule changes (annual → biennial)
// ═══════════════════════════════════════════════════════════════
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, FileText, ShieldAlert } from "lucide-react";

export default function ArtakiMtaLanding() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <header className="space-y-4">
          <Badge variant="secondary">For MTA members · November 2026 ready</Badge>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground leading-tight">
            From 1 November 2026, half your customers' WoF schedules change.<br/>
            <span className="text-muted-foreground">Be the workshop that already knows.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Light vehicles 4–14 years old that were registered on or after 1 Nov 2019 move from annual to biennial WoF. ARATAKI generates per-vehicle compliance calendars from a rego lookup, drafts a CIN that holds up at the MVDT, and walks mechanics through HV-isolation when an EV rolls in.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <PriceCard tier="Wedge" price="$349" tagline="WoF Fleet Scheduler + CIN Generator" features={[
            "Unlimited rego lookups",
            "Nov 2026/2027 rule classification",
            "MVSA-compliant CINs",
            "Immutable CIN audit trail",
          ]} />
          <PriceCard tier="Workshop" price="$549" tagline="+ MVDT defence + workshop ops" features={[
            "Everything in Wedge",
            "MVDT defence pack auto-build",
            "Booking + utilisation triage",
            "24-hour no-show reminders",
          ]} highlighted />
          <PriceCard tier="Dealer+" price="$799" tagline="+ Vehicle entry + EV/HV safety" features={[
            "Everything in Workshop",
            "Pre-import VIN compliance check",
            "EV/HV safe-work decision tree",
            "Reputation loop across Google + Autotrader",
          ]} />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-light text-foreground">Outcome guarantee</h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-foreground"><span className="font-medium">Zero CIN-related Fair Trading Act breaches</span> across your sales for the first 12 months, or we refund the year.</p>
              <p className="text-sm text-muted-foreground">Every CIN cross-checks dealer name, MVTR number, security interest disclosure, odometer history, and price including GST against MVSA 2003 and the live Waka Kotahi vehicle data.</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <Pillar icon={Calendar} title="WoF Fleet Scheduler" body="Rego → November 2026/2027 classification → per-vehicle calendar → 14-day reminder → insurance attestation letter." />
          <Pillar icon={FileText} title="CIN Generator + Validator" body="VIN + rego → MVSA-compliant CIN → printable + online listing link → immutable versioned audit trail." />
          <Pillar icon={ShieldAlert} title="MVDT Defence Pack" body="Match the claim to the sale, compile pre-sale disclosures, repair attempts, and timestamped evidence chain — tribunal-ready." />
        </section>

        <section className="rounded-lg border bg-card p-6 space-y-3">
          <h2 className="text-xl font-light text-foreground">MTA member benefit</h2>
          <p className="text-muted-foreground">MTA members get setup credits, the first 30 days at $0, and a session with the team to wire the workflows into your existing booking system.</p>
          <div className="flex gap-3 flex-wrap pt-2">
            <Button asChild><Link to="/sector/workflows">Try the WoF Scheduler</Link></Button>
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

function Pillar({ icon: Icon, title, body }: { icon: typeof Calendar; title: string; body: string }) {
  return (
    <Card>
      <CardHeader><Icon className="w-6 h-6 text-primary" /><CardTitle className="text-base font-medium pt-2">{title}</CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}
