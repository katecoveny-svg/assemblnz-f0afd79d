import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22?deps=react@18.3.1,react-dom@18.3.1";
import { IndustryPackWelcomeEmail } from "../_shared/email-templates/industry-pack-welcome.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const KETE_NAMES: Record<string, string> = {
  waihanga: "Waihanga",
  manaaki: "Manaaki",
  pikau: "Pīkau",
  arataki: "Arataki",
  auaha: "Auaha",
  ako: "Ako",
  matauranga: "Mātauranga",
  hoko: "Hoko",
};

const FLEET_AGENT_SLUGS_BY_KETE: Record<string, string[]> = {
  waihanga: ["hapori", "kaupapa", "ata", "rawa", "whakaae", "pai", "arai", "iho", "signal"],
  manaaki: ["manuhiri", "aura", "kai", "hau", "mahi", "pai", "putea", "iho", "signal"],
  pikau: ["morunga", "gateway", "pikau", "transit", "transit-freight", "arai", "iho", "signal"],
  arataki: ["motor", "whaikorero", "whare", "rawa", "whakaae", "pai", "iho", "signal"],
  auaha: ["muse", "prism", "vessel-studio", "saffron", "pai", "putea", "iho", "signal"],
  ako: ["aroha", "ako-licence", "kaiako", "tamariki", "ero-pack", "iho", "signal"],
  matauranga: ["akonga", "kaiako-s", "reo", "ropu", "ero-s", "iho", "signal"],
  hoko: ["spark", "hoko-cga", "stock", "cellar", "pai", "putea", "iho", "signal"],
};

const AGENT_FUNCTION_BY_KETE: Record<string, string> = {
  waihanga: "agent-waihanga",
  manaaki: "agent-manaaki",
  pikau: "agent-pikau",
  arataki: "agent-arataki",
  auaha: "agent-auaha",
  ako: "kete-default-handler",
  matauranga: "kete-default-handler",
  hoko: "kete-default-handler",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return json({ error: "Stripe not configured" }, 500);
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;
    if (secret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
    }

    return json({ received: true, type: event.type });
  } catch (error) {
    console.error("stripe-webhook error:", error);
    return json(
      { error: "Webhook processing failed", message: error instanceof Error ? error.message : "Unknown" },
      400,
    );
  }
});

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const expanded = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price", "subscription"],
  });

  const metadata = expanded.metadata ?? {};
  const priceId = expanded.line_items?.data[0]?.price?.id ?? "";
  const industryPriceId =
    Deno.env.get("STRIPE_INDUSTRY_PACK_PRICE_ID") ?? Deno.env.get("INDUSTRY_PACK_PRICE_ID") ?? "";
  const isIndustryPack =
    metadata.plan === "industry-pack" &&
    (!industryPriceId || priceId === industryPriceId);

  if (!isIndustryPack) return;

  const kete = normalizeKete(metadata.kete);
  const slug = normalizeSlug(metadata.tenant_slug || metadata.company_name || session.id);
  const companyName = clean(metadata.company_name) || slug;
  const contactName = clean(metadata.contact_name);
  const phone = clean(metadata.contact_phone);
  const userEmail = clean(metadata.user_email || expanded.customer_details?.email || "");
  const authUserId = clean(metadata.auth_user_id || expanded.client_reference_id || "");
  const customerId = typeof expanded.customer === "string" ? expanded.customer : expanded.customer?.id ?? null;
  const subscriptionId =
    typeof expanded.subscription === "string" ? expanded.subscription : expanded.subscription?.id ?? null;
  const aliasEmail = `ops-${slug}@assembl.email`;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .upsert({
      name: companyName,
      slug,
      plan: "industry-pack",
      status: "active",
      is_active: true,
      billing_email: userEmail || null,
      kete_primary: kete,
      onboarding_complete: false,
      metadata: {
        stripe_checkout_session_id: expanded.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        contact_name: contactName,
        contact_phone: phone,
        email_alias: aliasEmail,
      },
    }, { onConflict: "slug" })
    .select("id,slug,name")
    .single();

  if (tenantError || !tenant) throw tenantError ?? new Error("Tenant upsert failed");

  if (authUserId) {
    await supabase.from("tenant_members").upsert({
      tenant_id: tenant.id,
      user_id: authUserId,
      role: "operator",
    }, { onConflict: "tenant_id,user_id" });

    await supabase.from("user_roles").upsert({
      user_id: authUserId,
      role: "operator",
    }, { onConflict: "user_id,role" });
  }

  await activateTenantKete(supabase, tenant.id, kete);
  await activateFleet(supabase, tenant.id, kete);
  await provisionAlias(supabase, tenant.id, aliasEmail, expanded.id);
  await upsertToolConnections(supabase, tenant.id, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
  });

  if (userEmail) {
    await sendWelcomeEmail({
      to: userEmail,
      companyName,
      contactName,
      keteName: KETE_NAMES[kete] ?? kete,
      aliasEmail,
      inboxUrl: `https://assembl.co.nz/app/${slug}/inbox`,
    });
  }

  await queueWelcomeDraft(supabase, {
    tenantId: tenant.id,
    slug,
    companyName,
    contactName,
    userEmail,
    kete,
    aliasEmail,
    checkoutSessionId: expanded.id,
  });
}

async function activateTenantKete(supabase: ReturnType<typeof createClient>, tenantId: string, kete: string) {
  const { data: definition } = await supabase
    .from("kete_definitions")
    .select("id")
    .eq("slug", kete)
    .maybeSingle();

  if (!definition?.id) return;

  await supabase.from("tenant_ketes").upsert({
    tenant_id: tenantId,
    kete_id: definition.id,
    enabled: true,
    display_name: KETE_NAMES[kete] ?? kete,
    config: { source: "industry-pack-checkout" },
  }, { onConflict: "tenant_id,kete_id" });
}

async function activateFleet(supabase: ReturnType<typeof createClient>, tenantId: string, kete: string) {
  const agents = FLEET_AGENT_SLUGS_BY_KETE[kete] ?? ["iho", "signal"];
  await supabase.from("agent_access").upsert(
    agents.map((agent_code) => ({
      tenant_id: tenantId,
      agent_code,
      pack_id: agent_code === "iho" || agent_code === "signal" ? "shared" : kete,
      is_enabled: true,
    })),
    { onConflict: "tenant_id,agent_code" },
  );
}

async function provisionAlias(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  aliasEmail: string,
  checkoutSessionId: string,
) {
  const [localPart, domain] = aliasEmail.split("@");

  await supabase.from("tenant_email_aliases").upsert({
    tenant_id: tenantId,
    alias_email: aliasEmail,
    local_part: localPart,
    domain,
    purpose: "ops",
    status: "provisioned",
    metadata: { stripe_checkout_session_id: checkoutSessionId },
  }, { onConflict: "alias_email" });

  await supabase.from("tenant_phone_numbers").upsert({
    tenant_id: tenantId,
    phone_number: aliasEmail,
    channel: "email",
    label: "Operations inbox",
    is_default: true,
  }, { onConflict: "phone_number,channel" });
}

async function upsertToolConnections(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  stripeMetadata: Record<string, string | null>,
) {
  await supabase.from("tenant_tool_connections").upsert([
    {
      tenant_id: tenantId,
      provider: "stripe",
      provider_label: "Stripe",
      status: "connected",
      connected_at: new Date().toISOString(),
      metadata: stripeMetadata,
    },
    {
      tenant_id: tenantId,
      provider: "xero",
      provider_label: "Xero",
      status: "pending",
      metadata: {},
    },
    {
      tenant_id: tenantId,
      provider: "google",
      provider_label: "Google Workspace",
      status: "pending",
      metadata: {},
    },
  ], { onConflict: "tenant_id,provider" });
}

async function queueWelcomeDraft(
  supabase: ReturnType<typeof createClient>,
  input: {
    tenantId: string;
    slug: string;
    companyName: string;
    contactName: string;
    userEmail: string;
    kete: string;
    aliasEmail: string;
    checkoutSessionId: string;
  },
) {
  const agentFunction = AGENT_FUNCTION_BY_KETE[input.kete] ?? "kete-default-handler";
  let agentResult: unknown = null;

  try {
    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/${agentFunction}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        action: "welcome_briefing",
        tenant_id: input.tenantId,
        kete: input.kete,
        payload: {
          company_name: input.companyName,
          contact_name: input.contactName,
          inbound_alias: input.aliasEmail,
        },
      }),
    });
    agentResult = await res.json().catch(() => ({ ok: res.ok, status: res.status }));
  } catch (error) {
    agentResult = { error: error instanceof Error ? error.message : "agent invocation failed" };
  }

  const draftBody = [
    `Kia ora ${input.contactName || input.companyName},`,
    "",
    `Your ${KETE_NAMES[input.kete] ?? input.kete} fleet is ready to start watching operational mail for ${input.companyName}.`,
    `Forward the first sample thread to ${input.aliasEmail}, then approve or edit the first response from this inbox.`,
    "",
    "Suggested first actions:",
    "- Confirm Xero and Google Workspace connections.",
    "- Set approval thresholds for low-risk drafts.",
    "- Forward one real operational email so the fleet can produce the first useful draft.",
  ].join("\n");

  const { error } = await supabase.from("toro_drafts").insert({
    tenant_id: input.tenantId,
    contact_name: input.contactName || input.companyName,
    contact_identifier: input.userEmail || input.aliasEmail,
    incoming_body: "Industry Pack checkout completed. Queue welcome briefing.",
    draft_body: draftBody,
    confidence: 0.92,
    status: "pending_approval",
    created_by_agent: agentFunction,
    source: "agentmail",
    source_metadata: {
      whanau_id: input.tenantId,
      agentmail_message_id: `welcome-${input.checkoutSessionId}`,
      tenant_slug: input.slug,
      kete: input.kete,
      agent_result: agentResult,
    },
    retention_class: "standard",
    extracted_actions: [
      { action: "connect_xero", label: "Connect Xero" },
      { action: "connect_google_workspace", label: "Connect Google Workspace" },
      { action: "set_approval_thresholds", label: "Set approval thresholds" },
    ],
  });

  if (error && error.code !== "23505") throw error;
}

async function sendWelcomeEmail(input: {
  to: string;
  companyName: string;
  contactName: string;
  keteName: string;
  aliasEmail: string;
  inboxUrl: string;
}) {
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoKey) {
    console.warn("BREVO_API_KEY missing; skipping Industry Pack welcome email");
    return;
  }

  const html = await renderAsync(
    IndustryPackWelcomeEmail({
      companyName: input.companyName,
      contactName: input.contactName,
      inboxUrl: input.inboxUrl,
      aliasEmail: input.aliasEmail,
      keteName: input.keteName,
    }),
  );

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": brevoKey },
    body: JSON.stringify({
      sender: { name: "Assembl", email: "noreply@assembl.co.nz" },
      replyTo: { email: "assembl@assembl.co.nz", name: "Assembl" },
      to: [{ email: input.to, name: input.contactName || input.companyName }],
      subject: `${input.keteName} fleet activated for ${input.companyName}`,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    console.error("Industry Pack welcome email failed:", await res.text());
  }
}

function normalizeKete(value: string | undefined | null) {
  const kete = clean(value).toLowerCase();
  if (kete in FLEET_AGENT_SLUGS_BY_KETE) return kete;
  return "waihanga";
}

function normalizeSlug(value: string) {
  const slug = clean(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 48);
  return slug || crypto.randomUUID().slice(0, 8);
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
