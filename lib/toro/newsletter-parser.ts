export type SchoolSurvivalKind =
  | "event"
  | "deadline"
  | "payment"
  | "gear"
  | "permission"
  | "sport"
  | "music"
  | "notice";

export type SchoolSurvivalItem = {
  kind: SchoolSurvivalKind;
  title: string;
  date: string;
  time?: string;
  amount?: number;
  item?: string;
  child_year_level?: string;
  source_paragraph: string;
};

export type SchoolSurvivalResult = {
  id: string;
  schoolName?: string;
  sourceType: "paste" | "pdf" | "image";
  items: SchoolSurvivalItem[];
  createdAt: string;
};

const KIND_KEYWORDS: Array<[SchoolSurvivalKind, RegExp]> = [
  ["payment", /\b(pay|payment|cost|\$|fee|donation|invoice|account)\b/i],
  ["permission", /\b(permission|consent|slip|form|signed)\b/i],
  ["gear", /\b(gear|bring|wear|uniform|togs|shoes|lunch|water bottle|device)\b/i],
  ["sport", /\b(sport|rugby|netball|football|hockey|cross country|swimming|athletics)\b/i],
  ["music", /\b(music|choir|orchestra|band|concert|kapa haka)\b/i],
  ["deadline", /\b(due|deadline|by|closes|last day|return)\b/i],
  ["event", /\b(trip|camp|assembly|meeting|conference|open day|event|photos|disco)\b/i],
];

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const DATE_PATTERN =
  /\b(?:(mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/gi;

const ISO_PATTERN = /\b(20\d{2})-(\d{2})-(\d{2})\b/g;
const TIME_PATTERN = /\b([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)?\b/i;
const AMOUNT_PATTERN = /\$\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/;

function inferKind(text: string): SchoolSurvivalKind {
  for (const [kind, pattern] of KIND_KEYWORDS) {
    if (pattern.test(text)) return kind;
  }
  return "notice";
}

function titleFromParagraph(paragraph: string): string {
  const firstSentence = paragraph
    .replace(/\s+/g, " ")
    .split(/[.!?]\s/)[0]
    ?.trim();
  if (!firstSentence) return "School notice";
  return firstSentence.length > 88 ? `${firstSentence.slice(0, 85).trim()}...` : firstSentence;
}

function isoDate(day: number, month: number, year?: number): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  let resolvedYear = year ?? currentYear;
  const candidate = new Date(resolvedYear, month, day);
  if (!year && candidate.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 31) {
    resolvedYear += 1;
  }
  return `${resolvedYear}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normaliseTime(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(TIME_PATTERN);
  if (!match) return undefined;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (!meridiem && hour < 6) return undefined;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function cleanNewsletterText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function fallbackExtract(text: string): SchoolSurvivalItem[] {
  const clean = cleanNewsletterText(text);
  if (!clean) return [];
  const paragraphs = clean
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z0-9$])/)
    .map((p) => p.trim())
    .filter(Boolean);
  const items: SchoolSurvivalItem[] = [];

  for (const paragraph of paragraphs) {
    const dates = [...paragraph.matchAll(DATE_PATTERN)];
    const isoDates = [...paragraph.matchAll(ISO_PATTERN)];
    const dateValues = [
      ...dates.map((match) => {
        const month = MONTHS[match[3].toLowerCase()];
        if (typeof month !== "number") return null;
        return isoDate(Number(match[2]), month, match[4] ? Number(match[4]) : undefined);
      }),
      ...isoDates.map((match) => `${match[1]}-${match[2]}-${match[3]}`),
    ].filter((date): date is string => Boolean(date));

    for (const date of [...new Set(dateValues)]) {
      const amountMatch = paragraph.match(AMOUNT_PATTERN);
      const yearMatch = paragraph.match(/\b(year\s?[0-9]{1,2}|yr\s?[0-9]{1,2}|new entrants|juniors|seniors)\b/i);
      items.push({
        kind: inferKind(paragraph),
        title: titleFromParagraph(paragraph),
        date,
        time: normaliseTime(paragraph),
        amount: amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : undefined,
        item: /\bbring\b/i.test(paragraph) ? paragraph.replace(/\s+/g, " ").slice(0, 120) : undefined,
        child_year_level: yearMatch?.[0],
        source_paragraph: paragraph.slice(0, 700),
      });
    }
  }

  return items
    .sort((a, b) => `${a.date} ${a.time ?? ""}`.localeCompare(`${b.date} ${b.time ?? ""}`))
    .slice(0, 80);
}

function parseAnthropicJson(text: string): SchoolSurvivalItem[] {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const parsed = JSON.parse(cleaned) as { items?: SchoolSurvivalItem[] };
  return Array.isArray(parsed.items) ? parsed.items : [];
}

async function callClaudeForText(newsletterText: string): Promise<SchoolSurvivalItem[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackExtract(newsletterText);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3500,
      temperature: 0,
      system:
        "You extract school newsletter logistics for NZ parents. Return only JSON. Use ISO 8601 dates. Use 24-hour NZ local time. Never invent a date.",
      messages: [
        {
          role: "user",
          content: `Given this school newsletter text, extract every date, deadline, payment request, gear or permission slip needed, sport notice, music notice, and extracurricular notice.

Schema: {"items":[{"kind":"event|deadline|payment|gear|permission|sport|music|notice","title":"string","date":"YYYY-MM-DD","time":"HH:mm optional","amount":123 optional,"item":"string optional","child_year_level":"string optional","source_paragraph":"string"}]}

Newsletter:
${newsletterText.slice(0, 18000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("toro school survival anthropic error", response.status, await response.text());
    return fallbackExtract(newsletterText);
  }
  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text ?? "";
  try {
    return parseAnthropicJson(text);
  } catch (error) {
    console.error("toro school survival parse error", error);
    return fallbackExtract(newsletterText);
  }
}

async function callClaudeForImage(file: File): Promise<SchoolSurvivalItem[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];
  const buffer = Buffer.from(await file.arrayBuffer());
  const mediaType = file.type || "image/jpeg";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3500,
      temperature: 0,
      system:
        "You extract school newsletter logistics from images for NZ parents. Return only JSON. Use ISO 8601 dates and 24-hour NZ local time.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: buffer.toString("base64"),
              },
            },
            {
              type: "text",
              text: 'Extract newsletter logistics. Schema: {"items":[{"kind":"event|deadline|payment|gear|permission|sport|music|notice","title":"string","date":"YYYY-MM-DD","time":"HH:mm optional","amount":123 optional,"item":"string optional","child_year_level":"string optional","source_paragraph":"string"}]}',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("toro school survival image anthropic error", response.status, await response.text());
    return [];
  }
  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  try {
    return parseAnthropicJson(data.content?.[0]?.text ?? "");
  } catch {
    return [];
  }
}

async function extractPdfText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const raw = buffer.toString("latin1");
  const chunks = [...raw.matchAll(/\(([^()]{4,220})\)\s*Tj/g)].map((match) => match[1]);
  const arrayChunks = [...raw.matchAll(/\[((?:.|\n){4,800}?)\]\s*TJ/g)].flatMap((match) =>
    [...match[1].matchAll(/\(([^()]{2,220})\)/g)].map((part) => part[1]),
  );
  return [...chunks, ...arrayChunks]
    .join(" ")
    .replace(/\\([()\\])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export async function parseSchoolNewsletter({
  newsletterText,
  file,
}: {
  newsletterText?: string;
  file?: File | null;
}): Promise<{ items: SchoolSurvivalItem[]; sourceType: SchoolSurvivalResult["sourceType"]; sourceText: string }> {
  const text = cleanNewsletterText(newsletterText ?? "");
  if (text.length > 20) {
    return { items: await callClaudeForText(text), sourceType: "paste", sourceText: text };
  }

  if (file && file.size > 0) {
    if (file.type.startsWith("image/")) {
      return { items: await callClaudeForImage(file), sourceType: "image", sourceText: file.name };
    }
    const pdfText = await extractPdfText(file);
    if (pdfText.length > 20) {
      return { items: await callClaudeForText(pdfText), sourceType: "pdf", sourceText: pdfText };
    }
  }

  return { items: [], sourceType: file?.type.startsWith("image/") ? "image" : "paste", sourceText: text };
}
