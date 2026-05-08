import {
  CompaniesOfficeClient,
  CompaniesOfficeApiNotConfiguredError,
  CompaniesOfficeApiKeyRequiredError,
} from "./companies-office-client.js";
import {
  COMPANIES_OFFICE_SOURCE_CITATION,
  LookupDirectorInputSchema,
  type DirectorshipRecord,
  type LookupDirectorInput,
} from "./types.js";

export const lookupDirectorToolDefinition = {
  name: "lookup_director",
  description:
    "List a director's directorships across all NZ companies, from the public Companies Office register. Source: " +
    COMPANIES_OFFICE_SOURCE_CITATION,
  inputSchema: {
    type: "object" as const,
    properties: {
      name: {
        type: "string",
        description: "Director's full name.",
      },
    },
    required: ["name"],
    additionalProperties: false,
  },
};

export async function runLookupDirector(
  rawInput: unknown,
  client: CompaniesOfficeClient,
): Promise<{
  found: boolean;
  name: string;
  directorships?: DirectorshipRecord[];
  source: string;
  error?: string;
}> {
  const input: LookupDirectorInput = LookupDirectorInputSchema.parse(rawInput);

  try {
    const directorships = await client.lookupDirector(input.name);
    return {
      found: directorships.length > 0,
      name: input.name,
      directorships,
      source: COMPANIES_OFFICE_SOURCE_CITATION,
    };
  } catch (err) {
    if (
      err instanceof CompaniesOfficeApiNotConfiguredError ||
      err instanceof CompaniesOfficeApiKeyRequiredError
    ) {
      return {
        found: false,
        name: input.name,
        source: COMPANIES_OFFICE_SOURCE_CITATION,
        error: err.message,
      };
    }
    throw err;
  }
}
