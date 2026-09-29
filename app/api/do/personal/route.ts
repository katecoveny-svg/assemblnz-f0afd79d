import {
  doOwner,
  privateDoHeaders,
  sameDoOrigin,
} from "@/apps/do/services/owner";
import { readDoJson } from "@/apps/do/shared/http";
import { personalMutationSchema } from "@/apps/do/personal/contract";
import {
  personalState,
  savePersonal,
  mutatePersonal,
} from "@/apps/do/personal/service";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: privateDoHeaders });
export async function GET() {
  const owner = await doOwner();
  if (!owner) return json({ error: "Sign in to open your Personal DO." }, 401);
  try {
    return json(await personalState(owner.id));
  } catch {
    return json(
      {
        error:
          "Personal DO could not load. Your saved work has not been changed.",
      },
      503,
    );
  }
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request))
    return json({ error: "Open Personal DO on Assembl." }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: "Sign in to save your Personal DO." }, 401);
  let raw: unknown;
  try {
    raw = await readDoJson(request);
  } catch {
    return json({ error: "Use a shorter, valid request." }, 400);
  }
  const parsed = personalMutationSchema.safeParse(raw);
  if (!parsed.success)
    return json(
      { error: parsed.error.issues[0]?.message ?? "Check the fields." },
      400,
    );
  try {
    const p = parsed.data;
    if (p.action === "save")
      return json({ id: await savePersonal(owner.id, p) });
    return (await mutatePersonal(owner.id, p.action, p.id))
      ? json({ ok: true })
      : json({ error: "That item is no longer available." }, 404);
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save your change.",
      },
      503,
    );
  }
}
