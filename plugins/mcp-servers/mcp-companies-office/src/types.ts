import { z } from "zod";

export const LookupCompanyInputSchema = z.object({
  identifier: z
    .string()
    .min(1, "identifier must be a non-empty company number or company name"),
});

export type LookupCompanyInput = z.infer<typeof LookupCompanyInputSchema>;

export const LookupDirectorInputSchema = z.object({
  name: z.string().min(1, "name must be a non-empty director name"),
});

export type LookupDirectorInput = z.infer<typeof LookupDirectorInputSchema>;

export interface CompanyRecord {
  companyNumber?: string;
  companyName?: string;
  status?: string;
  registrationDate?: string;
  entityType?: string;
  addresses?: unknown;
  directors?: unknown;
  shareholders?: unknown;
  [k: string]: unknown;
}

export interface DirectorshipRecord {
  companyNumber?: string;
  companyName?: string;
  appointmentDate?: string;
  status?: string;
  [k: string]: unknown;
}

export const COMPANIES_OFFICE_SOURCE_CITATION =
  "Companies Office public register, https://www.business.govt.nz/services/business-data";
