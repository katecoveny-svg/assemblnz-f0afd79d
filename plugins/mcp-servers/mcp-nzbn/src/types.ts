import { z } from "zod";

export const NZBN_REGEX = /^\d{13}$/;

export const VerifyNzbnInputSchema = z.object({
  nzbn: z
    .string()
    .regex(NZBN_REGEX, "NZBN must be exactly 13 digits"),
});

export type VerifyNzbnInput = z.infer<typeof VerifyNzbnInputSchema>;

export const LookupEntityInputSchema = z.object({
  nzbn: z
    .string()
    .regex(NZBN_REGEX, "NZBN must be exactly 13 digits"),
});

export type LookupEntityInput = z.infer<typeof LookupEntityInputSchema>;

export interface NzbnEntity {
  nzbn: string;
  entityName?: string;
  entityTypeCode?: string;
  entityTypeDescription?: string;
  entityStatusCode?: string;
  entityStatusDescription?: string;
  registrationDate?: string;
  sourceRegister?: string;
  sourceRegisterUniqueIdentifier?: string;
  industryClassifications?: unknown;
  addresses?: unknown;
  roles?: unknown;
  [k: string]: unknown;
}

export const NZBN_SOURCE_CITATION =
  "NZBN public register, https://www.nzbn.govt.nz/";
