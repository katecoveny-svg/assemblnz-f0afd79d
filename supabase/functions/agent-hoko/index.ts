import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { runKetePipeline } from "../_shared/kete-agent-pipeline.ts";
import { hokoLogic } from "./logic.ts";

Deno.serve((req) => runKetePipeline(req, hokoLogic));
