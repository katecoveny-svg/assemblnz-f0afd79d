# Whetū — Policies & SMS templates (knowledge base)

> Booking policies the agent quotes, plus the SMS templates it sends.
> Hours and party-size rules MUST match `lib/voice/config.ts` exactly.
> Timezone: **Pacific/Auckland**. Dinner-service restaurant.

---

## Opening hours

| Day | Hours |
|---|---|
| Monday | **Closed** |
| Tuesday | 5:00pm – 9:30pm |
| Wednesday | 5:00pm – 9:30pm |
| Thursday | 5:00pm – 9:30pm |
| Friday | 5:00pm – 10:30pm |
| Saturday | 12:00pm – 10:30pm |
| Sunday | 12:00pm – 9:00pm |

**Last seating is 60 minutes before close.** Tables are booked in 30-minute slots.

## Party-size policy

- We take bookings online and by phone for **1 to 10 people**.
- **Larger groups (11+)** are looked after directly by our team — the assistant will warmly transfer you to a person, or take a message so we can call you back.

## Dietary & allergen note

We cater for **vegetarian, vegan, gluten-free and dairy-free** across every course. Please tell us about **any allergies** when you book and we'll note them for the kitchen. We prepare carefully but our kitchen handles gluten, dairy, nuts, shellfish and other allergens, so we can't guarantee zero cross-contact — if your allergy is severe, let us know and we'll talk it through.

## Cancellation policy

Plans change — no worries. Please give us a call if you can't make it, ideally **at least 4 hours before** your booking, so we can offer the table to someone else. There's no cancellation fee for standard bookings of 1–10.

## Booking hold time

We hold your table for **15 minutes** past your booking time. If you're running late, just call and we'll do our best to keep it for you.

---

## SMS confirmation template

> Sent right after a booking is made. Keep it warm, plain, ~1–2 segments.

```
Kia ora {name}, your table at {restaurant} is booked: {date} at {time} for {party_size}. We can't wait to see you. To change it, just call us back. Ngā mihi, the {restaurant} team.
```

## SMS reminder template

> Sent ahead of the booking (timing configured separately). ~1–2 segments.

```
Kia ora {name}, a wee reminder of your booking at {restaurant} tomorrow, {date} at {time} for {party_size}. Need to change it? Give us a call. See you soon!
```

**Placeholders:** `{name}` · `{date}` · `{time}` · `{party_size}` · `{restaurant}` (= "Whetū").

---

*A booking made by our AI assistant produces an **evidence pack** for our records — a downloadable bundle of PDFs of what was agreed on the call. (We call this a Mana Receipt — cryptographically tamper-evident.) Your information is only used to make and confirm your booking; see how data is handled in docs/voice/PRIVACY-ACT-2020-MAPPING.md.*
