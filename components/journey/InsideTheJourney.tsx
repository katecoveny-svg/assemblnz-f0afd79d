import type { CustomerJourney, JourneyRun } from '@/lib/journey/types';
import type { JourneyGenomeContext } from '@/lib/journey/genome-context';
import { JOURNEY_AGENT_ROLES } from '@/lib/journey/agents';
import { getAgentContract } from '@/lib/journey/contracts';
import { CAPABILITY_REGISTRY, resolveCapabilityStatus } from '@/lib/journey/capabilities';
import { StatusChip } from './StatusChip';
import styles from './journey.module.css';

const VERIFY_TONE: Record<string, string> = {
  passed: styles.chipPositive,
  review_required: styles.chipCaution,
  failed: styles.chipNeutral,
};

/**
 * "Inside the journey" — the assembl differentiator. Reveals how the agents,
 * Genome context, tools, permissions, actions and evidence fit together for the
 * current run. The customer view never needs this; the internal view exposes it.
 */
export function InsideTheJourney({
  run,
  journey,
  genome,
}: {
  run: JourneyRun;
  journey: CustomerJourney;
  genome: JourneyGenomeContext | null;
}) {
  const stage = journey.stages.find((s) => s.id === run.currentStageId);
  const activeRoles = (stage?.agentRoles ?? []).map((id) => JOURNEY_AGENT_ROLES[id]).filter(Boolean);
  const recent = [...run.timeline].slice(-10).reverse();
  const openActions = run.proposedActions.filter((a) => a.status === 'proposed');

  return (
    <div className={styles.inside}>
      <div className={styles.insideCard}>
        <p className={styles.insideTitle}>Current stage</p>
        <p style={{ margin: 0, fontWeight: 600 }}>
          {stage?.name ?? run.currentStageId}{' '}
          <span className={styles.lineQty}>· {stage?.type}</span>
        </p>
        {stage && (
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--a-text-dim)' }}>
            Customer goal: {stage.customerGoal} · Authority: <strong>{stage.authorityLevel}</strong>
          </p>
        )}
      </div>

      <div className={styles.insideCard}>
        <p className={styles.insideTitle}>Active agent roles</p>
        {activeRoles.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--a-text-dim)' }}>No agent runs at this stage.</p>
        ) : (
          <div className={styles.agentGrid}>
            {activeRoles.map((role) => {
              const contract = getAgentContract(role.id);
              return (
                <div key={role.id} className={styles.agent}>
                  <p className={styles.agentName}>
                    {role.name}
                    {contract && <span className={styles.lineQty}> · contract v{contract.version}</span>}
                  </p>
                  <p className={styles.agentRole}>{role.purpose}</p>
                  <StatusChip status="sandbox" title={`Authority: ${role.authority}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.insideCard}>
        <p className={styles.insideTitle}>Selected Genome context (this stage only)</p>
        {genome && genome.facts.length > 0 ? (
          <ul className={styles.list} style={{ paddingLeft: '1rem' }}>
            {genome.facts.map((f) => (
              <li key={f.id}>
                <strong>{f.label}:</strong> {f.value}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--a-text-dim)' }}>
            No genome facts needed for this stage — context selection keeps calls lean.
          </p>
        )}
      </div>

      {openActions.length > 0 && (
        <div className={styles.insideCard}>
          <p className={styles.insideTitle}>Proposed tool actions & authority</p>
          {openActions.map((a) => (
            <p key={a.id} style={{ margin: '0 0 0.4rem', fontSize: '0.88rem' }}>
              <StatusChip status={a.execution} /> <strong>{a.type}</strong> — needs{' '}
              <em>{a.authorityRequired}</em> ({a.riskLevel} risk)
            </p>
          ))}
        </div>
      )}

      <div className={styles.insideCard}>
        <p className={styles.insideTitle}>Evidence ({run.evidence.length})</p>
        {run.evidence.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--a-text-dim)' }}>No evidence recorded yet.</p>
        ) : (
          <ul className={styles.list} style={{ paddingLeft: '1rem' }}>
            {run.evidence.slice(-8).map((e) => (
              <li key={e.id}>
                <strong>{e.label}:</strong> {e.detail}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.insideCard}>
        <p className={styles.insideTitle}>Agent verification ({run.verifications.length})</p>
        {run.verifications.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--a-text-dim)' }}>No agent invocations verified yet.</p>
        ) : (
          run.verifications.map((v) => (
            <p key={v.invocationId} style={{ margin: '0 0 0.4rem', fontSize: '0.85rem' }}>
              <span className={`${styles.chip} ${VERIFY_TONE[v.status] ?? styles.chipNeutral}`}>
                <span className={styles.chipDot} aria-hidden />
                {v.status.replace('_', ' ')}
              </span>{' '}
              <strong>{v.agentId}</strong> v{v.agentVersion} —{' '}
              {v.checks.filter((c) => c.passed).length}/{v.checks.length} checks
              {v.errors.length > 0 && <span style={{ color: '#a24b3c' }}> · {v.errors.join('; ')}</span>}
            </p>
          ))
        )}
      </div>

      <div className={styles.insideCard}>
        <p className={styles.insideTitle}>Capability status</p>
        <div className={styles.agentGrid}>
          {CAPABILITY_REGISTRY.slice(0, 8).map((c) => (
            <div key={c.id} className={styles.agent}>
              <p className={styles.agentName} style={{ fontSize: '0.82rem' }}>{c.name}</p>
              <div style={{ margin: '0.3rem 0' }}>
                <StatusChip status={resolveCapabilityStatus(c.id)} title={c.disclosure} />
              </div>
              <p className={styles.agentRole} style={{ fontSize: '0.72rem' }}>{c.disclosure}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insideCard}>
        <p className={styles.insideTitle}>Timeline</p>
        <div className={styles.timeline}>
          {recent.map((e) => (
            <div key={e.id} className={styles.event}>
              <span className={styles.eventType}>{e.type.replace(/_/g, ' ')}</span>
              <span>{e.summary}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
