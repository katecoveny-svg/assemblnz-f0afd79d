import "server-only";
import { createHash } from "node:crypto";
import type { PersonalDoProfile } from "../personal/profile";

// Review fingerprint binds even the default voice to the authenticated owner.
// It is not a credential; POST still authenticates and validates all configuration.
export function voiceRevision(ownerId: string, profile: PersonalDoProfile) {
  return createHash("sha256").update(JSON.stringify([ownerId, profile.updatedAt, profile.voiceName])).digest("hex");
}

