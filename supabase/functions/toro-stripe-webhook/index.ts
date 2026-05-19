import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TORO_PRICE_ID = "price_1TILj8PXAX9ohARRZqtNCzRW";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 42);
  return slug || `toro-${crypto.randomUUID().slice(0, 8)}`;
}

function aliasFor(slug: string) {
  return `${slug}-${crypto.randomUUID().slice(0, 6)}@toro.nz`;
}

async function sendWelcomeEmail(input: { to: string; name: string; aliasEmail: string }) {
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoKey) {
    console.warn("[toro-stripe-webhook] BREVO_API_KEY missing; skipping welcome email");
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": brevoKey },
    body: JSON.stringify({
      sender: { name: "assembl", email: "noreply@assembl.co.nz" },
      replyTo: { email: "assembl@assembl.co.nz", name: "assembl" },
      to: [{ email: input.to, name: input.name || input.to }],
      subject: "Welcome to Tōro",
      htmlContent: `
        <p>Kia ora${input.name ? ` ${input.name}` : ""},</p>
        <p>Your Tōro Family plan is active. Your onboarding address is <strong>${input.aliasEmail}</strong>.</p>
        <p>We will help you forward your first school notice and confirm the whānau setup.</p>
        <p><a href="https://assembl.co.nz/kete/toro/welcome">Open the Tōro welcome page</a></p>
      `,
    }),
  });

  if (!res.ok) {
    console.error("[toro-stripe-webhook] Brevo welcome failed", await res.text());
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const expanded = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price", "subscription", "customer"],
  });

  const priceId = expanded.line_items?.data[0]?.price?.id ?? "";
  if (priceId !== TORO_PRICE_ID) return { skipped: true, reason: "not_toro_price" };

  const email = clean(expanded.customer_details?.email);
  const name = clean(expanded.customer_details?.name) || email.split("@")[0] || "Tōro whānau";
  const slug = slugify(`toro-${name}`);
  const aliasEmail = aliasFor(slug);
  const customerId = typeof expanded.customer === "string" ? expanded.customer : expanded.customer?.id ?? null;
  const subscriptionId =
    typeof expanded.subscription === "string" ? expanded.subscription : expanded.subscription?.id ?? null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) throw new Error("Supabase service credentials missing");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .upsert({
      name,
      slug,
      plan: "toro-family",
      status: "active",
      is_active: true,
      billing_email: email || null,
      kete_primary: "toro",
      onboarding_complete: false,
      metadata: {
        source: "toro-stripe-checkout",
        inbound_alias: aliasEmail,
        stripe_checkout_session_id: expanded.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
      },
    }, { onConflict: "slug" })
    .select("id,slug,name")
    .single();

  if (tenantError || !tenant) throw tenantError ?? new Error("Tōro tenant upsert failed");

  await supabase.from("tenant_email_aliases").upsert({
    tenant_id: tenant.id,
    alias_email: aliasEmail,
    local_part: aliasEmail.split("@")[0],
    domain: "toro.nz",
    purpose: "toro-family",
    status: "pending_onboarding",
    metadata: { stripe_checkout_session_id: expanded.id },
  }, { onConflict: "alias_email" });

  if (customerId) {
    await supabase.from("toro_stripe_customers").upsert({
      tenant_id: tenant.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      subscription_status: "active",
    }, { onConflict: "stripe_customer_id" });
  }

  await supabase.from("toro_drafts").insert({
    tenant_id: tenant.id,
    source: "stripe",
    channel: "system",
    state: "needs_review",
    incoming_subject: "Tōro checkout completed",
    incoming_body: "Create onboarding plan and confirm inbound forwarding address.",
    draft_body: `Welcome ${name}. Confirm forwarding address ${aliasEmail} and collect the first school notice.`,
    metadata: { stripe_checkout_session_id: expanded.id },
  });

  if (email) await sendWelcomeEmail({ to: email, name, aliasEmail });
  return { tenantId: tenant.id, slug: tenant.slug, aliasEmail };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("TORO_STRIPE_WEBHOOK_SECRET") || Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey || !webhookSecret) return json({ error: "Stripe webhook secrets missing" }, 500);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");
    if (!signature) return json({ error: "Missing stripe-signature" }, 400);

    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const result = await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      return json({ received: true, result });
    }

    return json({ received: true, ignored: event.type });
  } catch (error) {
    console.error("[toro-stripe-webhook] error", error);
    return json({ error: error instanceof Error ? error.message : "Webhook failed" }, 500);
  }
});
