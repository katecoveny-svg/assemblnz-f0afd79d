import { NzbnClient, NzbnApiNotConfiguredError } from "./nzbn-client.js";
import {
  LookupEntityInputSchema,
  NZBN_SOURCE_CITATION,
  type LookupEntityInput,
  type NzbnEntity,
} from "./types.js";

export const lookupEntityToolDefinition = {
  name: "lookup_entity",
  description:
    "Full NZBN entity record from the public register. Returns the entity name, NZBN, business industry classifications, addresses, registration date, source register, and any disclosed director/shareholder info. Source: " +
    NZBN_SOURCE_CITATION,
  inputSchema: {
    type: "object" as const,
    properties: {
      nzbn: {
        type: "string",
        description: "13-digit NZ Business Number.",
        pattern: "^\\d{13}$",
      },
    },
    required: ["nzbn"],
    additionalProperties: false,
  },
};

export async function runLookupEntity(
  rawInput: unknown,
  client: NzbnClient,
): Promise<{
  found: boolean;
  nzbn: string;
  entity?: NzbnEntity;
  source: string;
  error?: string;
}> {
  const input: LookupEntityInput = LookupEntityInputSchema.parse(rawInput);

  try {
    const entity = await client.getEntity(input.nzbn);
    if (entity === null) {
      return {
        found: false,
        nzbn: input.nzbn,
        source: NZBN_SOURCE_CITATION,
      };
    }
    return {
      found: true,
      nzbn: entity.nzbn ?? input.nzbn,
      entity,
      source: NZBN_SOURCE_CITATION,
    };
  } catch (err) {
    if (err instanceof NzbnApiNotConfiguredError) {
      return {
        found: false,
        nzbn: input.nzbn,
        source: NZBN_SOURCE_CITATION,
        error: err.message,
      };
    }
    throw err;
  }
}
