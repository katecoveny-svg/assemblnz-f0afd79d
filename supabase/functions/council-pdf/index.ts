import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

/**
 * COUNCIL-PDF
 * ===========
 * Renders a Council session as a branded "Evidence Pack" PDF
 * matching the Maunga template (cover, advisors, synthesis).
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Brand palette (RGB 0-1)
const COL = {
  bg: rgb(0.039, 0.086, 0.157),       // #0A1628
  pounamu: rgb(0.227, 0.490, 0.431),  // #3A7D6E
  gold: rgb(0.831, 0.659, 0.325),     // #D4A853
  bone: rgb(0.961, 0.941, 0.910),     // #F5F0E8
  red: rgb(0.780, 0.314, 0.314),      // #C75050
  amber: rgb(0.910, 0.553, 0.404),    // #E88D67
  sky: rgb(0.357, 0.608, 0.835),      // #5B9BD5
  muted: rgb(0.55, 0.58, 0.63),
};

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      lines.push(cur.trim());
      cur = w;
    } else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id required");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: session, error } = await sb
      .from("council_sessions").select("*").eq("id", session_id).single();
    if (error || !session) throw new Error("session not found");

    const advisors = (session.advisors_json || []) as any[];
    const synth = (session.synthesis_json || {}) as any;

    const pdf = await PDFDocument.create();
    const helv = await pdf.embedFont(StandardFonts.Helvetica);
    const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // ── COVER PAGE ──
    const cover = pdf.addPage([595, 842]); // A4
    cover.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: COL.bg });
    // Gold accent bar
    cover.drawRectangle({ x: 0, y: 760, width: 595, height: 4, color: COL.gold });

    cover.drawText("ASSEMBL", { x: 50, y: 790, size: 11, font: helvBold, color: COL.gold });
    cover.drawText("Council Evidence Pack", { x: 50, y: 720, size: 28, font: helvBold, color: COL.bone });

    cover.drawText("QUESTION", { x: 50, y: 660, size: 9, font: helvBold, color: COL.muted });
    const qLines = wrap(session.question, 65);
    qLines.slice(0, 6).forEach((l, i) => {
      cover.drawText(l, { x: 50, y: 640 - i * 18, size: 13, font: helv, color: COL.bone });
    });

    const date = new Date(session.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
    cover.drawText(`Convened: ${date}`, { x: 50, y: 80, size: 10, font: helv, color: COL.muted });
    cover.drawText(`Mode: ${(session.mode || "full").toUpperCase()}  •  Advisors: ${advisors.length}`, { x: 50, y: 64, size: 10, font: helv, color: COL.muted });
    cover.drawText("assembl.co.nz", { x: 50, y: 40, size: 9, font: helv, color: COL.gold });

    // ── ADVISOR PAGES ──
    for (const a of advisors) {
      const p = pdf.addPage([595, 842]);
      p.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.98, 0.97, 0.95) });
      // Header strip
      p.drawRectangle({ x: 0, y: 790, width: 595, height: 52, color: COL.bg });
      p.drawText(a.agent_name || "ADVISOR", { x: 50, y: 815, size: 18, font: helvBold, color: COL.bone });
      p.drawText(a.role || "", { x: 50, y: 798, size: 10, font: helv, color: COL.gold });

      // Position badge
      const pos = a.position || "CONDITIONAL";
      const badgeCol = pos === "YES" ? COL.pounamu : pos === "NO" ? COL.red : COL.amber;
      p.drawRectangle({ x: 460, y: 800, width: 85, height: 28, color: badgeCol });
      p.drawText(pos, { x: 472, y: 810, size: 12, font: helvBold, color: COL.bone });

      // Body
      let y = 750;
      p.drawText("ANALYSIS", { x: 50, y, size: 9, font: helvBold, color: COL.muted });
      y -= 18;
      const analysisLines = wrap(a.analysis || "—", 80);
      for (const l of analysisLines.slice(0, 18)) {
        p.drawText(l, { x: 50, y, size: 10, font: helv, color: rgb(0.24, 0.26, 0.31) });
        y -= 14;
      }

      y -= 12;
      p.drawText("KEY NUMBERS", { x: 50, y, size: 9, font: helvBold, color: COL.muted });
      y -= 14;
      wrap(a.key_numbers || "—", 80).slice(0, 3).forEach(l => {
        p.drawText(l, { x: 50, y, size: 10, font: helv, color: rgb(0.24, 0.26, 0.31) });
        y -= 14;
      });

      y -= 12;
      p.drawText("BIGGEST RISK", { x: 50, y, size: 9, font: helvBold, color: COL.red });
      y -= 14;
      wrap(a.biggest_risk || "—", 80).slice(0, 3).forEach(l => {
        p.drawText(l, { x: 50, y, size: 10, font: helv, color: rgb(0.24, 0.26, 0.31) });
        y -= 14;
      });

      y -= 12;
      p.drawText("SHARPENING QUESTION", { x: 50, y, size: 9, font: helvBold, color: COL.pounamu });
      y -= 14;
      wrap(a.question || "—", 80).slice(0, 3).forEach(l => {
        p.drawText(l, { x: 50, y, size: 10, font: helv, color: rgb(0.24, 0.26, 0.31) });
        y -= 14;
      });

      // Footer
      p.drawText(`Confidence: ${a.confidence || "medium"}`, { x: 50, y: 30, size: 9, font: helv, color: COL.muted });
      p.drawText("Assembl Council Evidence Pack", { x: 380, y: 30, size: 9, font: helv, color: COL.muted });
    }

    // ── SYNTHESIS PAGE ──
    const sp = pdf.addPage([595, 842]);
    sp.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: COL.bg });
    sp.drawRectangle({ x: 0, y: 760, width: 595, height: 4, color: COL.gold });
    sp.drawText("SYNTHESIS — IHO", { x: 50, y: 790, size: 11, font: helvBold, color: COL.gold });
    sp.drawText("The Council's Verdict", { x: 50, y: 720, size: 24, font: helvBold, color: COL.bone });

    let sy = 670;
    const tally = synth.vote_tally || { yes: 0, no: 0, conditional: 0 };
    sp.drawText(`Vote: ${tally.yes} YES  ·  ${tally.no} NO  ·  ${tally.conditional} CONDITIONAL`, {
      x: 50, y: sy, size: 12, font: helv, color: COL.bone,
    });
    sy -= 30;

    sp.drawText("RECOMMENDATION", { x: 50, y: sy, size: 9, font: helvBold, color: COL.gold });
    sy -= 18;
    wrap(synth.recommendation || "—", 70).slice(0, 4).forEach(l => {
      sp.drawText(l, { x: 50, y: sy, size: 13, font: helvBold, color: COL.bone });
      sy -= 18;
    });

    sy -= 16;
    sp.drawText("AGREEMENT", { x: 50, y: sy, size: 9, font: helvBold, color: COL.pounamu });
    sy -= 14;
    (synth.agreement_points || []).slice(0, 3).forEach((pt: string) => {
      wrap(`• ${pt}`, 75).slice(0, 2).forEach(l => {
        sp.drawText(l, { x: 50, y: sy, size: 10, font: helv, color: COL.bone });
        sy -= 14;
      });
    });

    sy -= 12;
    sp.drawText("TENSION", { x: 50, y: sy, size: 9, font: helvBold, color: COL.amber });
    sy -= 14;
    (synth.tension_points || []).slice(0, 3).forEach((pt: string) => {
      wrap(`• ${pt}`, 75).slice(0, 2).forEach(l => {
        sp.drawText(l, { x: 50, y: sy, size: 10, font: helv, color: COL.bone });
        sy -= 14;
      });
    });

    sy -= 12;
    sp.drawText("NEXT STEPS", { x: 50, y: sy, size: 9, font: helvBold, color: COL.gold });
    sy -= 14;
    (synth.next_steps || []).slice(0, 5).forEach((step: string) => {
      wrap(step, 75).slice(0, 2).forEach(l => {
        sp.drawText(l, { x: 50, y: sy, size: 10, font: helv, color: COL.bone });
        sy -= 14;
      });
    });

    sp.drawText("assembl.co.nz", { x: 50, y: 40, size: 9, font: helv, color: COL.gold });

    const bytes = await pdf.save();

    return new Response(bytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="council-evidence-pack-${session_id.slice(0, 8)}.pdf"`,
      },
    });

  } catch (e) {
    console.error("council-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
