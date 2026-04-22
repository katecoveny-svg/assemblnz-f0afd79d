// ═══════════════════════════════════════════════════════════════
// Tolerant answer comparison for fill-in and true/false questions.
// Allows for minor differences in case, whitespace, punctuation,
// quote style, and common true/false synonyms — without making the
// match so loose that wrong answers slip through.
// ═══════════════════════════════════════════════════════════════

const TRUE_TOKENS = new Set(["true", "t", "yes", "y", "correct", "right", "1"]);
const FALSE_TOKENS = new Set(["false", "f", "no", "n", "incorrect", "wrong", "0"]);

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

/** True/False normalization to canonical "true" | "false" | original token. */
function normalizeTruthy(s: string): string {
  const n = normalizeAnswer(s);
  if (TRUE_TOKENS.has(n)) return "true";
  if (FALSE_TOKENS.has(n)) return "false";
  return n;
}

export type AnswerKind = "multiple_choice" | "fill_blank" | "true_false";

/** Compare a user answer to the expected answer with tolerant rules. */
export function isAnswerCorrect(given: string, expected: string, kind: AnswerKind): boolean {
  if (given == null || expected == null) return false;

  if (kind === "true_false") {
    return normalizeTruthy(given) === normalizeTruthy(expected);
  }

  const a = normalizeAnswer(given);
  const b = normalizeAnswer(expected);
  if (!a || !b) return false;
  if (a === b) return true;

  // Numeric equivalence: "12", "12.0", " 12 " all match.
  const an = asNumber(a);
  const bn = asNumber(b);
  if (an !== null && bn !== null && an === bn) return true;

  // Allow trailing units / articles to be ignored on either side.
  const stripFiller = (s: string) => s.replace(/^(the|a|an)\s+/, "").trim();
  if (stripFiller(a) === stripFiller(b)) return true;

  return false;
}
