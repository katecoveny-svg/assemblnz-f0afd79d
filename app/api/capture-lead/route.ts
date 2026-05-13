/**
 * POST /api/capture-lead — attach an email to a saved electrify_leads row
 *
 * Triggered from the "Send PDF" form on the results page. Updates the lead
 * row with the email + sets pdf_downloaded=true. PDF generation is v1.1
 * (placeholder JSON response for now — wire to @react-pdf/renderer when ready).
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const leadId = String(form.get("lead_id") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();

  if (!leadId || !email) {
    return NextResponse.json({ error: "lead_id and email required" }, { status: 400 });
  }

  // Naive email shape check
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "valid email required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { error } = await supabase
    .from("electrify_leads")
    .update({
      email,
      pdf_downloaded: true,
      pdf_downloaded_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) {
    console.error("electrify capture-lead update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO v1.1: generate PDF via @react-pdf/renderer, store in Supabase storage,
  //   email signed URL via Brevo. For now: redirect back to results with a
  //   query string the page can read for a confirmation toast.
  return NextResponse.redirect(
    new URL(`/electrify/results/${leadId}?pdf=sent`, req.url),
    { status: 303 }
  );
}
