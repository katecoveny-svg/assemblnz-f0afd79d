// Generates a WAIHANGA construction evidence pack PDF using pdf-lib (Deno).
// Receives { projectId } and returns a PDF blob.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PALETTE = {
  taupeDeep: rgb(0.435, 0.380, 0.345), // #6F6158
  taupe: rgb(0.616, 0.549, 0.490), // #9D8C7D
  sand: rgb(0.847, 0.784, 0.706), // #D8C8B4
  gold: rgb(0.851, 0.737, 0.478), // #D9BC7A
  sage: rgb(0.788, 0.847, 0.816), // #C9D8D0
  mist: rgb(0.969, 0.953, 0.933), // #F7F3EE
};

interface Project {
  id: string;
  name: string | null;
  address: string | null;
  status: string | null;
  client_name: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json().catch(() => ({}));

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Fetch project (optional — if no projectId, generate a demo pack)
    let project: Project | null = null;
    if (projectId) {
      const { data } = await supabase
        .from("hanga_projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      project = data as Project | null;
    }

    // Fetch supporting data (best-effort; missing tables are tolerated)
    const [{ data: compliance }, { data: audits }, { data: photos }] =
      await Promise.all([
        supabase.from("compliance_items").select("*").limit(50),
        supabase
          .from("safety_audits")
          .select("*")
          .order("audit_date", { ascending: false })
          .limit(20),
        supabase.from("photo_docs").select("*").limit(10),
      ]);

    const pdf = await PDFDocument.create();
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const drawHeader = (page: any, title: string, subtitle?: string) => {
      const { width } = page.getSize();
      // Top accent band
      page.drawRectangle({
        x: 0,
        y: page.getHeight() - 24,
        width,
        height: 24,
        color: PALETTE.gold,
      });
      page.drawText("ASSEMBL · WAIHANGA EVIDENCE PACK", {
        x: 40,
        y: page.getHeight() - 16,
        size: 9,
        font: fontBold,
        color: PALETTE.taupeDeep,
      });
      page.drawText(title, {
        x: 40,
        y: page.getHeight() - 60,
        size: 22,
        font: fontBold,
        color: PALETTE.taupeDeep,
      });
      if (subtitle) {
        page.drawText(subtitle, {
          x: 40,
          y: page.getHeight() - 80,
          size: 11,
          font: fontRegular,
          color: PALETTE.taupe,
        });
      }
    };

    const drawFooter = (page: any, pageNum: number, total: number) => {
      page.drawText(
        `Generated ${new Date().toLocaleDateString("en-NZ")} · Page ${pageNum} of ${total}`,
        {
          x: 40,
          y: 24,
          size: 8,
          font: fontRegular,
          color: PALETTE.taupe,
        },
      );
    };

    // -------- PAGE 1: Project Summary --------
    const page1 = pdf.addPage([595, 842]); // A4
    drawHeader(page1, project?.name ?? "Project Evidence Pack", "Project summary");
    let y = 720;
    const summaryRows: [string, string][] = [
      ["Project", project?.name ?? "—"],
      ["Address", project?.address ?? "—"],
      ["Client", project?.client_name ?? "—"],
      ["Status", project?.status ?? "—"],
      ["Start date", project?.start_date ?? "—"],
      ["End date", project?.end_date ?? "—"],
      [
        "Budget (NZD)",
        project?.budget
          ? `$${Number(project.budget).toLocaleString("en-NZ")}`
          : "—",
      ],
    ];
    for (const [label, value] of summaryRows) {
      page1.drawText(label, {
        x: 40,
        y,
        size: 10,
        font: fontBold,
        color: PALETTE.taupe,
      });
      page1.drawText(String(value), {
        x: 180,
        y,
        size: 10,
        font: fontRegular,
        color: PALETTE.taupeDeep,
      });
      y -= 22;
    }

    // -------- PAGE 2: Compliance --------
    const page2 = pdf.addPage([595, 842]);
    drawHeader(page2, "Compliance checklist", "Building Code & CCA 2002");
    y = 720;
    const items = (compliance ?? []).slice(0, 24);
    if (items.length === 0) {
      page2.drawText("No compliance items recorded.", {
        x: 40,
        y,
        size: 10,
        font: fontRegular,
        color: PALETTE.taupe,
      });
    }
    for (const item of items) {
      const status = String(item.status ?? "pending");
      const colour =
        status === "compliant" || status === "complete"
          ? PALETTE.sage
          : status === "overdue"
            ? rgb(0.85, 0.4, 0.4)
            : PALETTE.gold;
      page2.drawCircle({ x: 50, y: y + 4, size: 4, color: colour });
      page2.drawText(String(item.title ?? "Untitled").slice(0, 70), {
        x: 64,
        y,
        size: 10,
        font: fontRegular,
        color: PALETTE.taupeDeep,
      });
      page2.drawText(status.toUpperCase(), {
        x: 460,
        y,
        size: 8,
        font: fontBold,
        color: PALETTE.taupe,
      });
      y -= 20;
      if (y < 80) break;
    }

    // -------- PAGE 3: Safety audits --------
    const page3 = pdf.addPage([595, 842]);
    drawHeader(page3, "H&S audit trail", "WorkSafe NZ — HSWA 2015");
    y = 720;
    const auditList = (audits ?? []).slice(0, 18);
    if (auditList.length === 0) {
      page3.drawText("No safety audits recorded.", {
        x: 40,
        y,
        size: 10,
        font: fontRegular,
        color: PALETTE.taupe,
      });
    }
    for (const a of auditList) {
      page3.drawText(String(a.audit_date ?? ""), {
        x: 40,
        y,
        size: 9,
        font: fontBold,
        color: PALETTE.taupeDeep,
      });
      page3.drawText(String(a.inspector ?? "—"), {
        x: 130,
        y,
        size: 9,
        font: fontRegular,
        color: PALETTE.taupeDeep,
      });
      page3.drawText(
        String(a.findings ?? "No findings").slice(0, 60),
        {
          x: 260,
          y,
          size: 9,
          font: fontRegular,
          color: PALETTE.taupe,
        },
      );
      page3.drawText(a.pass ? "PASS" : "FAIL", {
        x: 510,
        y,
        size: 9,
        font: fontBold,
        color: a.pass ? PALETTE.sage : rgb(0.85, 0.4, 0.4),
      });
      y -= 20;
      if (y < 80) break;
    }

    // -------- PAGE 4: Sign-off --------
    const page4 = pdf.addPage([595, 842]);
    drawHeader(page4, "Sign-off", "Authorised signatures");
    y = 680;
    const signers = ["Project Manager", "Site Foreman", "Client"];
    for (const role of signers) {
      page4.drawText(role, {
        x: 40,
        y,
        size: 11,
        font: fontBold,
        color: PALETTE.taupeDeep,
      });
      page4.drawLine({
        start: { x: 40, y: y - 30 },
        end: { x: 280, y: y - 30 },
        thickness: 0.5,
        color: PALETTE.sand,
      });
      page4.drawText("Signature", {
        x: 40,
        y: y - 44,
        size: 8,
        font: fontRegular,
        color: PALETTE.taupe,
      });
      page4.drawLine({
        start: { x: 320, y: y - 30 },
        end: { x: 540, y: y - 30 },
        thickness: 0.5,
        color: PALETTE.sand,
      });
      page4.drawText("Date", {
        x: 320,
        y: y - 44,
        size: 8,
        font: fontRegular,
        color: PALETTE.taupe,
      });
      y -= 110;
    }

    // Footer on every page
    const pages = pdf.getPages();
    pages.forEach((p, i) => drawFooter(p, i + 1, pages.length));

    const bytes = await pdf.save();
    const projName = (project?.name ?? "project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    const filename = `evidence-pack-${projName}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    return new Response(bytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      status: 200,
    });
  } catch (err) {
    console.error("generate-evidence-pack error", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
