import { Hono } from "https://deno.land/x/hono@v4.3.6/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// NZ Business Intelligence Tools
const TOOLS: Record<string, { description: string; parameters: any; handler: (args: any) => any }> = {
  nz_employment_cost: {
    description: "Calculate the true annual cost of a NZ employee including KiwiSaver (3.5%), ACC, annual leave, sick leave, public holidays, recruitment",
    parameters: {
      type: "object",
      properties: {
        annual_salary: { type: "number", description: "Gross annual salary in NZD" },
        kiwisaver_rate: { type: "number", description: "Employer KiwiSaver rate (default 3.5)", default: 3.5 },
      },
      required: ["annual_salary"],
    },
    handler: ({ annual_salary, kiwisaver_rate = 3.5 }) => {
      const ks = annual_salary * (kiwisaver_rate / 100);
      const acc = annual_salary * 0.028;
      const annual_leave = annual_salary * (20 / 260);
      const sick_leave = annual_salary * (10 / 260);
      const public_holidays = annual_salary * (11.5 / 260);
      const recruitment = 2000;
      const total = annual_salary + ks + acc + annual_leave + sick_leave + public_holidays + recruitment;
      return {
        salary: annual_salary, kiwisaver: Math.round(ks), acc_levy: Math.round(acc),
        annual_leave_cost: Math.round(annual_leave), sick_leave_cost: Math.round(sick_leave),
        public_holiday_cost: Math.round(public_holidays), recruitment_amortised: recruitment,
        total_annual_cost: Math.round(total),
        percentage_above_salary: Math.round((total / annual_salary - 1) * 100) + "%",
      };
    },
  },
  nz_gst_calculator: {
    description: "Calculate NZ GST (15%). Convert between GST-inclusive and GST-exclusive amounts.",
    parameters: {
      type: "object",
      properties: {
        amount: { type: "number", description: "The dollar amount" },
        direction: { type: "string", enum: ["add_gst", "remove_gst"] },
      },
      required: ["amount", "direction"],
    },
    handler: ({ amount, direction }) => {
      if (direction === "add_gst") {
        return { exclusive: amount, gst: Math.round(amount * 0.15 * 100) / 100, inclusive: Math.round(amount * 1.15 * 100) / 100 };
      } else {
        const exclusive = Math.round(amount / 1.15 * 100) / 100;
        return { inclusive: amount, gst: Math.round((amount - exclusive) * 100) / 100, exclusive };
      }
    },
  },
  nz_minimum_wage_check: {
    description: "Check if an hourly rate meets NZ minimum wage requirements as of April 2026",
    parameters: {
      type: "object",
      properties: {
        hourly_rate: { type: "number", description: "The hourly rate in NZD to check" },
        worker_type: { type: "string", enum: ["adult", "starting_out", "training"], default: "adult" },
      },
      required: ["hourly_rate"],
    },
    handler: ({ hourly_rate, worker_type = "adult" }) => {
      const rates: Record<string, number> = { adult: 23.95, starting_out: 19.16, training: 19.16 };
      const minimum = rates[worker_type];
      const compliant = hourly_rate >= minimum;
      return {
        hourly_rate, worker_type, minimum_required: minimum, compliant,
        shortfall: compliant ? 0 : Math.round((minimum - hourly_rate) * 100) / 100,
        message: compliant ? "This rate meets the NZ minimum wage requirement." : `This rate is $${(minimum - hourly_rate).toFixed(2)}/hr below minimum wage.`,
      };
    },
  },
  nz_paye_calculator: {
    description: "Calculate NZ PAYE tax on annual income using 2026 tax brackets",
    parameters: {
      type: "object",
      properties: {
        annual_income: { type: "number", description: "Annual gross income in NZD" },
        includes_acc: { type: "boolean", default: true },
      },
      required: ["annual_income"],
    },
    handler: ({ annual_income, includes_acc = true }) => {
      let tax = 0;
      const brackets = [
        { limit: 14000, rate: 0.105 },
        { limit: 48000, rate: 0.175 },
        { limit: 70000, rate: 0.30 },
        { limit: 180000, rate: 0.33 },
        { limit: Infinity, rate: 0.39 },
      ];
      let remaining = annual_income;
      let prev = 0;
      for (const b of brackets) {
        const taxable = Math.min(remaining, b.limit - prev);
        if (taxable <= 0) break;
        tax += taxable * b.rate;
        remaining -= taxable;
        prev = b.limit;
      }
      const acc = includes_acc ? annual_income * 0.0153 : 0;
      return {
        gross_income: annual_income,
        paye: Math.round(tax),
        acc_levy: Math.round(acc),
        net_income: Math.round(annual_income - tax - acc),
        effective_rate: (tax / annual_income * 100).toFixed(1) + "%",
      };
    },
  },
  nz_food_safety_temp_check: {
    description: "Validate a food temperature against NZ Food Act 2014 safe temperature requirements",
    parameters: {
      type: "object",
      properties: {
        temperature_celsius: { type: "number" },
        food_type: { type: "string", enum: ["chiller", "freezer", "cooking", "hot_holding", "cooling"] },
      },
      required: ["temperature_celsius", "food_type"],
    },
    handler: ({ temperature_celsius, food_type }) => {
      const limits: Record<string, any> = {
        chiller: { max: 5, warning: 4, unit: "max" },
        freezer: { max: -15, warning: -18, unit: "max" },
        cooking: { min: 75, warning: 70, unit: "min" },
        hot_holding: { min: 65, warning: 60, unit: "min" },
        cooling: { max: 5, warning: 8, unit: "max" },
      };
      const limit = limits[food_type];
      let status: string;
      if (limit.unit === "max") {
        status = temperature_celsius <= limit.warning ? "pass" : temperature_celsius <= limit.max ? "warning" : "fail";
      } else {
        status = temperature_celsius >= limit.min ? "pass" : temperature_celsius >= limit.warning ? "warning" : "fail";
      }
      return { temperature_celsius, food_type, status, message: `${temperature_celsius}°C — ${status.toUpperCase()}` };
    },
  },
};

const app = new Hono();

app.options("/*", (c) => new Response(null, { headers: corsHeaders }));

// MCP-compatible endpoints
app.post("/*", async (c) => {
  const body = await c.req.json();
  const { method, params, id } = body;

  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  if (method === "initialize") {
    return c.json({
      jsonrpc: "2.0", id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "assembl-nz", version: "1.0.0" },
      },
    }, 200, headers);
  }

  if (method === "tools/list") {
    const tools = Object.entries(TOOLS).map(([name, t]) => ({
      name, description: t.description, inputSchema: t.parameters,
    }));
    return c.json({ jsonrpc: "2.0", id, result: { tools } }, 200, headers);
  }

  if (method === "tools/call") {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};
    const tool = TOOLS[toolName];
    if (!tool) {
      return c.json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${toolName}` } }, 200, headers);
    }
    try {
      const result = tool.handler(toolArgs);
      return c.json({
        jsonrpc: "2.0", id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      }, 200, headers);
    } catch (e) {
      return c.json({
        jsonrpc: "2.0", id,
        result: { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Unknown"}` }], isError: true },
      }, 200, headers);
    }
  }

  return c.json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } }, 200, headers);
});

// Health check
app.get("/*", (c) => c.json({ status: "ok", server: "assembl-nz", version: "1.0.0", tools: Object.keys(TOOLS) }, 200, corsHeaders));

Deno.serve(app.fetch);
