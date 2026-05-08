import {
  CompaniesOfficeClient,
  CompaniesOfficeApiNotConfiguredError,
  CompaniesOfficeApiKeyRequiredError,
} from "./companies-office-client.js";
import {
  COMPANIES_OFFICE_SOURCE_CITATION,
  LookupCompanyInputSchema,
  type CompanyRecord,
  type LookupCompanyInput,
} from "./types.js";

export const lookupCompanyToolDefinition = {
  name: "lookup_company",
  description:
    "Look up a NZ company by company number or name. Returns the company entity record from the public Companies Office register. Source: " +
    COMPANIES_OFFICE_SOURCE_CITATION,
  inputSchema: {
    type: "object" as const,
    properties: {
      identifier: {
        type: "string",
        description:
          "NZ company number (digits only, e.g. '123456') or company name (e.g. 'Aironaut Customs').",
      },
    },
    required: ["identifier"],
    additionalProperties: false,
  },
};

export async function runLookupCompany(
  rawInput: unknown,
  client: CompaniesOfficeClient,
): Promise<{
  found: boolean;
  identifier: string;
  company?: CompanyRecord;
  source: string;
  error?: string;
}> {
  const input: LookupCompanyInput = LookupCompanyInputSchema.parse(rawInput);

  try {
    const company = await client.lookupCompany(input.identifier);
    if (company === null) {
      return {
        found: false,
        identifier: input.identifier,
        source: COMPANIES_OFFICE_SOURCE_CITATION,
      };
    }
    return {
      found: true,
      identifier: input.identifier,
      company,
      source: COMPANIES_OFFICE_SOURCE_CITATION,
    };
  } catch (err) {
    if (
      err instanceof CompaniesOfficeApiNotConfiguredError ||
      err instanceof CompaniesOfficeApiKeyRequiredError
    ) {
      return {
        found: false,
        identifier: input.identifier,
        source: COMPANIES_OFFICE_SOURCE_CITATION,
        error: err.message,
      };
    }
    throw err;
  }
}
