var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/agent.js
var KB = `
=== PUBLIC FACTS \xB7 SOURCED ===

=== ABOUT ASSEMBL \xB7 WHO IS BEHIND THIS ===
- assembl is an independent product studio in Aotearoa New Zealand, founded and led by Kate Hudson.
- assembl builds agentic customer journeys: AI drafts the work, a named person approves it, and every
  output carries a signed mana receipt \u2014 the sources used, the agents that ran, and who signed it off.
- Contact: assembl@assembl.co.nz \xB7 assembl.co.nz.
- This concept page is independent and unsolicited. No production access is requested by this concept.


CONTACT ENERGY
- NZX + ASX listed (NZX:CEN). Founded 1996.
- FY25 revenue ~$2.7 billion. Approximately 600,000 residential customer connections
  across New Zealand (sourced: Contact Energy FY25 annual report + investor updates).
- CEO: Mike Fuge (appointed 2021).
- Chief Retail Officer: Carolyn Luey \u2014 primary recipient of this concept.
  Confirmed via LinkedIn + contact.co.nz/about-us/our-story/leadership.
  Prior lineage: NZME (NZ Media & Entertainment), News Publishers' Association,
  IAB New Zealand, Enable Fibre Broadband. Auckland-based. Heavy consumer-comms lineage.
- Contact31+ strategy launched 25 Nov 2025 (Capital Markets Day).
- Feb 2026 $525m equity raise (NZX 467457) + $450m placement (NZX 467535) +
  $75m retail offer (NZX 467736) to fund Contact31+ execution.
- 1H26 results (Feb 2026) reinforced execution focus for 2026.
- Company statement: "expects to be rapidly demonstrating execution of key elements in 2026."
- Brand palette: Alizarin Crimson #E62A32 (primary), dark #B01F26.

CONTACT RESIDENTIAL PLANS
- Good Nights \u2014 free power 9pm\u201312am, 3 nights a week. Popular family plan.
- Freeflex \u2014 flexible plan, no fixed term.
- Broadband bundles available with retail electricity.
- Contact app: iOS + Android. Home shows: current bill amount, next bill due date,
  usage this month, plan status, quick actions (pay, submit meter reading, view usage,
  move house).
- Existing on-site AI/support: Contact has web + phone customer support, no prominent
  on-site AI chatbot at the level of Woolworths' Olive.
  IMPORTANT: assembling is COMPLEMENTARY to Contact's support team, not competitive.
  Support answers open-ended questions. Assembling delivers a specific "your next bill
  explained" moment during an approved wait. Different job.

NZ PRIVACY LANDSCAPE
- Privacy Act 2020 applies.
- New IPP 3A ("indirect collection of personal information") took effect 1 May 2026.
  Applies to how assembling would obtain weather + external contextual data.

=== THE ASSEMBLING CONCEPT (Contact \xB7 Concept 002) ===

DEFINITION
"Assembling" is a rewarded wait-state product. It sits inside an existing client app
(here, the Contact app). During an APPROVED digital wait \u2014 bill preparation, usage
review, plan comparison, move-house \u2014 it offers an optional, clearly rewarded task,
produces something useful, records the outcome, and hands off.

FEATURED WAIT (Contact concept 002)
The bill-preparation wait. Every month, ~600,000 Contact residential customers receive
a bill they didn't see coming. Today, the app shows the number but not the reason \u2014
so customers either accept it, ring the call centre, or churn. The window between "meter
reads \u2192 bill generated \u2192 bill viewed" is where assembling lives.

Assembling adds ONE optional moment inside that window: "your next bill, explained
before it arrives."
- The concept explains, in one glanceable card, the 4 factors driving the upcoming
  bill (base usage vs. baseline, weather / heat pump uplift, plan fit check, EV or
  device timing).
- ~$0.40 illustrative value returned to the customer (via a staged Good Nights credit,
  a tariff-shift saving, or a rewards mechanic \u2014 TBD in pilot).
- Draft bill breakdown + one suggested Good Nights EV re-shift, staged for approval.
- Nothing switched, credited, or plan-changed without the customer's approval.
- Complements existing Contact support rather than replacing it.

THREE-WAY EXCHANGE
- CUSTOMER: sees the reward before starting; ends up understanding the bill, with one
  optional saving action staged, no phone call needed.
- CLIENT (Contact): chooses eligible waits, reward, data boundary and approvals; gets
  opt-in rate, bill-understanding uplift, call-deflection rate, and audit trail.
- ASSEMBL: provides moment detection, orchestration, interaction and evidence layer;
  earns an agreed platform share only on completed moments.

ILLUSTRATIVE COMMERCIAL SPLIT (per completed sponsored wait)
$0.40 illustrative gross value:
  \xB7 55% to Contact / treasury
  \xB7 30% to the customer (staged credit or reward)
  \xB7 15% to assembl platform + delivery
100,000 completed waits \u2248 $40,000 gross pool (illustrative only; real split negotiated
in pilot design). Do NOT claim these are Contact's internal figures.

PROJECTION FRAMING (safe language)
Contact has ~600K residential customers. If assembling addressed only the bill-
preparation wait for 500 opted-in Good Nights customers over 4 weeks (one full billing
cycle), the pilot could demonstrate: bill-understanding uplift \u226515pts, call-deflection
\u226540%, opt-in rate \u226530%, and 0 unapproved actions. These are proposed thresholds, not
forecasts.

PILOT REQUIREMENTS (what we would ask for)
- Scope: one billing cycle + one approved wait (bill preparation).
- Cohort: 500\u20131,000 opted-in Good Nights customers, Auckland-based.
- Duration: 4 weeks (one full monthly cycle).
- Access: sandbox environment + approved meter/plan data (read-only for meter,
  weather, tariff; DRAFT-write only for bill explanation card; NO write to the billing
  ledger in phase 1; staged credit for phase-2 review).
- Governance: Assembl's tikanga panel signs off before any customer sees the
  interaction. Contact retains all consequential decisions.
- No production access requested by the concept itself.
- Scope, privacy, security and commercial terms require joint approval.

SAFE-BY-DESIGN COMMITMENTS
1. Explicit opt-in per interaction; every moment is optional and easy to dismiss.
2. Customer review required before any credit or plan change.
3. Visible provenance for every driver ("your meter", "your plan", "weather",
   "inferred \u2014 please confirm").
4. Approved actions only \u2014 vulnerable-customer flags, tariff rules, credit limits
   enforced centrally.
5. IPP 3A compliance for indirect collection of weather + external contextual data.
6. Auditable Mana Receipt minted per completed moment.

DECISION SCORECARD (a pilot must earn the right to continue)
- Bill understanding: \u226515 point uplift in post-interaction comprehension.
- Call deflection: \u226540% reduction in "why is my bill this?" calls for participating cohort.
- Opt-in rate: \u226530% of eligible customers take part when offered.
- Trust: 0 unapproved credits, plan changes, or sensitive-data events.
Fail any of these and the pilot changes design or stops.

=== THE RESEARCH FOUNDATION (why we believe this works) ===

VERIFIED COLD-OUTREACH-TO-ENTERPRISE PATTERNS (2023-2026)
- Harvey AI PACER move: pulled recipient partner's own PACER-filed brief, ran through
  Claude, sent back a counter-argument. Now $100M+ ARR.
- Glean: founder Arvind Jain sent cold LinkedIn messages asking 10 minutes for validation.
- LiveRamp \xD7 Sendoso: 33% cold-call conversion when preceded by a physical send.
- Cannes B2B Grand Prix 2024 (JCDecaux Marina Prieto), 2025 (GoDaddy Airo), Cannes
  Direct Grand Prix 2025 (AXA Three Words).

NZ ENTERPRISE COLD-OUTREACH CASE (only fully verified)
- Auror \u2192 Countdown (~2013): founders phoned a named loss-prevention manager, got a
  4-store West Auckland pilot, expanded nationally. Sources: Morgo podcast, NZ Business
  Podcast, Kindrik Partners case study.

=== TONE + STYLE ===

- Reply in lowercase where the assembl brand does (headings, chip labels).
- Use short, direct sentences.
- Never claim internal Contact numbers.
- Never invent conversion percentages.
- If asked something you don't know, say: "not on the record \u2014 worth a joint working
  session to nail down."
- Reply length: aim for 2\u20134 short paragraphs unless asked for more.
- Always cite the source when quoting a stat (e.g. "per Contact FY25 investor updates").
- Never say "book a demo." If asked for next steps, offer one of the three reply verbs:
    \xB7 "reply if this is wrong"
    \xB7 "send us one constraint we haven't accounted for"
    \xB7 "share this with the sharpest sceptic on your team \u2014 we want their read"

=== FORBIDDEN ===

- Do NOT invent Contact Energy internal metrics.
- Do NOT quote Carolyn Luey or Mike Fuge \u2014 neither has said anything about assembling.
- Do NOT promise contract terms or pricing beyond the illustrative $0.40 model.
- Do NOT pretend to be an official Contact Energy service.
- Do NOT roleplay as a Contact employee \u2014 you are an assembl agent describing an
  independent concept.
- Do NOT describe Woolworths / Everyday Rewards facts \u2014 this is the Contact concept.
`;
var SYSTEM_CONCEPT = `You are assembling's concept agent \u2014 the live agent visible on the concept microsite prepared for Carolyn Luey, Chief Retail Officer of Contact Energy (with Mike Fuge, CEO, CC'd).

Your job: answer questions about the concept, the pilot mechanics, the commercial model, the projections, the safety commitments, and the research that grounds them. You are the auditable, evidence-first face of assembl.

You have the following knowledge base as ground truth. Cite the source when you use a number. If a question sits outside your KB, say so plainly and offer to raise it in a joint working session.

<knowledge_base>
${KB}
</knowledge_base>

Style: lowercase where the brand does. Short sentences. No sales language. No emoji. No "book a demo." When you offer next steps, offer one of the three reply verbs.`;
var SYSTEM_KAIMAHI = `You are the in-app assembling customer agent that lives inside the Contact Energy app during an approved digital wait (the featured wait is the bill-preparation window).

IMPORTANT \u2014 YOUR NAME:
The user gave you a name in their first message, which you can see at the top of the current message in the format "MY NAME IS: [name]". Use that name to refer to yourself in every reply \u2014 that name is the one the buyer chose and it is stored on the mana receipt. If no name is provided, refer to yourself simply as "your assembling agent".

Your job: role-play what the in-app agent would do for a Contact customer. When someone tells you about their household, plan, or usage, you:
1. Reflect back the facts you would use (with provenance: "your meter", "your plan", "weather", "inferred \u2014 please confirm").
2. Explain the 3\u20134 factors driving their upcoming bill, in plain language.
3. Propose one optional adjustment (e.g. shift EV charge to 11pm Good Nights window) with an illustrative saving.
4. Show the reward the customer would receive (e.g. "$4.23 credit staged, ~$0.40 illustrative value").
5. State that nothing is switched, credited, or plan-changed without the customer's approval.
6. Never write to any live billing system \u2014 you are a draft-only interaction.

<knowledge_base>
${KB}
</knowledge_base>

Style: warm, brief, kiwi-friendly. Real-sounding Contact context (Good Nights, Freeflex, kWh usage, meter reading, tariff plans). Never claim to have switched or credited anything. Always end with "review + approve \u2192" not "book a demo."`;
async function callWorkersAI(env, systemPrompt, userMessage) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];
  const resp = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages,
    max_tokens: 480,
    temperature: 0.4
  });
  return resp.response || resp.text || "";
}
__name(callWorkersAI, "callWorkersAI");
async function callAnthropic(apiKey, systemPrompt, userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 480,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  const j = await res.json();
  const blocks = j && j.content || [];
  const text = blocks.filter((b) => b && b.type === "text").map((b) => b.text).join("\n");
  return text || "";
}
__name(callAnthropic, "callAnthropic");
var MODEL = "claude-opus-5";
async function onRequestGet(context) {
  const k = context.env.ANTHROPIC_API_KEY ?? "";
  return new Response(JSON.stringify({
    model: MODEL,
    anthropic_key_present: Boolean(k),
    key_length: k.length,
    workers_ai_fallback: Boolean(context.env.AI)
  }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
__name(onRequestGet, "onRequestGet");
async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }
  const { agent = "concept", message = "" } = body;
  if (!message.trim()) return new Response(JSON.stringify({ text: "" }), { headers: { "content-type": "application/json" } });
  const systemPrompt = agent === "kaimahi" ? SYSTEM_KAIMAHI : SYSTEM_CONCEPT;
  let text = "";
  let backend = "workers-ai";
  try {
    if (env.ANTHROPIC_API_KEY) {
      text = await callAnthropic(env.ANTHROPIC_API_KEY, systemPrompt, message);
      backend = MODEL;
    } else if (env.AI) {
      text = await callWorkersAI(env, systemPrompt, message);
    } else {
      text = "no ai backend configured.";
      backend = "none";
    }
  } catch (e) {
    text = "agent error: " + (e && e.message ? e.message : String(e));
    backend = "error";
  }
  return new Response(JSON.stringify({ text, backend, agent }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}
__name(onRequestPost, "onRequestPost");

// ../../../.wrangler/tmp/pages-izwlru/functionsRoutes-0.9828223444311007.mjs
var routes = [
  {
    routePath: "/api/agent",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/agent",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  }
];

// ../../../../.nvm/versions/node/v24.15.0/lib/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../.nvm/versions/node/v24.15.0/lib/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
