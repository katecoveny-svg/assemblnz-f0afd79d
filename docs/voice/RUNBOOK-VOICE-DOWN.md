# Runbook — Voice Agent Down (Manaaki Phase 1)

Operational runbook for `aria.manaaki@demo` (customer **Whetū**) covering three
named failure modes. For each: **detection signals → immediate mitigation →
recovery**. Keep this beside the on-call rotation.

> Quick reference: the agent is Twilio (NZ DID) → ElevenLabs Agents → Tōro
> (Claude Haiku 4.5) → Next.js API routes (`app/api/voice/*`) → Supabase. The
> Kahu dashboard (`app/internal/kahu`) shows per-call evidence packs.

---

## A. ElevenLabs is down

The voice runtime (STT/TTS/turn-taking) is unavailable. The number still rings
via Twilio, but the agent can't converse.

**Detection signals**
- ElevenLabs status page shows an incident; ElevenLabs API errors / 5xx in logs.
- Sharp drop in completed `kete_session` rows; calls connecting but no transcript.
- Callers report dead air or the call dropping after pickup.

**What callers hear / how it degrades**
- Twilio's **voicemail fallback** kicks in: callers are invited to leave a
  message, captured via the **`capture_message`** path. No live booking, but no
  lost caller — every message lands for the team to call back.

**Immediate mitigation**
1. Confirm it's ElevenLabs (not Twilio or our routes) via the status page + logs.
2. Verify the Twilio voicemail fallback is actually answering — place a test call.
3. Post a short status note to the team channel: "Aria live booking down,
   voicemail capturing — team to call back."
4. If the team is on shift, consider pointing the DID's failover at
   `TWILIO_TRANSFER_TO` so callers reach a person directly.

**Recovery**
1. Wait for ElevenLabs to clear the incident; re-run a test call end to end
   (greeting → consent → a test booking → confirmation SMS).
2. Check the post-call webhook fired and a **Mana Receipt** was written
   (visible in Kahu).
3. Work the voicemail backlog from `capture_message` — call those people back.
4. Revert any failover changes you made.

---

## B. Twilio is down

The number itself is unreachable.

**Detection signals**
- Twilio status page incident; Twilio API errors in logs.
- Calls to the NZ DID fail to connect (busy/unobtainable); zero inbound traffic.
- No new `kete_session` rows AND no ElevenLabs activity.

**What callers hear**
- The number doesn't connect at all. There is **no in-band fallback** when the
  carrier path is down — mitigation is comms + an alternate contact.

**Immediate mitigation**
1. Confirm via Twilio status page that it's a Twilio/carrier issue.
2. **Status comms** are the priority since callers get nothing: put a notice on
   Whetū's website/Google listing/social with an **alternate phone or
   email/booking link**, and tell the Whetū team to watch that channel.
3. Escalate: open a Twilio support ticket; if it's our config (e.g. the NZ
   **Regulatory Bundle** lapsed/suspended), check the Twilio console for bundle
   status. NZ bundles need Business Name + NZBN + authorised-rep ID + local NZ
   address.

**Recovery**
1. Once Twilio is healthy, place a test call to the DID and run the full flow.
2. Confirm SMS sending also recovered (it shares the Twilio account).
3. Remove the "use alternate contact" notice.
4. If the bundle had lapsed, re-submit (~3 business days approval) and track to
   completion.

---

## C. Google Calendar token expires

The service-account credential used for availability + booking fails. The agent
can talk, but `check_availability` and `book_reservation` error.

**Detection signals**
- 401/403 from Google Calendar in the `check_availability` / `book_reservation`
  route logs; "invalid_grant" / expired-credential errors.
- Calls connect and converse but bookings fail; `kete_session` rows show booking
  attempts without a `booking_id`.

**How the agent degrades**
- The agent should **not** promise a booking it can't make. It falls back to
  **taking the caller's details and leaving a message** via **`capture_message`**
  so the team can confirm the table manually. Warm, honest: "Our booking system
  is having a hiccup — let me take your details and we'll confirm by text."

**Immediate mitigation**
1. Confirm it's the Calendar credential (not Calendar API outage) from the logs.
2. Verify `capture_message` fallback is working so no caller is lost.
3. Notify the team that bookings need manual confirmation until the credential
   is rotated, and to watch the message queue.

**Recovery — rotate the service-account credential**
1. In Google Cloud Console, open the service account used for the Whetū calendar.
2. Create a **new JSON key**; download it.
3. Ensure the service account still has access to `GOOGLE_CALENDAR_ID` (re-share
   the calendar with the service-account email if needed).
4. Update **`GOOGLE_SERVICE_ACCOUNT_JSON`** (and `GOOGLE_CALENDAR_ID` if it
   changed) in the deployment environment and redeploy.
5. Test `check_availability` and a real `book_reservation` end to end; confirm
   the event appears in the calendar and a confirmation SMS sends.
6. **Delete the old key** in Google Cloud Console.
7. Work the `capture_message` backlog — manually confirm those bookings and text
   the callers.

---

## After any incident

- Confirm post-call webhooks resumed and **Mana Receipts** (evidence packs) are
  generating in **Kahu** for new calls.
- Capture a short timeline + cause in the team channel for the record.
