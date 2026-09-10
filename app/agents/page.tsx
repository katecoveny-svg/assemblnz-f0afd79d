import type { Metadata } from "next";
import { CinematicAgents } from "@/components/site/cinematic/CinematicAgents";
import { HOME_AGENTS, HOME_AGENT_CATEGORIES } from "@/lib/home/agent-roster";
export const metadata: Metadata = {
  title: "assembl · agents",
  description:
    "Explore specialist agents by task. Find the help you need and understand the review boundary.",
  alternates: { canonical: "/agents" },
};
export default function AgentsPage() {
  return (
    <CinematicAgents agents={HOME_AGENTS} categories={HOME_AGENT_CATEGORIES} />
  );
}
