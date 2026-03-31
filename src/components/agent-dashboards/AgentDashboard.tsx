import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const GLASS = { background: "rgba(15,15,18,0.8)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const TIP_STYLE = { contentStyle: { background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }, labelStyle: { color: "#A1A1AA" } };

// ─── Shared metric card ───
const Metric = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) => (
  <div className="rounded-lg p-3" style={{ ...GLASS }}>
    <p className="text-[10px] font-body" style={{ color: "#71717A" }}>{label}</p>
    <p className="font-display font-bold text-lg" style={{ color }}>{value}</p>
    {sub && <p className="text-[9px]" style={{ color: "#52525B" }}>{sub}</p>}
  </div>
);

// ─── Shared mini table ───
const MiniTable = ({ headers, rows, color }: { headers: string[]; rows: string[][]; color: string }) => (
  <div className="rounded-lg overflow-hidden" style={{ ...GLASS }}>
    <table className="w-full text-[10px] font-body">
      <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {headers.map(h => <th key={h} className="text-left p-2" style={{ color: "#71717A" }}>{h}</th>)}
      </tr></thead>
      <tbody>{rows.map((r, i) => (
        <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
          {r.map((c, j) => <td key={j} className="p-2" style={{ color: j === 0 ? color : "#A1A1AA" }}>{c}</td>)}
        </tr>
      ))}</tbody>
    </table>
  </div>
);

// ─── Status badge ───
const Badge = ({ label, color }: { label: string; color: string }) => (
  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>{label}</span>
);

// ─── Progress bar ───
const Progress = ({ value, color }: { value: number; color: string }) => (
  <div className="h-1.5 rounded-full w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
  </div>
);

// ============================================================
// DASHBOARD CONFIGS — each agent gets a unique dashboard
// ============================================================

const monthlyData = [
  { m: "Oct", v: 12400 }, { m: "Nov", v: 15800 }, { m: "Dec", v: 22100 },
  { m: "Jan", v: 18300 }, { m: "Feb", v: 21700 }, { m: "Mar", v: 24500 },
];

const weeklyData = [
  { d: "Mon", v: 12 }, { d: "Tue", v: 18 }, { d: "Wed", v: 15 },
  { d: "Thu", v: 22 }, { d: "Fri", v: 28 }, { d: "Sat", v: 8 }, { d: "Sun", v: 5 },
];

// ─── Individual agent dashboard renderers ───

const EchoDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Messages Today" value="47" sub="↑ 23% vs yesterday" color={color} />
      <Metric label="Active Users" value="12" sub="3 new this week" color={color} />
      <Metric label="Avg Response" value="2.1s" sub="Target: <3s" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Weekly Message Volume</p>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={weeklyData}><Area type="monotone" dataKey="v" stroke={color} fill={`${color}20`} strokeWidth={2} /><XAxis dataKey="d" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} /><Tooltip {...TIP_STYLE} /></AreaChart>
      </ResponsiveContainer>
    </div>
    <MiniTable headers={["Agent", "Handoffs", "Status"]} rows={[["PRISM", "8 this week", "Active"], ["FLUX", "5 this week", "Active"], ["LEDGER", "3 this week", "Active"]]} color={color} />
  </div>
);

const FluxDash = ({ color, data }: { color: string; data: any }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Pipeline Value" value={`$${data.pipelineValue || "127K"}`} color={color} />
      <Metric label="Active Leads" value={`${data.leadCount || 0}`} sub="Across all stages" color={color} />
      <Metric label="Win Rate" value="34%" sub="Last 90 days" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Pipeline by Stage</p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={[{ s: "New", v: data.stages?.new || 8 }, { s: "Contacted", v: data.stages?.contacted || 5 }, { s: "Qualified", v: data.stages?.qualified || 3 }, { s: "Proposal", v: data.stages?.proposal || 2 }, { s: "Won", v: data.stages?.won || 1 }]}>
          <Bar dataKey="v" fill={color} radius={[4, 4, 0, 0]} /><XAxis dataKey="s" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} /><Tooltip {...TIP_STYLE} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const HavenDash = ({ color, data }: { color: string; data: any }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Properties" value={`${data.propertyCount || 0}`} color={color} />
      <Metric label="Active Jobs" value={`${data.jobCount || 0}`} color={color} />
      <Metric label="Compliance" value={`${data.complianceScore || 0}%`} sub={data.complianceScore >= 80 ? "On track" : "Needs attention"} color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Maintenance by Urgency</p>
      <ResponsiveContainer width="100%" height={100}>
        <PieChart><Pie data={[{ n: "Low", v: data.urgency?.low || 3 }, { n: "Medium", v: data.urgency?.medium || 5 }, { n: "High", v: data.urgency?.high || 2 }, { n: "Emergency", v: data.urgency?.emergency || 1 }]} cx="50%" cy="50%" outerRadius={40} dataKey="v" label={({ n }) => n}>
          {["#10B981", "#3A6A9C", "#3A6A9C", "#E040FB"].map((c, i) => <Cell key={i} fill={c} />)}
        </Pie><Tooltip {...TIP_STYLE} /></PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const LedgerDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Revenue (MTD)" value="$24.5K" sub="↑ 12% vs last month" color={color} />
      <Metric label="GST Owing" value="$4,230" sub="Due 28 Mar" color={color} />
      <Metric label="Invoices Out" value="7" sub="$18.2K outstanding" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Monthly Revenue Trend</p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={monthlyData}><Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} /><XAxis dataKey="m" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} /><Tooltip {...TIP_STYLE} /></LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const PrismDash = ({ color, data }: { color: string; data: any }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Posts Created" value={`${data.postCount || 0}`} color={color} />
      <Metric label="Campaigns" value={`${data.campaignCount || 0}`} sub="Active drafts" color={color} />
      <Metric label="Brand Score" value="94%" sub="DNA match" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Content by Platform</p>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={[{ p: "LinkedIn", v: 12 }, { p: "Instagram", v: 18 }, { p: "Facebook", v: 8 }, { p: "TikTok", v: 5 }]} layout="vertical">
          <Bar dataKey="v" fill={color} radius={[0, 4, 4, 0]} /><YAxis dataKey="p" type="category" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} width={60} /><Tooltip {...TIP_STYLE} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ArohaDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Team Size" value="12" sub="2 on leave" color={color} />
      <Metric label="Leave Balance" value="186 days" sub="Across team" color={color} />
      <Metric label="Compliance" value="98%" sub="ERA 2026 ready" color={color} />
    </div>
    <MiniTable headers={["Employee", "Role", "Status"]} rows={[["Sarah Chen", "Operations Manager", "Active"], ["James Patel", "Sales Lead", "On Leave"], ["Mia Johnson", "Designer", "Probation"]]} color={color} />
  </div>
);

const HelmDash = ({ color, data }: { color: string; data: any }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Children" value={`${data.childCount || 0}`} color={color} />
      <Metric label="Events This Week" value={`${data.eventCount || 0}`} color={color} />
      <Metric label="Tasks" value={`${data.taskCount || 0}`} sub="Pending" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Weekly Activity</p>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={[{ d: "Mon", v: 5 }, { d: "Tue", v: 8 }, { d: "Wed", v: 12 }, { d: "Thu", v: 6 }, { d: "Fri", v: 9 }]}>
          <Bar dataKey="v" fill={color} radius={[4, 4, 0, 0]} /><XAxis dataKey="d" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} /><Tooltip {...TIP_STYLE} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const AuraDash = ({ color, data }: { color: string; data: any }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Bookings" value={`${data.bookingCount || 0}`} sub="This month" color={color} />
      <Metric label="Occupancy" value="78%" sub="↑ 5% vs last month" color={color} />
      <Metric label="RevPAR" value="$245" sub="Target: $260" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Occupancy Trend</p>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={[{ m: "Oct", v: 65 }, { m: "Nov", v: 72 }, { m: "Dec", v: 89 }, { m: "Jan", v: 92 }, { m: "Feb", v: 78 }, { m: "Mar", v: 78 }]}>
          <Area type="monotone" dataKey="v" stroke={color} fill={`${color}20`} strokeWidth={2} /><XAxis dataKey="m" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} /><Tooltip {...TIP_STYLE} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ForgeDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Vehicles Listed" value="34" sub="8 new this week" color={color} />
      <Metric label="Test Drives" value="12" sub="This week" color={color} />
      <Metric label="Conversion" value="28%" sub="↑ 3% vs avg" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Sales Pipeline</p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={[{ s: "Enquiry", v: 24 }, { s: "Test Drive", v: 12 }, { s: "F&I", v: 8 }, { s: "Sold", v: 5 }]}>
          <Bar dataKey="v" fill={color} radius={[4, 4, 0, 0]} /><XAxis dataKey="s" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} /><Tooltip {...TIP_STYLE} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ApexDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Active Projects" value="6" sub="$2.4M total" color={color} />
      <Metric label="Tenders Open" value="3" sub="2 due this week" color={color} />
      <Metric label="H&S Score" value="96%" sub="Zero incidents" color={color} />
    </div>
    <MiniTable headers={["Project", "Value", "Status"]} rows={[["Viaduct Harbour", "$1.2M", "In Progress"], ["Ponsonby Reno", "$380K", "Tendering"], ["Newmarket Office", "$820K", "Planning"]]} color={color} />
  </div>
);

const AnchorDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Contracts Drafted" value="23" sub="This month" color={color} />
      <Metric label="Risk Flags" value="4" sub="Needs review" color={color} />
      <Metric label="Compliance" value="100%" sub="All current" color={color} />
    </div>
    <MiniTable headers={["Document", "Type", "Status"]} rows={[["Service Agreement", "Commercial", "Signed"], ["Employment Contract", "Employment", "Draft"], ["NDA — Hudson Ltd", "Confidentiality", "Pending"]]} color={color} />
  </div>
);

const VaultDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Mortgage Rate" value="6.29%" sub="ANZ 1yr fixed" color={color} />
      <Metric label="KiwiSaver" value="$48,200" sub="Growth fund" color={color} />
      <Metric label="Net Worth" value="$342K" sub="↑ $18K this quarter" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Bank Rate Comparison (1yr Fixed)</p>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={[{ b: "ANZ", v: 6.29 }, { b: "ASB", v: 6.35 }, { b: "BNZ", v: 6.19 }, { b: "Kiwibank", v: 6.15 }, { b: "Westpac", v: 6.39 }]} layout="vertical">
          <Bar dataKey="v" fill={color} radius={[0, 4, 4, 0]} /><YAxis dataKey="b" type="category" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} width={55} /><Tooltip {...TIP_STYLE} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ShieldDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Policies Active" value="4" sub="Home, contents, car, life" color={color} />
      <Metric label="Sum Insured" value="$780K" sub="Rebuild estimate" color={color} />
      <Metric label="Claims" value="1" sub="In progress" color={color} />
    </div>
    <MiniTable headers={["Policy", "Provider", "Renewal"]} rows={[["Home", "IAG", "14 Apr"], ["Contents", "Tower", "14 Apr"], ["Vehicle", "AA Insurance", "22 Jun"], ["Life", "Partners Life", "1 Sep"]]} color={color} />
  </div>
);

// ─── Generic agent dashboard for agents without specialised data ───
const GenericDash = ({ color, agentName, expertise }: { color: string; agentName: string; expertise: string[] }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Conversations" value="—" sub="Sign in to track" color={color} />
      <Metric label="Outputs Created" value="—" sub="Start chatting" color={color} />
      <Metric label="Context Items" value="—" sub="Shared brain" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>{agentName} Capabilities</p>
      <div className="space-y-1.5">
        {expertise.slice(0, 5).map((e, i) => (
          <div key={e} className="flex items-center gap-2">
            <Progress value={(5 - i) * 20} color={color} />
            <span className="text-[9px] whitespace-nowrap" style={{ color: "#A1A1AA" }}>{e}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Spark dashboard ───
const SparkDash = ({ color, data }: { color: string; data: any }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Apps Built" value={`${data.appCount || 0}`} color={color} />
      <Metric label="Total Views" value={`${data.totalViews || 0}`} color={color} />
      <Metric label="Live Apps" value={`${data.liveCount || 0}`} sub="Deployed" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>App Performance</p>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={[{ d: "Week 1", v: 45 }, { d: "Week 2", v: 78 }, { d: "Week 3", v: 120 }, { d: "Week 4", v: 95 }]}>
          <Bar dataKey="v" fill={color} radius={[4, 4, 0, 0]} /><XAxis dataKey="d" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={false} /><Tooltip {...TIP_STYLE} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const MintDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Payment Gateways" value="3" sub="Active" color={color} />
      <Metric label="FX Saved" value="$1,240" sub="This quarter" color={color} />
      <Metric label="AML Status" value="Current" sub="Last audit: Feb" color={color} />
    </div>
    <MiniTable headers={["Gateway", "Fee", "Volume"]} rows={[["Stripe", "2.9% + 30c", "$48K/mo"], ["Windcave", "1.5%", "$22K/mo"], ["POLi", "Flat $1", "$8K/mo"]]} color={color} />
  </div>
);

const NexusDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Entries Processed" value="142" sub="This month" color={color} />
      <Metric label="Avg Processing" value="4.2min" sub="↓ 68% vs manual" color={color} />
      <Metric label="Accuracy" value="99.7%" sub="Auto-classified" color={color} />
    </div>
    <MiniTable headers={["Entry", "Tariff", "Duty"]} rows={[["Electronics — SH", "8471.30", "$1,240"], ["Textiles — CN", "6204.42", "$890"], ["Machinery — DE", "8428.90", "$2,100"]]} color={color} />
  </div>
);

const AxisDash = ({ color }: { color: string }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Metric label="Active Projects" value="8" color={color} />
      <Metric label="On Track" value="6/8" sub="75%" color={color} />
      <Metric label="Overdue Tasks" value="3" sub="Needs attention" color={color} />
    </div>
    <div className="rounded-lg p-3" style={GLASS}>
      <p className="text-[10px] mb-2" style={{ color: "#71717A" }}>Project Health</p>
      <ResponsiveContainer width="100%" height={100}>
        <PieChart><Pie data={[{ n: "On Track", v: 6 }, { n: "At Risk", v: 1 }, { n: "Behind", v: 1 }]} cx="50%" cy="50%" outerRadius={40} dataKey="v" label={({ n }) => n}>
          {["#10B981", "#3A6A9C", "#3A6A9C"].map((c, i) => <Cell key={i} fill={c} />)}
        </Pie><Tooltip {...TIP_STYLE} /></PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
  expertise: string[];
}

export default function AgentDashboard({ agentId, agentName, agentColor, expertise }: Props) {
  const [liveData, setLiveData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      try {
        const fetchers: Record<string, () => Promise<any>> = {
          sales: async () => {
            const { data: leads } = await supabase.from("leads").select("stage, value").eq("user_id", user.id);
            const stages: Record<string, number> = {};
            let pv = 0;
            (leads || []).forEach(l => { stages[l.stage] = (stages[l.stage] || 0) + 1; pv += Number(l.value || 0); });
            return { leadCount: leads?.length || 0, pipelineValue: pv > 1000 ? `${Math.round(pv / 1000)}K` : String(pv), stages };
          },
          property: async () => {
            const [{ count: pc }, { data: jobs }, { data: ci }] = await Promise.all([
              supabase.from("properties").select("*", { count: "exact", head: true }).eq("user_id", user.id),
              supabase.from("maintenance_jobs").select("urgency, status").eq("user_id", user.id),
              supabase.from("compliance_items").select("status").eq("user_id", user.id),
            ]);
            const urgency: Record<string, number> = {};
            (jobs || []).forEach(j => { urgency[j.urgency || "low"] = (urgency[j.urgency || "low"] || 0) + 1; });
            const total = ci?.length || 1;
            const passing = ci?.filter(c => c.status === "compliant").length || 0;
            return { propertyCount: pc || 0, jobCount: jobs?.filter(j => j.status !== "completed").length || 0, urgency, complianceScore: Math.round((passing / total) * 100) };
          },
          marketing: async () => {
            const [{ count: pc }, { count: cc }] = await Promise.all([
              supabase.from("social_posts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
              supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("user_id", user.id),
            ]);
            return { postCount: pc || 0, campaignCount: cc || 0 };
          },
          operations: async () => {
            // TŌROA family data
            const { data: fm } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1);
            if (!fm?.length) return { childCount: 0, eventCount: 0, taskCount: 0 };
            const fid = fm[0].family_id;
            const [{ count: cc }, { count: ec }, { count: tc }] = await Promise.all([
              supabase.from("children").select("*", { count: "exact", head: true }).eq("family_id", fid),
              supabase.from("events").select("*", { count: "exact", head: true }).eq("family_id", fid),
              supabase.from("tasks").select("*", { count: "exact", head: true }).eq("family_id", fid).eq("completed", false),
            ]);
            return { childCount: cc || 0, eventCount: ec || 0, taskCount: tc || 0 };
          },
          hospitality: async () => {
            const { count } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("user_id", user.id);
            return { bookingCount: count || 0 };
          },
          spark: async () => {
            const { data: apps } = await supabase.from("spark_apps").select("status, view_count").eq("user_id", user.id);
            return {
              appCount: apps?.length || 0,
              totalViews: apps?.reduce((s, a) => s + (a.view_count || 0), 0) || 0,
              liveCount: apps?.filter(a => a.status === "live").length || 0,
            };
          },
        };

        if (fetchers[agentId]) {
          const result = await fetchers[agentId]();
          setLiveData(result);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
      setLoading(false);
    };

    fetchData();
  }, [agentId]);

  if (loading) {
    return (
      <div className="rounded-xl p-6 animate-pulse" style={GLASS}>
        <div className="h-4 w-32 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }} />)}
        </div>
        <div className="h-32 rounded-lg mt-3" style={{ background: "rgba(255,255,255,0.03)" }} />
      </div>
    );
  }

  const dashMap: Record<string, JSX.Element> = {
    echo: <EchoDash color={agentColor} />,
    sales: <FluxDash color={agentColor} data={liveData} />,
    property: <HavenDash color={agentColor} data={liveData} />,
    accounting: <LedgerDash color={agentColor} />,
    marketing: <PrismDash color={agentColor} data={liveData} />,
    hr: <ArohaDash color={agentColor} />,
    operations: <HelmDash color={agentColor} data={liveData} />,
    hospitality: <AuraDash color={agentColor} data={liveData} />,
    automotive: <ForgeDash color={agentColor} />,
    construction: <ApexDash color={agentColor} />,
    legal: <AnchorDash color={agentColor} />,
    finance: <VaultDash color={agentColor} />,
    insurance: <ShieldDash color={agentColor} />,
    spark: <SparkDash color={agentColor} data={liveData} />,
    banking: <MintDash color={agentColor} />,
    customs: <NexusDash color={agentColor} />,
    pm: <AxisDash color={agentColor} />,
  };

  const dashboard = dashMap[agentId] || <GenericDash color={agentColor} agentName={agentName} expertise={expertise} />;

  return (
    <div className="rounded-xl overflow-hidden" style={GLASS}>
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${agentColor}, ${agentColor}40)` }} />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            {agentName} Dashboard
          </h3>
          <Badge label="Live" color="#10B981" />
        </div>
        {dashboard}
      </div>
    </div>
  );
}
