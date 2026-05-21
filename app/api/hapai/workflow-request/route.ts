import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

type WorkflowRequestPayload = {
  name?: unknown;
  email?: unknown;
  organisation?: unknown;
  workflow?: unknown;
  context?: unknown;
  sourcePath?: unknown;
};

const clean = (value: unknown, limit: number) =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

export async function POST(req: Request) {
  let payload: WorkflowRequestPayload;
  try {
    payload = (await req.json()) as WorkflowRequestPayload;
  } catch {
    return NextResponse.json({ error: "Please send a valid workflow request." }, { status: 400 });
  }

  const workflow = clean(payload.workflow, 1400);
  if (workflow.length < 12) {
    return NextResponse.json(
      { error: "Tell us the task or workflow you want fixed." },
      { status: 400 },
    );
  }

  const email = clean(payload.email, 180);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please use a valid email address." }, { status: 400 });
  }

  try {
    const sb = getServiceClient();
    const { error } = await sb.from("hapai_workflow_requests").insert({
      name: clean(payload.name, 120) || null,
      email: email || null,
      organisation: clean(payload.organisation, 160) || null,
      workflow,
      context: clean(payload.context, 1800) || null,
      source_path: clean(payload.sourcePath, 260) || null,
      metadata: {
        userAgent: req.headers.get("user-agent"),
        referrer: req.headers.get("referer"),
      },
    });

    if (error) throw error;
  } catch (err) {
    console.error("[hapai-workflow-request] insert failed", err);
    return NextResponse.json(
      { error: "We could not save that yet. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
