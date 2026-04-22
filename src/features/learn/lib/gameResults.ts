// ═══════════════════════════════════════════════════════════════
// Shared helper for saving learning game results to the backend.
// Works for both Tōro Homework Help and Assembl Learn — Free the Letter.
// Supports anonymous saves via a stable per-device id stored in localStorage.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

const DEVICE_ID_KEY = "assembl.learn.device_id";

/** Get or create a stable per-device id (used for anonymous saves). */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export type GameSource = "toro_homework" | "assembl_learn";

export interface QuestionOutcome {
  index: number;
  prompt: string;
  expected: string;
  given: string | null;
  correct: boolean;
  kind?: string;
}

export interface SaveGameResultInput {
  gameSource: GameSource;
  childName?: string | null;
  subject?: string | null;
  yearLevel?: string | null;
  nzcLevel?: string | null;
  topic?: string | null;
  score: number;
  totalQuestions: number;
  durationSeconds?: number | null;
  questionOutcomes: QuestionOutcome[];
  metadata?: Record<string, unknown>;
}

export interface SavedGameResult {
  id: string;
  saved: boolean;
  anonymous: boolean;
  error?: string;
}

export async function saveGameResult(input: SaveGameResultInput): Promise<SavedGameResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id ?? null;
  const deviceId = userId ? null : getDeviceId();

  const row = {
    user_id: userId,
    device_id: deviceId,
    game_source: input.gameSource,
    child_name: input.childName ?? null,
    subject: input.subject ?? null,
    year_level: input.yearLevel ?? null,
    nzc_level: input.nzcLevel ?? null,
    topic: input.topic ?? null,
    score: input.score,
    total_questions: input.totalQuestions,
    duration_seconds: input.durationSeconds ?? null,
    question_outcomes: input.questionOutcomes,
    metadata: input.metadata ?? {},
  };

  const { data, error } = await supabase
    .from("learning_game_results")
    .insert(row as never)
    .select("id")
    .single();

  if (error) {
    return { id: "", saved: false, anonymous: !userId, error: error.message };
  }
  return { id: data.id, saved: true, anonymous: !userId };
}

export interface LearningGameResultRow {
  id: string;
  game_source: GameSource;
  child_name: string | null;
  subject: string | null;
  year_level: string | null;
  nzc_level: string | null;
  topic: string | null;
  score: number;
  total_questions: number;
  accuracy: number;
  duration_seconds: number | null;
  question_outcomes: QuestionOutcome[];
  metadata: Record<string, unknown>;
  created_at: string;
}

/** Fetch the parent's recent game results (signed-in or anonymous via device id). */
export async function fetchRecentGameResults(limit = 25): Promise<LearningGameResultRow[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id ?? null;

  let query = supabase
    .from("learning_game_results")
    .select(
      "id,game_source,child_name,subject,year_level,nzc_level,topic,score,total_questions,accuracy,duration_seconds,question_outcomes,metadata,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    // Anonymous read requires the device id to be matched via the SELECT policy.
    // Our policy reads `current_setting('request.device_id')`, which Supabase REST
    // doesn't set automatically, so for anonymous mode we fall back to filtering
    // client-side by device_id and rely on the policy to allow inserts only.
    // To still surface the user's own anonymous history we filter and accept that
    // SELECT may return [] until a session exists. Ideally users sign in for history.
    query = query.eq("device_id", getDeviceId());
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as LearningGameResultRow[];
}
