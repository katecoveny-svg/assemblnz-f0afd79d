import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parseSchoolNewsletter, type SchoolSurvivalResult } from "@/lib/toro/newsletter-parser";

const RESULT_COOKIE_PREFIX = "assembl_toro_school_survival_";

export async function POST(req: Request) {
  const form = await req.formData();
  const newsletterText = String(form.get("newsletterText") ?? "");
  const schoolName = String(form.get("schoolName") ?? "").trim() || undefined;
  const fileValue = form.get("newsletterFile");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  const parsed = await parseSchoolNewsletter({ newsletterText, file });
  const id = crypto.randomUUID();
  const snapshot: SchoolSurvivalResult = {
    id,
    schoolName,
    sourceType: parsed.sourceType,
    items: parsed.items,
    createdAt: new Date().toISOString(),
  };

  function redirectWithSnapshot(result: SchoolSurvivalResult) {
    const response = NextResponse.redirect(new URL(`/toro/school-survival/results/${result.id}`, req.url), {
      status: 303,
    });
    response.cookies.set(`${RESULT_COOKIE_PREFIX}${result.id}`, encodeURIComponent(JSON.stringify(result)), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return redirectWithSnapshot(snapshot);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } },
  );

  const { data, error } = await supabase
    .from("toro_school_survival_results")
    .insert({
      id,
      school_name: schoolName,
      source_type: parsed.sourceType,
      item_count: parsed.items.length,
      parsed_items: parsed.items,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("toro school survival insert failed", error);
    return redirectWithSnapshot(snapshot);
  }

  return redirectWithSnapshot({ ...snapshot, id: data.id });
}
