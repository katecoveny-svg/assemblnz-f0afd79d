/**
 * POST /api/voice/book-reservation — ElevenLabs server tool.
 * Body: { call_sid, name, mobile, date, time, party_size, notes? }.
 * Idempotent: a repeat of the same caller+slot returns the existing booking.
 */
import { NextResponse } from 'next/server';
import { bookReservation } from '@/lib/voice/tools/book_reservation';
import { appendToolCall } from '@/lib/voice/clients/supabase';
import { checkWebhookSecret, unauthorized } from '@/lib/voice/api-auth';
import type { BookingRequest } from '@/lib/voice/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!checkWebhookSecret(req).ok) return unauthorized();

  const body = (await req.json()) as Partial<BookingRequest> & { call_sid?: string };
  const required = ['name', 'mobile', 'date', 'time', 'party_size'] as const;
  for (const k of required) {
    if (body[k] === undefined || body[k] === null || body[k] === '') {
      return NextResponse.json({ error: `${k} required` }, { status: 400 });
    }
  }

  const reqBody: BookingRequest = {
    name: body.name!,
    mobile: body.mobile!,
    date: body.date!,
    time: body.time!,
    party_size: Number(body.party_size),
    notes: body.notes,
  };

  try {
    const result = await bookReservation(reqBody);
    if (body.call_sid) {
      await appendToolCall(body.call_sid, {
        tool: 'book_reservation',
        args: {
          date: reqBody.date,
          time: reqBody.time,
          party_size: reqBody.party_size,
          booking_id: result.booking_id,
        },
        result_summary: result.duplicate ? `existing booking ${result.booking_id}` : `booked ${result.booking_id}`,
        ok: true,
        ts: new Date().toISOString(),
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
