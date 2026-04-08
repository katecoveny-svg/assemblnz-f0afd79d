// Pikau kete entry point — assembled for the iho-router and the sim runner
import type { KeteDefinition } from "../pipeline.ts";
import { pikau_validate } from "./kahu.ts";
import { pikau_taRules } from "./ta-rules.ts";
import { pikau_workflows } from "./workflows.ts";

export const pikau: KeteDefinition = {
  name: "PIKAU",
  validator: pikau_validate,
  taRules: pikau_taRules,
  workflows: pikau_workflows,
};
