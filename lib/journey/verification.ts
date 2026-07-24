/**
 * assembl — agent verification
 * ----------------------------
 * Runs after every agent invocation: validate input, validate output, run the
 * contract's success checks, and produce a concise, evidence-bearing result.
 * A failed critical check (or invalid schema) means downstream actions must be
 * blocked (brief §5). No private model reasoning is recorded — only operational
 * evidence.
 */

import { getAgentContract, schemaFor, type AgentContract } from './contracts';

export type AgentVerificationCheck = {
  id: string;
  name: string;
  passed: boolean;
  evidence?: string;
};

export type AgentVerificationResult = {
  invocationId: string;
  agentId: string;
  agentVersion: string;
  status: 'passed' | 'failed' | 'review_required';
  checks: AgentVerificationCheck[];
  errors: string[];
  verifiedAt: string;
};

export type VerifyInput = {
  invocationId: string;
  agentId: string;
  input: unknown;
  output: unknown;
  now?: string;
};

/** Verify one agent invocation against its contract. Pure + deterministic. */
export function verifyAgentInvocation(v: VerifyInput): AgentVerificationResult {
  const contract = getAgentContract(v.agentId);
  const verifiedAt = v.now ?? new Date().toISOString();
  if (!contract) {
    return {
      invocationId: v.invocationId,
      agentId: v.agentId,
      agentVersion: 'unknown',
      status: 'failed',
      checks: [],
      errors: [`No contract registered for agent "${v.agentId}".`],
      verifiedAt,
    };
  }

  const errors: string[] = [];

  // 1–2. Schema validation of input and output.
  const inSchema = schemaFor(contract.inputSchemaId);
  const outSchema = schemaFor(contract.outputSchemaId);
  const inputOk = inSchema ? inSchema.safeParse(v.input).success : true;
  const outputOk = outSchema ? outSchema.safeParse(v.output).success : true;
  if (!inputOk) errors.push(`Input failed schema "${contract.inputSchemaId}".`);
  if (!outputOk) errors.push(`Output failed schema "${contract.outputSchemaId}".`);

  // 3. Success checks (only meaningful once schemas hold).
  const checks: AgentVerificationCheck[] = [];
  let criticalFail = !inputOk || !outputOk;
  let nonCriticalFail = false;

  if (inputOk && outputOk) {
    for (const c of contract.successChecks) {
      let passed = false;
      let evidence: string | undefined;
      try {
        const r = c.run(v.input, v.output);
        passed = r.passed;
        evidence = r.evidence;
      } catch (e) {
        passed = false;
        evidence = e instanceof Error ? e.message : 'check threw';
      }
      checks.push({ id: c.id, name: c.name, passed, evidence });
      if (!passed) {
        if (c.critical) criticalFail = true;
        else nonCriticalFail = true;
      }
    }
  }

  const status: AgentVerificationResult['status'] = criticalFail
    ? 'failed'
    : nonCriticalFail
      ? 'review_required'
      : 'passed';

  return {
    invocationId: v.invocationId,
    agentId: v.agentId,
    agentVersion: contract.version,
    status,
    checks,
    errors,
    verifiedAt,
  };
}

/** True when verification permits downstream actions to proceed. */
export function verificationAllowsProgress(r: AgentVerificationResult): boolean {
  return r.status !== 'failed';
}

export function contractSummary(contract: AgentContract): string {
  return `${contract.name} v${contract.version} · ${contract.authorityLevel} · ${contract.successChecks.length} check(s)`;
}
