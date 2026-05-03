import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Workflow } from "lucide-react";
import { toast } from "sonner";

type Sector = "waihanga" | "architecture" | "engineering" | "customs" | "logistics" | "manaaki" | "arataki";

interface WorkflowDef {
  id: string;
  sector: Sector;
  title: string;
  chain: string;
  example: Record<string, unknown>;
}

const WORKFLOWS: WorkflowDef[] = [
  // Waihanga
  { id: "retention_compliance_loop", sector: "waihanga", title: "Retention Money Compliance Loop", chain: "LEDGER → APEX → ANCHOR → AROHA → MANA",
    example: { contract_ref: "CON-2026-014", subcontractor_name: "Pacific Plumbing Ltd", invoice_amount_nzd: 85000, retention_pct: 10, trigger_event: "progress" } },
  { id: "payment_claim_generator", sector: "waihanga", title: "Payment Claim Generator (CCA s.20)", chain: "KAUPAPA → APEX → ANCHOR → LEDGER → AROHA",
    example: { contract_ref: "CON-2026-014", principal_name: "Auckland Build Co", principal_email: "accounts@aucklandbuild.co.nz", claim_period: "2026-04", sum_claimed_nzd: 142500, retention_deduction_nzd: 14250 } },
  { id: "daily_site_safety", sector: "waihanga", title: "Daily Site Safety Loop", chain: "ĀRAI → PULSE → APEX → MANA",
    example: { toolbox_topic: "Working at heights — scaffold inspection", attendees: ["Sam P.", "Tane H."], hazards: ["Wet deck"], incidents: [], notifiable: false } },
  { id: "consent_readiness_precheck", sector: "waihanga", title: "Consent Readiness Pre-Check", chain: "ARC → APEX → ANCHOR → KAHU",
    example: { council: "Auckland", consent_type: "residential", project_ref: "PRJ-2026-007", drawings_provided: true } },

  // Architecture
  { id: "producer_statement_gate", sector: "architecture", title: "Producer Statement Gate", chain: "APEX → ANCHOR → ARC → MANA",
    example: { project_ref: "ARC-2026-22", ps_type: "PS1", clauses_signed: ["B1", "E2", "E3"], architect_registration: "NZRAB-12345" } },
  { id: "scope_creep_variation_letter", sector: "architecture", title: "Scope Creep Detector + Variation Letter", chain: "PRISM → ANCHOR → LEDGER → AROHA",
    example: { project_ref: "ARC-2026-22", original_scope: "3-bedroom, single storey, 180m²", client_request: "Could we also look at adding a basement and a second living wing?", hourly_rate_nzd: 220 } },
  { id: "pi_renewal_brief_builder", sector: "architecture", title: "PI Renewal Brief Builder (running)", chain: "VAULT → LEDGER → ANCHOR → APEX",
    example: { practice_name: "Hudson Architects", projects_live: 14, fee_income_ytd_nzd: 1240000, claims_history: [], renewal_month: "2026-08" } },

  // Engineering
  { id: "live_utilisation_forecast", sector: "engineering", title: "Live Utilisation & Forecast", chain: "AXIS → LEDGER → PULSE → AROHA",
    example: { team: "Structural", engineers: [{ name: "Aroha S.", utilisation_7d: 0.58 }, { name: "Ravi P.", utilisation_7d: 0.92 }], window: "2026-04-11 to 2026-04-17" } },
  { id: "historical_hours_proposal_challenger", sector: "engineering", title: "Historical-Hours Proposal Challenger", chain: "APEX → AXIS → LEDGER",
    example: { project_ref: "ENG-2026-44", work_packages: [{ scope: "Geotech assessment, 2-storey resi", proposed_hours: 18 }, { scope: "Structural design, 2-storey resi", proposed_hours: 42 }] } },
  { id: "tender_response_auto_draft", sector: "engineering", title: "Tender Response Auto-Draft (GETS)", chain: "APEX → PRISM → TIKA → AROHA",
    example: { tender_id: "GETS-2026-1142", client: "Waka Kotahi", scope: "Bridge inspection, North Island state highway", value_band: "$500k-$1M", te_tiriti_weight: 0.15 } },

  // Customs
  { id: "landed_cost_calculator", sector: "customs", title: "Landed Cost Calculator (post-April 2026)", chain: "APEX → LEDGER → ANCHOR",
    example: { hs_code: "8517.13.00", origin_country: "China", cif_value_nzd: 24000, mode: "sea", commodity: "Mobile phones" } },
  { id: "biosecurity_pre_clearance", sector: "customs", title: "Biosecurity Pre-Clearance Accelerator", chain: "APEX → ANCHOR → AROHA → SIGNAL",
    example: { shipment_ref: "SHP-2026-882", commodity: "Used vehicles", origin_country: "Japan", vessel_eta: "2026-04-25", treatment_cert_received: false } },
  { id: "fta_preference_claim", sector: "customs", title: "FTA Preference Claim Builder", chain: "ANCHOR → APEX → LEDGER",
    example: { hs_code: "6109.10.00", origin_country: "Vietnam", cif_value_nzd: 58000, supplier: "Saigon Knit Co" } },
  { id: "cbam_emissions_reporting", sector: "customs", title: "CBAM / Emissions Reporting", chain: "TERRA → LEDGER → ANCHOR",
    example: { destination: "EU (Rotterdam)", commodity: "Steel coil", weight_tonnes: 24, mode: "sea", distance_nm: 11800, carrier: "MSC" } },

  // Logistics
  { id: "ruc_auto_reconcile", sector: "logistics", title: "RUC Auto-Reconcile & Purchase", chain: "FLUX → LEDGER → APEX",
    example: { vehicle_ref: "TRK-014", weight_band: "Type 6", hubo_current_km: 184250, hubo_period_start_km: 178100, ruc_units_remaining_km: 1200 } },
  { id: "driver_work_time_compliance", sector: "logistics", title: "Driver Work Time Compliance (real-time)", chain: "PULSE → APEX → AROHA",
    example: { driver_ref: "DR-09", on_duty_hours_24h: 12.2, last_break_min: 45, last_break_at_hours_ago: 5.8, location: "Bombay Hills" } },
  { id: "contractor_gateway_audit", sector: "logistics", title: "Contractor Gateway Test + Reclassification", chain: "AROHA → ANCHOR → LEDGER",
    example: { contractor_name: "Pete Owner-Driver Ltd", arrangement_years: 4, control_score: "high (route, hours, livery dictated)", integration: "high (uniform, exclusive)", economic_reality: "sole client", gross_paid_3y_nzd: 420000 } },

  // Manaaki (hospitality)
  { id: "daily_food_safety_diary", sector: "manaaki", title: "Daily Food Safety Diary", chain: "AURA → APEX → MANA",
    example: { venue_ref: "Kingi Cafe Ponsonby", shift: "open", fridge_temp_c: 3.8, hot_hold_c: 64, cleaning_done: true, allergen_signage: true, staff_health_declaration: true } },
  { id: "labour_cost_optimiser", sector: "manaaki", title: "Labour Cost Optimiser (rolling 7-day)", chain: "AURA → AROHA → LEDGER",
    example: { venue_ref: "Kingi Cafe Ponsonby", week_start: "2026-04-21", forecast_revenue_nzd: 38500, weather: "Fine, 19°C", local_events: ["Eden Park - rugby Sat 19:00"], target_labour_pct: 30 } },
  { id: "menu_gp_monitor", sector: "manaaki", title: "Menu GP Monitor", chain: "AURA → LEDGER → PRISM",
    example: { venue_ref: "Kingi Cafe Ponsonby", dish: "Eggs Benedict", current_price_nzd: 24, current_food_cost_nzd: 8.20, target_gp_pct: 70, supplier_movement_pct: 6.5 } },
  { id: "review_response_engine", sector: "manaaki", title: "Review Response Engine", chain: "AURA → PRISM → NOVA",
    example: { venue_ref: "Kingi Cafe Ponsonby", platform: "Google", rating: 1, review_text: "Server forgot my gluten allergy and brought sourdough. Sick all night.", venue_voice: "warm, accountable, no excuses" } },
  { id: "alcohol_licence_renewal", sector: "manaaki", title: "Alcohol Licence Renewal", chain: "ANCHOR → AURA → KAHU",
    example: { venue_ref: "Kingi Cafe Ponsonby", licence_type: "On-licence", current_expiry: "2026-08-15", manager_certificates: ["Ana M. (exp 2027-03)"], lap_district: "Auckland" } },
  { id: "staff_induction_pipeline", sector: "manaaki", title: "Staff Induction Pipeline", chain: "AROHA → AURA",
    example: { venue_ref: "Kingi Cafe Ponsonby", new_hire_name: "Mere T.", role: "Front of house", start_date: "2026-04-22", phone: "+642100000000" } },
  { id: "experiential_story_builder", sector: "manaaki", title: "Experiential / Provenance Story Builder", chain: "PRISM → AURA",
    example: { venue_ref: "Kingi Cafe Ponsonby", focus_dish: "Cloudy Bay clams, kawakawa butter", producer: "Marlborough Wild Catch", channel: "Instagram + menu insert" } },

  // Arataki (automotive)
  { id: "wof_fleet_scheduler", sector: "arataki", title: "WoF Fleet Scheduler (Nov 2026 ready)", chain: "APEX → FLUX → AROHA → ANCHOR",
    example: { fleet_name: "South Auckland Couriers", vehicles: [{ rego: "ABC123", year: 2016, model: "Hilux", first_reg_date: "2016-04-12" }, { rego: "XYZ789", year: 2021, model: "Ranger", first_reg_date: "2021-01-22" }] } },
  { id: "cin_generator_validator", sector: "arataki", title: "CIN Generator & Validator", chain: "APEX → ANCHOR → PRISM → MANA",
    example: { dealer_name: "Manukau Motors Ltd", mvtr_number: "M123456", vin: "JTHBJ46G102123456", rego: "DEF456", year_first_reg_nz: 2018, odometer_km: 84200, cash_price_nzd: 18990, security_interest: true } },
  { id: "mvdt_defence_pack", sector: "arataki", title: "MVDT Defence Pack Auto-Build", chain: "APEX → ANCHOR → MANA → NOVA",
    example: { dealer_name: "Manukau Motors Ltd", customer: "S. Patel", vin: "JTHBJ46G102123456", sale_date: "2026-02-10", complaint: "Engine misfire 6 weeks after purchase", pre_sale_disclosures: ["Test drive offered", "CIN signed"] } },
  { id: "vehicle_entry_precheck", sector: "arataki", title: "Vehicle Entry Pre-Check (import)", chain: "APEX → ANCHOR → SIGNAL",
    example: { vin: "ZAR94000007012345", origin_country: "Japan", year: 2018, make: "Toyota", model: "Aqua", esc_factory_fitted: "unknown", emissions_grade: "Japan 05" } },
  { id: "workshop_utilisation_no_show", sector: "arataki", title: "Workshop Utilisation + No-Show Triage", chain: "AXIS → FLUX → AROHA → LEDGER",
    example: { workshop: "Hudson Auto", week: "2026-04-21", hoists: 4, bookings: 36, average_job_hours: 1.8, last_week_no_show_pct: 18 } },
  { id: "ev_hv_safe_work_decision_tree", sector: "arataki", title: "EV / HV Safe Work Decision Tree", chain: "PULSE → APEX → AURA → MANA",
    example: { workshop: "Hudson Auto", vin: "JN1FE0NE5GP123456", make: "Nissan", model: "Leaf", year: 2017, planned_work: "Brake pad replacement (no HV touch)", mechanic_certified_hv: false } },
  { id: "automotive_review_engine", sector: "arataki", title: "Automotive Review Response Engine", chain: "AURA → PRISM → NOVA",
    example: { workshop: "Hudson Auto", platform: "Google", rating: 1, review_text: "Charged me $1200 for a clutch and it slipped 3 weeks later.", workshop_voice: "professional, fair, action-oriented" } },
];

const SECTORS: Array<{ id: Sector; label: string }> = [
  { id: "waihanga", label: "Waihanga (Construction)" },
  { id: "architecture", label: "Architecture" },
  { id: "engineering", label: "Engineering Consultancy" },
  { id: "customs", label: "Pikau (Customs/Freight)" },
  { id: "logistics", label: "Logistics & Transport" },
  { id: "manaaki", label: "Manaaki (Hospitality)" },
  { id: "arataki", label: "Arataki (Automotive)" },
];

export default function SectorWorkflows() {
  const { user } = useAuth();
  const [sector, setSector] = useState<Sector>("waihanga");
  const sectorWorkflows = useMemo(() => WORKFLOWS.filter((w) => w.sector === sector), [sector]);
  const [selected, setSelected] = useState<string>(sectorWorkflows[0]?.id);
  const [payload, setPayload] = useState(JSON.stringify(sectorWorkflows[0]?.example, null, 2));
  const [running, setRunning] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ agent: string; output: string }>>([]);
  const [runs, setRuns] = useState<any[]>([]);

  useEffect(() => {
    const list = WORKFLOWS.filter((w) => w.sector === sector);
    setSelected(list[0]?.id);
    setPayload(JSON.stringify(list[0]?.example, null, 2));
    setTranscript([]);
  }, [sector]);

  useEffect(() => {
    const wf = WORKFLOWS.find((w) => w.id === selected);
    if (wf) setPayload(JSON.stringify(wf.example, null, 2));
  }, [selected]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("waihanga_workflow_runs")
      .select("id, workflow_type, status, started_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setRuns(data || []));
  }, [user, transcript]);

  const run = async () => {
    if (!user) { toast.error("Sign in first"); return; }
    let parsed: any;
    try { parsed = JSON.parse(payload); } catch { toast.error("Invalid JSON payload"); return; }
    setRunning(true);
    setTranscript([]);
    try {
      const { data, error } = await supabase.functions.invoke("waihanga-orchestrator", {
        body: { workflow: selected, payload: parsed, userId: user.id },
      });
      if (error) throw error;
      setTranscript(data.transcript || []);
      toast.success(`Workflow completed — run ${data.run_id?.slice(0, 8)}`);
    } catch (e: any) {
      toast.error(e?.message || "Workflow failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Workflow className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-light text-foreground">Sector End-to-End Workflows</h1>
        </div>
        <p className="text-muted-foreground">31 multi-agent orchestrations across 7 sectors — grounded in NZ statute (CCA 2002, NZIA AAS, NZS3917, Customs Act 2018, RUC Act 2012, HSWA 2015, Land Transport Rules + Nov 2026 WoF amendments, Food Act 2014, Sale &amp; Supply of Alcohol Act 2012, MVSA 2003, EU CBAM).</p>
      </header>

      <Tabs value={sector} onValueChange={(v) => setSector(v as Sector)} className="mb-6">
        <TabsList className="flex flex-wrap h-auto">
          {SECTORS.map((s) => <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}
        </TabsList>
        {SECTORS.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-4">
            <div className="grid lg:grid-cols-2 gap-3">
              {WORKFLOWS.filter((w) => w.sector === s.id).map((wf) => (
                <Card key={wf.id}
                  className={`p-4 cursor-pointer transition ${selected === wf.id ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                  onClick={() => setSelected(wf.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-foreground">{wf.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{wf.chain}</p>
                    </div>
                    {selected === wf.id && <Badge>Selected</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="p-6 mb-6">
        <label className="text-sm font-medium text-foreground mb-2 block">Trigger payload (JSON)</label>
        <Textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={9} className="font-mono text-xs mb-4" />
        <Button onClick={run} disabled={running} size="lg">
          {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running chain…</> : "Run workflow"}
        </Button>
      </Card>

      {transcript.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="font-medium mb-4 text-foreground">Agent Chain Output</h3>
          <div className="space-y-4">
            {transcript.map((t, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <Badge variant="outline" className="mb-2">{i + 1}. {t.agent}</Badge>
                <pre className="text-sm whitespace-pre-wrap text-foreground/90">{t.output}</pre>
              </div>
            ))}
          </div>
        </Card>
      )}

      {runs.length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium mb-3 text-foreground">Recent runs</h3>
          <div className="space-y-2">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{r.id.slice(0, 8)}</span>
                <span className="text-foreground">{r.workflow_type}</span>
                <Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(r.started_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
