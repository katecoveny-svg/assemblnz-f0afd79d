// Arataki kete entry point — assembled for the iho-router and the sim runner
import type { KeteDefinition } from "../pipeline.ts";
import { arataki_validate } from "./kahu.ts";
import { arataki_taRules } from "./ta-rules.ts";
import { arataki_workflows } from "./workflows.ts";

export const arataki: KeteDefinition = {
  name: "ARATAKI",
  validator: arataki_validate,
  taRules: arataki_taRules,
  workflows: arataki_workflows,
};
