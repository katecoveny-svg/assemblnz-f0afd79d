import type { DoTask } from "@/apps/do/shared/preparation";
import type { DoLiveAgent } from "@/apps/do/shared/live-conversation";
export const DO_TEMPLATES: {
  id: string;
  title: string;
  description: string;
  hostedDescription?: string;
  hostedDirection?: string;
  task: DoTask | "image";
  agent?: DoLiveAgent;
  direction: string;
  search: boolean;
}[] = [
  {
    id: "writing",
    title: "Writing DO",
    description: "Replies and clear writing, ready to edit.",
    task: "reply",
    direction: "Prepare a clear reply. Preserve facts and commitments.",
    search: false,
  },
  {
    id: "meeting",
    title: "Meeting DO",
    description:
      "Actions and follow-ups from a pasted transcript. Recording not connected.",
    task: "brief",
    direction:
      "From the supplied meeting transcript, extract decisions, actions, owners, dates and open questions. Do not invent missing owners or dates.",
    search: false,
  },
  {
    id: "school",
    title: "School admin DO",
    description: "Dates and to-dos from a newsletter you provide.",
    task: "extract",
    direction:
      "Extract school dates, costs, items to bring and required actions. Flag missing details.",
    search: false,
  },
  {
    id: "study",
    title: "Study DO",
    description: "Hints, practice and explanations from your study notes.",
    task: "plan",
    agent: "study",
    direction:
      "Help me learn with hints and practice. Ask my learning level and subject; do not request identifying details.",
    search: true,
  },
  {
    id: "travel",
    title: "Travel DO",
    description: "Shape your travel notes into a plan. No bookings.",
    task: "plan",
    agent: "travel",
    direction:
      "Help prepare an editable trip plan. Ask for dates, budget, destination and practical preferences.",
    search: true,
  },
  {
    id: "research",
    title: "Research DO",
    description: "Public web research with source links. Local preview.",
    hostedDescription: "Compare source material you provide and flag gaps.",
    hostedDirection:
      "Compare the supplied source material. Distinguish facts, interpretation and evidence gaps. Do not claim to open links or search the web.",
    task: "compare",
    agent: "research",
    direction:
      "Research this question using primary public sources. Distinguish facts, interpretation and evidence gaps.",
    search: true,
  },
  {
    id: "creative",
    title: "Creative DO",
    description: "Generate an image from your visual brief.",
    task: "image",
    direction: "Create an original image following this visual brief.",
    search: false,
  },
  {
    id: "pet",
    title: "Pet DO",
    description: "Organise care notes and questions for your vet.",
    task: "plan",
    direction:
      "Organise the supplied pet-care notes and questions for the vet. Do not diagnose or prescribe.",
    search: false,
  },
];
