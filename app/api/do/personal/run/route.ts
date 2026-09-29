import { z } from "zod";
import {
  doOwner,
  privateDoHeaders,
  sameDoOrigin,
} from "@/apps/do/services/owner";
import { readDoJson } from "@/apps/do/shared/http";
import { runPersonal } from "@/apps/do/personal/service";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: privateDoHeaders });
export async function POST(request: Request) {
  if (!sameDoOrigin(request))
    return json({ error: "Open Personal DO on Assembl." }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: "Sign in to prepare your work." }, 401);
  let raw: unknown;
  try {
    raw = await readDoJson(request);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const parsed = z.object({ id: z.string().uuid() }).strict().safeParse(raw);
  if (!parsed.success) return json({ error: "Choose a responsibility." }, 400);
  try {
    const result = await runPersonal(owner.id, parsed.data.id);
    return json(
      result.claimed
        ? result
        : {
            error:
              "No run started. Check permission or pause status. Limits: one check per responsibility per hour, five checks per account in 24 hours.",
          },
      result.claimed ? 200 : 409,
    );
  } catch {
    return json(
      { error: "Preparation is unavailable. Your notes are still saved." },
      503,
    );
  }
}
