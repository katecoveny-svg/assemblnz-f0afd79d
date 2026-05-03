/**
 * Free the Letter — seeded equation bank.
 * Each mission teaches the 3-step method:
 *   1. What is happening to the letter?
 *   2. Do the opposite
 *   3. Do it to both sides
 */

export type Operation = "add" | "subtract" | "multiply" | "divide";

export type Equation = {
  id: string;
  letter: string;
  /** human-readable equation, e.g. "x + 7 = 12" */
  display: string;
  /** numeric answer for the letter */
  answer: number;
  operation: Operation;
  level: "Signals" | "Unlock" | "Upgrade";
  topic: "Addition" | "Subtraction" | "Multiplication" | "Division";
  askFirst: string;
  thenThis: string;
  hint: string;
};

export const EQUATIONS: Equation[] = [
  // ── Signals — Addition ──────────────────────────────────────────────
  {
    id: "sig-add-1",
    letter: "x",
    display: "x + 7 = 12",
    answer: 5,
    operation: "add",
    level: "Signals",
    topic: "Addition",
    askFirst: "What is happening to the letter x?",
    thenThis: "It is having 7 added. Do the opposite — subtract 7 from both sides.",
    hint: "12 − 7 = ?",
  },
  {
    id: "sig-add-2",
    letter: "a",
    display: "a + 9 = 15",
    answer: 6,
    operation: "add",
    level: "Signals",
    topic: "Addition",
    askFirst: "What is happening to a?",
    thenThis: "9 is being added. Subtract 9 from both sides to free the letter.",
    hint: "15 − 9 = ?",
  },
  {
    id: "sig-add-3",
    letter: "n",
    display: "n + 4 = 11",
    answer: 7,
    operation: "add",
    level: "Signals",
    topic: "Addition",
    askFirst: "What is being done to n?",
    thenThis: "4 is added. The opposite of adding 4 is subtracting 4. Do it to both sides.",
    hint: "11 − 4 = ?",
  },

  // ── Signals — Subtraction ───────────────────────────────────────────
  {
    id: "sig-sub-1",
    letter: "y",
    display: "y − 3 = 8",
    answer: 11,
    operation: "subtract",
    level: "Signals",
    topic: "Subtraction",
    askFirst: "What is happening to y?",
    thenThis: "3 is being subtracted. Do the opposite — add 3 to both sides.",
    hint: "8 + 3 = ?",
  },
  {
    id: "sig-sub-2",
    letter: "k",
    display: "k − 5 = 9",
    answer: 14,
    operation: "subtract",
    level: "Signals",
    topic: "Subtraction",
    askFirst: "What is being done to k?",
    thenThis: "5 is being taken away. Add 5 to both sides to free the letter.",
    hint: "9 + 5 = ?",
  },

  // ── Unlock — Multiplication ─────────────────────────────────────────
  {
    id: "unl-mul-1",
    letter: "m",
    display: "4m = 20",
    answer: 5,
    operation: "multiply",
    level: "Unlock",
    topic: "Multiplication",
    askFirst: "What is happening to m?",
    thenThis: "m is being multiplied by 4. The opposite is dividing by 4 — do it to both sides.",
    hint: "20 ÷ 4 = ?",
  },
  {
    id: "unl-mul-2",
    letter: "p",
    display: "6p = 42",
    answer: 7,
    operation: "multiply",
    level: "Unlock",
    topic: "Multiplication",
    askFirst: "What is happening to p?",
    thenThis: "6 is multiplying p. Divide both sides by 6 to free the letter.",
    hint: "42 ÷ 6 = ?",
  },
  {
    id: "unl-mul-3",
    letter: "t",
    display: "3t = 27",
    answer: 9,
    operation: "multiply",
    level: "Unlock",
    topic: "Multiplication",
    askFirst: "What is happening to t?",
    thenThis: "t is being multiplied by 3. Do the opposite — divide both sides by 3.",
    hint: "27 ÷ 3 = ?",
  },

  // ── Unlock — Division ───────────────────────────────────────────────
  {
    id: "unl-div-1",
    letter: "z",
    display: "z ÷ 2 = 6",
    answer: 12,
    operation: "divide",
    level: "Unlock",
    topic: "Division",
    askFirst: "What is happening to z?",
    thenThis: "z is being divided by 2. The opposite is multiplying by 2 — do it to both sides.",
    hint: "6 × 2 = ?",
  },
  {
    id: "unl-div-2",
    letter: "b",
    display: "b ÷ 5 = 4",
    answer: 20,
    operation: "divide",
    level: "Unlock",
    topic: "Division",
    askFirst: "What is happening to b?",
    thenThis: "b is being shared into 5. Multiply both sides by 5 to free the letter.",
    hint: "4 × 5 = ?",
  },

  // ── Upgrade — Mixed ─────────────────────────────────────────────────
  {
    id: "upg-mix-1",
    letter: "x",
    display: "2x + 3 = 11",
    answer: 4,
    operation: "multiply",
    level: "Upgrade",
    topic: "Multiplication",
    askFirst: "Two things are happening to x — multiply by 2, then add 3.",
    thenThis: "Undo the +3 first (subtract 3 from both sides), then undo the ×2 (divide by 2).",
    hint: "(11 − 3) ÷ 2 = ?",
  },
  {
    id: "upg-mix-2",
    letter: "y",
    display: "3y − 4 = 14",
    answer: 6,
    operation: "multiply",
    level: "Upgrade",
    topic: "Multiplication",
    askFirst: "y is multiplied by 3, then 4 is subtracted.",
    thenThis: "First add 4 to both sides, then divide both sides by 3.",
    hint: "(14 + 4) ÷ 3 = ?",
  },
];

export const TOPICS = [
  { id: "addition", label: "Addition", level: "Signals", count: 3 },
  { id: "subtraction", label: "Subtraction", level: "Signals", count: 2 },
  { id: "multiplication", label: "Multiplication", level: "Unlock", count: 3 },
  { id: "division", label: "Division", level: "Unlock", count: 2 },
  { id: "mixed", label: "Two-step", level: "Upgrade", count: 2 },
] as const;
