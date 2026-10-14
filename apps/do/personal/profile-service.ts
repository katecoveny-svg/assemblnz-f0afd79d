import "server-only";
import { getServiceClient } from "@/lib/supabase/service";
import {
  DEFAULT_PERSONAL_DO_PROFILE,
  personalDoProfileSaveSchema,
  personalDoProfileSchema,
  type PersonalDoProfile,
  type PersonalDoProfileSave,
  type PersonalDoProfileState,
} from "./profile";

const PROFILE_COLUMNS = "display_name,avatar,tone,response_length,initiative,preferences,voice_name,onboarding_completed,updated_at";
const storageError = () => new Error("Personal DO preferences are unavailable. Reload and check before trying again.");

function fromRow(row: Record<string, unknown>): PersonalDoProfile {
  const parsed = personalDoProfileSchema.safeParse({
    displayName: row.display_name,
    avatar: row.avatar,
    tone: row.tone,
    responseLength: row.response_length,
    initiative: row.initiative,
    preferences: row.preferences,
    voiceName: row.voice_name,
    onboardingCompleted: row.onboarding_completed,
    updatedAt: row.updated_at,
  });
  if (!parsed.success || !parsed.data.updatedAt) throw storageError();
  return parsed.data;
}

// Callers must first verify doOwner(), or use a trusted worker's claimed owner.
// The service-role client bypasses RLS: every read/write binds that owner here.
export async function getPersonalDoProfile(ownerId: string): Promise<PersonalDoProfileState> {
  if (!ownerId) throw storageError();
  try {
    const { data, error } = await getServiceClient()
      .from("do_personal_profiles")
      .select(PROFILE_COLUMNS)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (error) throw storageError();
    if (!data) return { profile: { ...DEFAULT_PERSONAL_DO_PROFILE }, saved: false };
    return { profile: fromRow(data), saved: true };
  } catch {
    throw storageError();
  }
}

export async function savePersonalDoProfile(ownerId: string, input: PersonalDoProfileSave): Promise<PersonalDoProfile> {
  if (!ownerId) throw storageError();
  // Validate again at the service boundary, including explicit storage/provider consent.
  const profile = personalDoProfileSaveSchema.parse(input);
  try {
    const timestamp = new Date().toISOString();
    const { data, error } = await getServiceClient()
      .from("do_personal_profiles")
      .upsert({
        owner_id: ownerId,
        display_name: profile.displayName,
        avatar: profile.avatar,
        tone: profile.tone,
        response_length: profile.responseLength,
        initiative: profile.initiative,
        preferences: profile.preferences,
        voice_name: profile.voiceName,
        onboarding_completed: profile.onboardingCompleted,
        consented_at: timestamp,
        consent_version: 1,
        updated_at: timestamp,
      }, { onConflict: "owner_id" })
      .select(PROFILE_COLUMNS)
      .single();
    if (error || !data) throw storageError();
    return fromRow(data);
  } catch {
    throw storageError();
  }
}

export async function deletePersonalDoProfile(ownerId: string): Promise<PersonalDoProfileState> {
  if (!ownerId) throw storageError();
  try {
    const { error } = await getServiceClient()
      .from("do_personal_profiles")
      .delete()
      .eq("owner_id", ownerId);
    if (error) throw storageError();
    return { profile: { ...DEFAULT_PERSONAL_DO_PROFILE }, saved: false };
  } catch {
    throw storageError();
  }
}
