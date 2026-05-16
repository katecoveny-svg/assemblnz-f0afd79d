import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { runKetePipeline } from "../_shared/kete-agent-pipeline.ts";
import { akoLogic } from "./logic.ts";

Deno.serve((req) => runKetePipeline(req, akoLogic));
