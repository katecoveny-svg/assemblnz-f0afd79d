// ═══════════════════════════════════════════════════════════════
// Tolerant answer comparison for fill-in and true/false questions.
// Allows for minor differences in case, whitespace, punctuation,
// quote style, number words ↔ digits, and common plural/tense
// variations — without making the match so loose that wrong
// answers slip through. True/false matching stays strict.
// ═══════════════════════════════════════════════════════════════

const TRUE_TOKENS = new Set(["true", "t", "yes", "y", "correct", "right", "1"]);
const FALSE_TOKENS = new Set(["false", "f", "no", "n", "incorrect", "wrong", "0"]);

// Number-word ↔ digit map (0–20, plus tens up to 100, plus hundred/thousand multipliers)
const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const NUMBER_SCALES: Record<string, number> = { hundred: 100, thousand: 1000 };

/** Normalize a string for tolerant comparison. */
export function normalizeAnswer(input: string): string {
  if (input == null) return "";
  return (
    input
      .toString()
      .toLowerCase()
      // unify smart quotes & dashes
      .replace(/[\u2018\u2019\u02BC\u2032]/g, "'")
      .replace(/[\u201C\u201D\u2033]/g, '"')
      .replace(/[\u2013\u2014\u2212]/g, "-")
      // strip surrounding/extra punctuation often added by kids
      .replace(/[.,;:!?"'`()\[\]{}]/g, " ")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Try to coerce a string to a number for numeric equivalence. */
function asNumber(s: string): number | null {
  const cleaned = s.replace(/\s/g, "").replace(/^\+/, "");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Convert an English number-word phrase to a number, e.g.
 *   "twenty one"  → 21
 *   "two hundred" → 200
 *   "one thousand two hundred thirty four" → 1234
 * Returns null when the phrase contains any non-number tokens.
 */
function wordsToNumber(phrase: string): number | null {
  const tokens = phrase.replace(/-/g, " ").split(/\s+/).filter((t) => t && t !== "and");
  if (tokens.length === 0) return null;
  let total = 0;
  let current = 0;
  for (const tok of tokens) {
    if (tok in NUMBER_WORDS) {
      current += NUMBER_WORDS[tok];
    } else if (tok in NUMBER_SCALES) {
      const scale = NUMBER_SCALES[tok];
      current = (current || 1) * scale;
      if (scale >= 1000) {
        total += current;
        current = 0;
      }
    } else {
      return null; // unknown token → not a pure number phrase
    }
  }
  return total + current;
}

/** True/False normalization to canonical "true" | "false" | original token. */
function normalizeTruthy(s: string): string {
  const n = normalizeAnswer(s);
  if (TRUE_TOKENS.has(n)) return "true";
  if (FALSE_TOKENS.has(n)) return "false";
  return n;
}

/**
 * Lightweight English stemmer — only strips common inflections so that
 * "cats" matches "cat", "running" matches "run", "studied" matches "study".
 * Conservative on short words (≤3 chars) to avoid false positives like "is".
 */
function stem(word: string): string {
  if (word.length <= 3) return word;
  // -ies → -y  (studies → study, parties → party)
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  // -ied → -y  (studied → study)
  if (word.endsWith("ied") && word.length > 4) return word.slice(0, -3) + "y";
  // -es → drop  (boxes → box, washes → wash) — but keep -es on short stems
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -2);
  // -s → drop  (cats → cat) — skip "ss" endings (glass, pass)
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  // -ing → drop  (running → runn → run handled by double-letter trim below)
  if (word.endsWith("ing") && word.length > 5) {
    const root = word.slice(0, -3);
    // Collapse doubled trailing consonant: "runn" → "run"
    if (root.length >= 2 && root[root.length - 1] === root[root.length - 2]) {
      return root.slice(0, -1);
    }
    return root;
  }
  // -ed → drop  (walked → walk)
  if (word.endsWith("ed") && word.length > 4) {
    const root = word.slice(0, -2);
    if (root.length >= 2 && root[root.length - 1] === root[root.length - 2]) {
      return root.slice(0, -1);
    }
    return root;
  }
  return word;
}

/** Token-level normalization: split, drop fillers, stem each word. */
function tokensStemmed(s: string): string[] {
  const stripped = s.replace(/^(the|a|an)\s+/, "").trim();
  if (!stripped) return [];
  return stripped.split(/\s+/).map(stem);
}

export type AnswerKind = "multiple_choice" | "fill_blank" | "true_false";

/** Compare a user answer to the expected answer with tolerant rules. */
export function isAnswerCorrect(given: string, expected: string, kind: AnswerKind): boolean {
  if (given == null || expected == null) return false;

  // True/false stays STRICT — only canonical truthy/falsy synonyms map.
  if (kind === "true_false") {
    const g = normalizeTruthy(given);
    const e = normalizeTruthy(expected);
    return (g === "true" || g === "false") && g === e;
  }

  const a = normalizeAnswer(given);
  const b = normalizeAnswer(expected);
  if (!a || !b) return false;
  if (a === b) return true;

  // Numeric equivalence: "12", "12.0", " 12 " all match.
  const an = asNumber(a);
  const bn = asNumber(b);
  if (an !== null && bn !== null && an === bn) return true;

  // Number-word ↔ digit equivalence: "two" matches "2", "twenty one" matches "21".
  const aWordNum = an === null ? wordsToNumber(a) : an;
  const bWordNum = bn === null ? wordsToNumber(b) : bn;
  if (aWordNum !== null && bWordNum !== null && aWordNum === bWordNum) return true;

  // Allow trailing units / articles to be ignored on either side.
  const stripFiller = (s: string) => s.replace(/^(the|a|an)\s+/, "").trim();
  if (stripFiller(a) === stripFiller(b)) return true;

  // Plural / tense tolerance: stem each token and compare.
  const aStems = tokensStemmed(a).join(" ");
  const bStems = tokensStemmed(b).join(" ");
  if (aStems && bStems && aStems === bStems) return true;

  return false;
}
