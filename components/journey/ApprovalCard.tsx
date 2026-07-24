'use client';

import type { ProposedAction } from '@/lib/journey/types';
import { StatusChip } from './StatusChip';
import styles from './journey.module.css';

/**
 * Reusable approval component for a `ProposedAction`. Shows what will happen,
 * why, the affected data, the honest execution status and whether it is real or
 * simulated — with edit/approve/reject controls. Reused across every journey.
 */
export function ApprovalCard({
  action,
  onApprove,
  onReject,
  onEdit,
}: {
  action: ProposedAction;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
}) {
  const resolved = action.status !== 'proposed';
  const delta = (action.payload?.estimatedDeltaNzd as number | undefined) ?? undefined;

  return (
    <div className={styles.approval}>
      <div className={styles.approvalHead}>
        <p className={styles.approvalTitle}>{action.title}</p>
        <StatusChip status={action.execution} />
      </div>

      <div className={styles.approvalGrid}>
        <div className={styles.approvalRow}>
          <span className={styles.approvalKey}>What happens</span>
          <span className={styles.approvalVal}>{action.description}</span>
        </div>
        <div className={styles.approvalRow}>
          <span className={styles.approvalKey}>Why</span>
          <span className={styles.approvalVal}>{action.reason}</span>
        </div>
        {typeof delta === 'number' && (
          <div className={styles.approvalRow}>
            <span className={styles.approvalKey}>Effect</span>
            <span className={styles.approvalVal}>
              {delta === 0 ? 'No change to the total' : `${delta > 0 ? '+' : '−'}$${Math.abs(delta).toFixed(2)} on the basket total`}
            </span>
          </div>
        )}
        <div className={styles.approvalRow}>
          <span className={styles.approvalKey}>Authority</span>
          <span className={styles.approvalVal}>
            Requires your approval · {action.riskLevel} risk · {action.evidenceIds.length} piece(s) of evidence
          </span>
        </div>
      </div>

      {resolved ? (
        <p className={styles.approvalResolved}>
          {action.status === 'rejected'
            ? 'You rejected this — nothing was prepared.'
            : action.status === 'completed'
              ? 'Approved and prepared (simulated). No order was placed.'
              : `Status: ${action.status}.`}
        </p>
      ) : (
        <div className={styles.actionsRow}>
          <button className={styles.primary} type="button" onClick={() => onApprove?.(action.id)}>
            Approve
          </button>
          <button className={styles.ghost} type="button" onClick={() => onReject?.(action.id)}>
            Reject
          </button>
          {onEdit && (
            <button className={styles.ghost} type="button" onClick={() => onEdit(action.id)}>
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
