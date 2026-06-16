# Demo call #1 — end-to-end (simulated)

> **Status: SIMULATED.** No live +64 DID is provisioned yet (that needs Kate's
> Twilio account + an approved NZ Regulatory Bundle — see PR open questions).
> This is the scripted end-to-end flow the integration tests exercise
> (`lib/voice/tests/integration.inbound-call.test.ts`). The Mana Receipt below
> is **real**: its hashes are computed with the same canonical-hash rules the
> production code uses (`lib/voice/hashing.ts`) and are independently
> verifiable. Replace with a recording of the first live call once the DID is
> live.

## Transcript

**Aria:** Kia ora, you’ve reached Whetū — I’m Aria, the booking assistant. I record calls just to confirm your booking; is that OK?
**Caller:** Yeah, that’s fine.
**Aria:** Ka pai, ngā mihi. What name’s the booking under, and how many of you?
**Caller:** Mere, table for four.
**Aria:** Lovely. What night were you thinking?
**Caller:** Saturday the 20th, around seven if you’ve got it.
**Aria:** *(check_availability → 8 slots)* We’ve got 7:00 pm on Saturday the 20th for four — shall I lock that in?
**Caller:** Yes please.
**Aria:** *(book_reservation → evt_9af3demo)* Done — four guests, Saturday 20 June at 7:00 pm. What’s the best mobile for your confirmation text?
**Caller:** Oh-two-one… two-three-four, nine-nine-nine.
**Aria:** *(send_sms → ***999)* Sent. You’ll have a text confirming it. Anything else I can help with?
**Caller:** No, that’s all. Cheers.
**Aria:** Ka kite, see you Saturday. Ngā mihi.

**Confirmation SMS sent:** “Kia ora Mere, your table at Whetū is booked: Sat 20 Jun at 7:00 pm, 4 guests. Need to change it? Just reply or call us back. Ngā mihi.”

## Mana Receipt #1 (the evidence pack)

Plain English: a downloadable bundle recording exactly what happened on the
call — consent, booking, the confirmation text — with timestamps. The hash
chain below makes it tamper-evident.

```json
{
  "schema_version": "voice-1",
  "agent": "aria.manaaki@demo",
  "agent_version": "manaaki-phase1-0.1.0",
  "customer_id": "whetu",
  "call_sid": "CA-demo-0001",
  "caller_number_masked": "********999",
  "started_at": "2026-06-17T19:02:11+12:00",
  "ended_at": "2026-06-17T19:04:48+12:00",
  "status": "completed",
  "consent": {
    "granted": true,
    "prompt_text": "I record calls just to confirm your booking — is that OK?",
    "response_text": "yeah, that’s fine",
    "captured_method": "speech",
    "ts": "2026-06-17T19:02:19+12:00"
  },
  "booking": {
    "booking_id": "evt_9af3demo",
    "date": "2026-06-20",
    "time": "19:00",
    "party_size": 4
  },
  "sms_sent": true,
  "transferred": false,
  "tool_calls": [
    {
      "tool": "capture_consent",
      "args": {
        "verdict": "granted"
      },
      "result_summary": "consent granted",
      "ok": true,
      "ts": "2026-06-17T19:02:19+12:00"
    },
    {
      "tool": "check_availability",
      "args": {
        "date": "2026-06-20",
        "party_size": 4
      },
      "result_summary": "8 slots",
      "ok": true,
      "ts": "2026-06-17T19:03:05+12:00"
    },
    {
      "tool": "book_reservation",
      "args": {
        "date": "2026-06-20",
        "time": "19:00",
        "party_size": 4,
        "booking_id": "evt_9af3demo"
      },
      "result_summary": "booked evt_9af3demo",
      "ok": true,
      "ts": "2026-06-17T19:04:02+12:00"
    },
    {
      "tool": "send_sms",
      "args": {
        "to_masked": "***999"
      },
      "result_summary": "sms SM_demo",
      "ok": true,
      "ts": "2026-06-17T19:04:30+12:00"
    }
  ],
  "privacy": {
    "retention_class": "call-with-recording",
    "ipps_satisfied": [
      "IPP 1",
      "IPP 2",
      "IPP 3",
      "IPP 4",
      "IPP 5",
      "IPP 6",
      "IPP 9",
      "IPP 10",
      "IPP 11",
      "IPP 12",
      "IPP 13"
    ]
  }
}
```

**Chain integrity**

| field | value |
|---|---|
| sha256 (payload) | `1473f265dc4feb332e4b65c7337bba905ad78adfa86103aa6cb7417b5990767d` |
| prev_hash (genesis — receipt #1) | `0000000000000000000000000000000000000000000000000000000000000000` |
| chain_hash | `c2d2b833f5c36524ffc81a6d6ed254ad553b9a017b9d40d2436f1f272ae60975` |

Verify independently:

```
chain_hash == sha256( prev_hash + sha256 )
c2d2b833f5c36524ffc81a6d6ed254ad553b9a017b9d40d2436f1f272ae60975
  == sha256("0000000000000000000000000000000000000000000000000000000000000000" + "1473f265dc4feb332e4b65c7337bba905ad78adfa86103aa6cb7417b5990767d")  ✓
```
