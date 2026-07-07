import { NextResponse } from "next/server";
import { persistLead } from "@/lib/lead-capture/persist";

export const runtime = "nodejs";

// "Book a pilot" — writes a durable lead the operator sees in the admin leads queue.
// ACTION_DISPATCH is off across the demo, so nothing is emailed automatically.
export async function POST(req: Request) {
  const { name, email, company, note } = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    company?: string;
    note?: string;
  };
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ok = await persistLead({
    formName: "creative-agency-pilot",
    email,
    name: name ?? undefined,
    sourceUrl: "/customers/creative-agency",
    ip: ip ?? undefined,
    fields: {
      company: company ?? "",
      note: note ?? "",
      product: "AUAHA creative kete",
    },
  });

  return NextResponse.json({
    ok: true,
    persisted: ok,
    message: "Kia ora — your pilot request is in. Kate will be in touch.",
  });
}
