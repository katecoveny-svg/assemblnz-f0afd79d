import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Filter, BarChart3, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import jsPDF from "jspdf";
import AdminShell from "@/components/admin/AdminShell";
import AdminGlassCard from "@/components/admin/AdminGlassCard";

interface TestResult {
  id: string;
  kete: string;
  agent_slug: string;
  prompt: string;
  response: string | null;
  overall_verdict: string | null;
  verdict_kahu: string | null;
  verdict_iho: string | null;
  verdict_ta: string | null;
  verdict_mahara: string | null;
  verdict_mana: string | null;
  audit_entry: any;
  created_at: string;
  run_by: string | null;
}

interface ScanLog {
  id: string;
  scan_date: string;
  sources_checked: number | null;
  changes_detected: number | null;
  high_impact_count: number | null;
  scan_duration_seconds: number | null;
  errors: string[] | null;
  created_at: string;
}

const verdictBadge = (v: string | null) => {
  if (!v) return <Badge variant="outline">—</Badge>;
  if (v === "pass") return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">Pass</Badge>;
  if (v === "warn") return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">Warn</Badge>;
  return <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Fail</Badge>;
};

export default function AdminTestReports() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [keteFilter, setKeteFilter] = useState<string>("all");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [testsRes, scansRes] = await Promise.all([
      supabase.from("agent_test_results").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("compliance_scan_log").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (testsRes.data) setTestResults(testsRes.data);
    if (scansRes.data) setScanLogs(scansRes.data);
    setLoading(false);
  };

  const filtered = testResults.filter((r) => {
    if (keteFilter !== "all" && r.kete !== keteFilter) return false;
    if (verdictFilter !== "all" && r.overall_verdict !== verdictFilter) return false;
    return true;
  });

  const stats = {
    total: testResults.length,
    pass: testResults.filter((r) => r.overall_verdict === "pass").length,
    warn: testResults.filter((r) => r.overall_verdict === "warn").length,
    fail: testResults.filter((r) => r.overall_verdict === "fail").length,
    ketes: [...new Set(testResults.map((r) => r.kete))],
    agents: [...new Set(testResults.map((r) => r.agent_slug))],
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date().toISOString().split("T")[0];

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Assembl — Agent Test & Compliance Report", 14, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString("en-NZ")}`, 14, 30);
    doc.text(`Report Period: All recorded tests`, 14, 36);
    doc.text(`R&D Tax Incentive — Supporting Evidence`, 14, 42);

    // Summary
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("1. Test Summary", 14, 54);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total tests run: ${stats.total}`, 20, 62);
    doc.text(`Pass: ${stats.pass}  |  Warn: ${stats.warn}  |  Fail: ${stats.fail}`, 20, 68);
    doc.text(`Pass rate: ${stats.total ? ((stats.pass / stats.total) * 100).toFixed(1) : 0}%`, 20, 74);
    doc.text(`Unique kete tested: ${stats.ketes.join(", ")}`, 20, 80);
    doc.text(`Unique agents tested: ${stats.agents.length}`, 20, 86);

    // Pipeline description
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("2. 5-Stage Compliance Pipeline", 14, 98);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const pipeline = [
      "Kahu (Guardian): PII detection, data classification, cultural safety",
      "Iho (Route): Intent classification, industry routing",
      "Ta (Apply): NZ English, te reo Maori macrons, brand voice",
      "Mahara (Verify): Legislative citations, rate verification, staleness check",
      "Mana (Approve): Professional disclaimers, Maori data sovereignty",
    ];
    pipeline.forEach((line, i) => doc.text(`  ${i + 1}. ${line}`, 20, 106 + i * 6));

    // Compliance scanner summary
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("3. Compliance Scanner Activity", 14, 142);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total scans recorded: ${scanLogs.length}`, 20, 150);
    const totalChanges = scanLogs.reduce((s, l) => s + (l.changes_detected || 0), 0);
    const totalHigh = scanLogs.reduce((s, l) => s + (l.high_impact_count || 0), 0);
    doc.text(`Total changes detected: ${totalChanges}  |  High impact: ${totalHigh}`, 20, 156);
    if (scanLogs[0]) {
      doc.text(`Last scan: ${scanLogs[0].scan_date}  |  Sources: ${scanLogs[0].sources_checked}  |  Duration: ${scanLogs[0].scan_duration_seconds}s`, 20, 162);
    }

    // Individual test results
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("4. Individual Test Results", 14, 176);

    let y = 184;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    for (const r of filtered.slice(0, 40)) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const date = new Date(r.created_at).toLocaleDateString("en-NZ");
      const verdict = (r.overall_verdict || "—").toUpperCase();
      doc.text(`[${date}] ${r.kete}/${r.agent_slug} — ${verdict}`, 20, y);
      y += 5;
      const promptShort = (r.prompt || "").substring(0, 100);
      doc.text(`  Prompt: "${promptShort}${r.prompt?.length > 100 ? "..." : ""}"`, 22, y);
      y += 5;
      doc.text(`  Stages: Kahu=${r.verdict_kahu || "—"} Iho=${r.verdict_iho || "—"} Ta=${r.verdict_ta || "—"} Mahara=${r.verdict_mahara || "—"} Mana=${r.verdict_mana || "—"}`, 22, y);
      y += 7;
    }

    // Footer
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("5. R&D Tax Incentive Statement", 14, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const rdText = [
      "This report documents systematic experimental development activities",
      "conducted as part of the Assembl AI agent platform. The testing",
      "infrastructure validates novel AI compliance pipelines specific to",
      "New Zealand legislation, Maori data sovereignty, and multi-agent",
      "orchestration — areas where no established solutions exist.",
      "",
      "Key R&D activities evidenced:",
      "  - Development of 5-stage compliance pipeline (Kahu-Iho-Ta-Mahara-Mana)",
      "  - NZ-specific legislative knowledge base with automated staleness detection",
      "  - Automated compliance scanning of 20+ NZ government sources",
      "  - Multi-agent context sharing and memory compression",
      "  - Maori data sovereignty enforcement via policy-as-code gates",
      "",
      "These activities meet the criteria for the NZ R&D Tax Incentive under",
      "the Income Tax Act 2007, subpart MX, as they involve systematic,",
      "investigative, and experimental activities that seek to resolve",
      "scientific or technological uncertainty.",
    ];
    rdText.forEach((line, i) => doc.text(line, 20, 30 + i * 6));

    doc.text("— Assembl NZ Ltd", 20, 30 + rdText.length * 6 + 10);
    doc.text(`Report ID: RPT-${now}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, 20, 30 + rdText.length * 6 + 18);

    doc.save(`assembl-rd-test-report-${now}.pdf`);
  };

  return (
    <AdminShell
      title="Test Reports"
      subtitle="Agent test results & R&D evidence export"
      icon={<FileText className="w-5 h-5 text-primary" />}
      backTo="/admin/dashboard"
      actions={
        <Button onClick={generatePDF} className="bg-[hsl(var(--kowhai))] hover:bg-[hsl(var(--kowhai))]/80 text-black font-medium gap-2">
          <Download className="w-4 h-4" />
          Export R&D Report (PDF)
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-gray-200">
            <CardContent className="pt-4 text-center">
              <BarChart3 className="w-6 h-6 mx-auto mb-1 text-[#4AA5A8]" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500">Total Tests</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-gray-200">
            <CardContent className="pt-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
              <div className="text-2xl font-bold text-emerald-400">{stats.pass}</div>
              <div className="text-xs text-gray-500">Passed</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-gray-200">
            <CardContent className="pt-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-400" />
              <div className="text-2xl font-bold text-amber-400">{stats.warn}</div>
              <div className="text-xs text-gray-500">Warnings</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-gray-200">
            <CardContent className="pt-4 text-center">
              <XCircle className="w-6 h-6 mx-auto mb-1 text-red-400" />
              <div className="text-2xl font-bold text-red-400">{stats.fail}</div>
              <div className="text-xs text-gray-500">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={keteFilter} onValueChange={setKeteFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-gray-200">
              <SelectValue placeholder="All Kete" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kete</SelectItem>
              {stats.ketes.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={verdictFilter} onValueChange={setVerdictFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-gray-200">
              <SelectValue placeholder="All Verdicts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verdicts</SelectItem>
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="fail">Fail</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-white/40">{filtered.length} results</span>
        </div>

        {/* Results Table */}
        <Card className="bg-white/5 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white/40">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-white/40">No test results found. Run agent tests to generate data.</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <div key={r.id} className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[#4AA5A8] border-[#4AA5A8]/30">{r.kete}</Badge>
                        <span className="text-sm font-medium">{r.agent_slug}</span>
                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString("en-NZ")}</span>
                      </div>
                      {verdictBadge(r.overall_verdict)}
                    </div>
                    <div className="text-sm text-white/60 truncate">"{r.prompt}"</div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400">Kahu</span>{verdictBadge(r.verdict_kahu)}
                      <span className="text-gray-400">Iho</span>{verdictBadge(r.verdict_iho)}
                      <span className="text-gray-400">Tā</span>{verdictBadge(r.verdict_ta)}
                      <span className="text-gray-400">Mahara</span>{verdictBadge(r.verdict_mahara)}
                      <span className="text-gray-400">Mana</span>{verdictBadge(r.verdict_mana)}
                    </div>
                    {r.response && (
                      <details className="text-xs text-white/40">
                        <summary className="cursor-pointer hover:text-white/60">View response</summary>
                        <div className="mt-2 p-2 bg-black/30 rounded text-gray-500 whitespace-pre-wrap max-h-40 overflow-auto">
                          {r.response}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Scan Log */}
        <Card className="bg-white/5 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white/70">Compliance Scanner Log</CardTitle>
          </CardHeader>
          <CardContent>
            {scanLogs.length === 0 ? (
              <div className="text-center py-4 text-white/40">No scan logs yet.</div>
            ) : (
              <div className="space-y-2">
                {scanLogs.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded bg-white/[0.03] border border-white/[0.06] text-sm">
                    <span>{s.scan_date}</span>
                    <span className="text-gray-500">{s.sources_checked} sources</span>
                    <span>{s.changes_detected} changes</span>
                    <span className={s.high_impact_count ? "text-red-400" : "text-white/40"}>
                      {s.high_impact_count || 0} high
                    </span>
                    <span className="text-gray-400">{s.scan_duration_seconds}s</span>
                    {s.errors?.length ? (
                      <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-xs">
                        {s.errors.length} errors
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-xs">Clean</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
