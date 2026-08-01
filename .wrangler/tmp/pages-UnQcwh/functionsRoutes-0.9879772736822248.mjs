import { onRequestGet as __api_agent_js_onRequestGet } from "/Users/kateharland/assembl-web/research/assembling-giltrap/functions/api/agent.js"
import { onRequestPost as __api_agent_js_onRequestPost } from "/Users/kateharland/assembl-web/research/assembling-giltrap/functions/api/agent.js"
import { onRequestGet as __api_lot_js_onRequestGet } from "/Users/kateharland/assembl-web/research/assembling-giltrap/functions/api/lot.js"
import { onRequestPost as __api_lot_js_onRequestPost } from "/Users/kateharland/assembl-web/research/assembling-giltrap/functions/api/lot.js"

export const routes = [
    {
      routePath: "/api/agent",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_agent_js_onRequestGet],
    },
  {
      routePath: "/api/agent",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_agent_js_onRequestPost],
    },
  {
      routePath: "/api/lot",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_lot_js_onRequestGet],
    },
  {
      routePath: "/api/lot",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_lot_js_onRequestPost],
    },
  ]