import { NzbnClient, NzbnApiNotConfiguredError } from "./nzbn-client.js";
import {
  NZBN_SOURCE_CITATION,
  VerifyNzbnInputSchema,
  type VerifyNzbnInput,
} from "./types.js";

export const verifyNzbnToolDefinition = {
  name: "verify_nzbn",
  description:
    "Quick existence check against the NZ Business Number (NZBN) public register. Returns whether the NZBN exists and the entity's name, type, and status. Source: " +
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

export async function runVerifyNzbn(
  rawInput: unknown,
  client: NzbnClient,
): Promise<{
  exists: boolean;
  nzbn: string;
  entityName?: string;
  entityType?: string;
  entityStatus?: string;
  source: string;
  error?: string;
}> {
  const input: VerifyNzbnInput = VerifyNzbnInputSchema.parse(rawInput);

  try {
    const entity = await client.getEntity(input.nzbn);
    if (entity === null) {
      return {
        exists: false,
        nzbn: input.nzbn,
        source: NZBN_SOURCE_CITATION,
      };
    }
    return {
      exists: true,
      nzbn: entity.nzbn ?? input.nzbn,
      entityName: entity.entityName,
      entityType:
        entity.entityTypeDescription ?? entity.entityTypeCode,
      entityStatus:
        entity.entityStatusDescription ?? entity.entityStatusCode,
      source: NZBN_SOURCE_CITATION,
    };
  } catch (err) {
    if (err instanceof NzbnApiNotConfiguredError) {
      return {
        exists: false,
        nzbn: input.nzbn,
        source: NZBN_SOURCE_CITATION,
        error: err.message,
      };
    }
    throw err;
  }
}
