import type { Metadata } from "next";
import { AUAHA_AGENTS } from "@/lib/creative/agents";
import { CreativeWorkspace, type SlimAgent } from "@/components/creative/CreativeWorkspace";

export const metadata: Metadata = {
  title: "AUAHA · the creative kete",
  description: "A creative studio in a chat — real imagery, copy, video and voice, on-brand.",
};

// Slim, client-safe agent list — system prompts stay server-side (used by the API routes).
const slim: SlimAgent[] = AUAHA_AGENTS.map((a) => ({
  slug: a.slug,
  name: a.name,
  role: a.role,
  kind: a.kind,
  blurb: a.blurb,
  accent: a.accent,
  interactive: a.interactive,
}));

export default function CreativeAgencyOpsPage() {
  return <CreativeWorkspace agents={slim} />;
}
