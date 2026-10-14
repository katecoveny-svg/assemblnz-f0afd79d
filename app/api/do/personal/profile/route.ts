import { doOwner, privateDoHeaders, sameDoOrigin } from "@/apps/do/services/owner";
import { readDoJson } from "@/apps/do/shared/http";
import { personalDoProfileSaveSchema } from "@/apps/do/personal/profile";
import { deletePersonalDoProfile, getPersonalDoProfile, savePersonalDoProfile } from "@/apps/do/personal/profile-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });

export async function GET() {
  const owner = await doOwner();
  if (!owner) return json({ error: "Sign in to open your Personal DO preferences." }, 401);
  try {
    return json(await getPersonalDoProfile(owner.id));
  } catch {
    return json({ error: "Personal DO preferences could not load. Your saved preferences have not been changed." }, 503);
  }
}

export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: "Open Personal DO on Assembl." }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: "Sign in to save your Personal DO preferences." }, 401);
  let raw: unknown;
  try {
    raw = await readDoJson(request, 16_000);
  } catch {
    return json({ error: "Use a shorter, valid preferences request." }, 400);
  }
  const parsed = personalDoProfileSaveSchema.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Check your preferences." }, 400);
  try {
    return json({ profile: await savePersonalDoProfile(owner.id, parsed.data), saved: true });
  } catch {
    return json({ error: "We could not confirm your preferences were saved. Reload and check before trying again." }, 503);
  }
}

export async function DELETE(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: "Open Personal DO on Assembl." }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: "Sign in to forget your Personal DO preferences." }, 401);
  try {
    return json(await deletePersonalDoProfile(owner.id));
  } catch {
    return json({ error: "We could not confirm your preferences were removed. Reload and check before trying again." }, 503);
  }
}
