import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9-]{8,64}$/;

function cleanText(value: unknown, fallback = "", limit = 8000) {
  return String(value ?? fallback).trim().slice(0, limit);
}

function cleanPayload(value: unknown) {
  const input = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const moments = Array.isArray(input.moments)
    ? input.moments
        .slice(0, 12)
        .map((item) => {
          const moment = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
          return {
            id: cleanText(moment.id, crypto.randomUUID(), 80),
            caption: cleanText(moment.caption, "", 500),
            createdAt: cleanText(moment.createdAt, new Date().toISOString(), 80),
            imageDataUrl: cleanText(moment.imageDataUrl, "", 1_800_000),
          };
        })
        .filter((item) => item.caption || item.imageDataUrl)
    : [];

  return {
    city: cleanText(input.city, "Milan", 80),
    travelers: cleanText(input.travelers, "Kate, Adrian", 240),
    departureDate: cleanText(input.departureDate, "2026-05-24", 80),
    routePlan: cleanText(input.routePlan, "", 8000),
    bookingVault: cleanText(input.bookingVault, "", 18000),
    today: cleanText(input.today, "", 2400),
    bookings: cleanText(input.bookings, "", 8000),
    worries: cleanText(input.worries, "", 5000),
    notes: cleanText(input.notes, "", 12000),
    question: cleanText(input.question, "", 2200),
    moments,
  };
}

function newSlug() {
  return `italy-${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

function shareUrl(req: NextRequest, slug: string) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/^/, "https://") ||
    new URL(req.url).origin;
  return `${origin.replace(/\/$/, "")}/hapai/voyage-italy?trip=${slug}`;
}

export async function GET(req: NextRequest) {
  const slug = cleanText(new URL(req.url).searchParams.get("slug"), "", 80).toLowerCase();
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Missing or invalid trip link." }, { status: 400 });
  }

  const service = getServiceClient();
  const { data, error } = await service
    .from("voyage_shared_trips")
    .select("share_slug,title,travellers,payload,updated_by,updated_at,created_at")
    .eq("share_slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[voyage/shared] load failed", error);
    return NextResponse.json({ error: "Could not load that shared trip." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Shared trip not found." }, { status: 404 });

  return NextResponse.json({
    trip: {
      shareSlug: data.share_slug,
      shareUrl: shareUrl(req, data.share_slug),
      title: data.title,
      travellers: data.travellers,
      payload: data.payload,
      updatedBy: data.updated_by,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const requestedSlug = cleanText(body?.shareSlug, "", 80).toLowerCase();
  const shareSlug = SLUG_RE.test(requestedSlug) ? requestedSlug : newSlug();
  const payload = cleanPayload(body?.payload);
  const travellers = payload.travelers
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  const service = getServiceClient();
  const { data, error } = await service
    .from("voyage_shared_trips")
    .upsert(
      {
        share_slug: shareSlug,
        title: cleanText(body?.title, "Kate + Adrian · Italia 2026", 160),
        travellers: travellers.length ? travellers : ["Kate", "Adrian"],
        payload,
        updated_by: cleanText(body?.updatedBy, "Kate", 80),
      },
      { onConflict: "share_slug" },
    )
    .select("share_slug,title,travellers,payload,updated_by,updated_at,created_at")
    .single();

  if (error) {
    console.error("[voyage/shared] save failed", error);
    return NextResponse.json({ error: "Could not save the shared trip." }, { status: 500 });
  }

  return NextResponse.json({
    trip: {
      shareSlug: data.share_slug,
      shareUrl: shareUrl(req, data.share_slug),
      title: data.title,
      travellers: data.travellers,
      payload: data.payload,
      updatedBy: data.updated_by,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
    },
  });
}
