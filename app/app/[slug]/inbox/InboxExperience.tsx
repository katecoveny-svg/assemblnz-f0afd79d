'use client';

import type { ReactNode } from 'react';
import { useMemo, useState, useTransition } from 'react';
import {
  Archive,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  FileText,
  Send,
  X,
} from 'lucide-react';
import {
  approveDraftAction,
  approveSelectedAction,
  deferDraftAction,
  markNeedsVoiceAction,
  rejectDraftAction,
  saveDraftRevisionAction,
  sendToLedgerAction,
  type InboxActionResult,
} from './actions';
import {
  FILTERS,
  filterDrafts,
  groupDraftsByAgent,
  summariseDrafts,
  type InboxFilter,
  type OperatorDraft,
} from './model';

type BriefingSummary = {
  weather: string;
  upcomingJobs: string[];
  recentOutcomes: string[];
};

export function InboxExperience({
  slug,
  tenantName,
  dateLabel,
  drafts,
  briefing,
}: {
  slug: string;
  tenantName: string;
  dateLabel: string;
  drafts: OperatorDraft[];
  briefing: BriefingSummary;
}) {
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openAgents, setOpenAgents] = useState<Record<string, boolean>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredDrafts = useMemo(() => filterDrafts(drafts, filter), [drafts, filter]);
  const groups = useMemo(() => groupDraftsByAgent(filteredDrafts), [filteredDrafts]);
  const summary = useMemo(() => summariseDrafts(drafts), [drafts]);
  const selectedCount = selectedIds.length;

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAgent(agentSlug: string) {
    setOpenAgents((current) => ({
      ...current,
      [agentSlug]: !(current[agentSlug] ?? true),
    }));
  }

  function runAction(action: () => Promise<InboxActionResult>, clearSelection = false) {
    setActionMessage(null);
    startTransition(async () => {
      const result = await action();
      setActionMessage(result.message);
      if (result.ok && clearSelection) setSelectedIds([]);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section>
        <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-4 md:p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                {dateLabel} · {tenantName}
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.4rem,6vw,5rem)] font-light leading-[0.9]">
                {summary.total} drafts awaiting your review
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)]">
              A 6am batch from the fleet, grouped by agent and phase for a fast
              pre-truck review.
            </p>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={[
                  'whitespace-nowrap rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors',
                  filter === item.id
                    ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] text-white'
                    : 'border-[rgba(35,33,31,0.12)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:bg-white',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {selectedCount > 0 ? (
          <BatchBar
            selectedCount={selectedCount}
            disabled={isPending}
            onApprove={() =>
              runAction(() => approveSelectedAction(slug, selectedIds), true)
            }
            onSendToLedger={() =>
              runAction(() => sendToLedgerAction(slug, selectedIds), true)
            }
            onNeedsVoice={() =>
              runAction(() => markNeedsVoiceAction(slug, selectedIds), true)
            }
          />
        ) : null}

        {actionMessage ? (
          <p
            className="mt-4 rounded-[8px] border border-[rgba(43,107,87,0.18)] bg-white/75 px-4 py-3 text-sm text-[color:var(--text-secondary)]"
            role="status"
          >
            {actionMessage}
          </p>
        ) : null}

        {filteredDrafts.length === 0 ? (
          <div className="mt-6 rounded-[8px] border border-dashed border-[rgba(35,33,31,0.18)] bg-white/55 p-10 text-center">
            <p className="font-display text-3xl font-light">Quiet day. Your fleet is watching.</p>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
              Change filters or check back after the next 6am briefing run.
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {groups.map((group) => {
            const isOpen = openAgents[group.agentSlug] ?? true;
            return (
              <section
                key={group.agentSlug}
                className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65"
              >
                <button
                  type="button"
                  onClick={() => toggleAgent(group.agentSlug)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left md:px-5"
                >
                  <span>
                    <span className="font-display text-3xl font-light leading-none">
                      {group.agentName}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                      {group.role} · {group.draftCount} drafts
                    </span>
                  </span>
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-[color:var(--text-secondary)]" aria-hidden />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-[color:var(--text-secondary)]" aria-hidden />
                  )}
                </button>

                {isOpen ? (
                  <div className="border-t border-[rgba(35,33,31,0.08)] px-4 py-4 md:px-5">
                    {group.phaseGroups.map((phaseGroup) => (
                      <div key={phaseGroup.phase} className="mb-6 last:mb-0">
                        <div className="mb-3 flex items-center gap-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                            {phaseGroup.label}
                          </p>
                          <div className="h-px flex-1 bg-[rgba(35,33,31,0.08)]" />
                        </div>
                        <div className="space-y-3">
                          {phaseGroup.drafts.map((draft) => (
                            <DraftCard
                              key={draft.id}
                              draft={draft}
                              selected={selectedIds.includes(draft.id)}
                              onToggleSelected={() => toggleSelected(draft.id)}
                              disabled={isPending}
                              onApprove={() => runAction(() => approveDraftAction(slug, draft.id))}
                              onDefer={() => runAction(() => deferDraftAction(slug, draft.id))}
                              onSaveEdit={(body) =>
                                runAction(() => saveDraftRevisionAction(slug, draft.id, body))
                              }
                              onReject={(reason) =>
                                runAction(() => rejectDraftAction(slug, draft.id, reason))
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </section>

      <BriefingSidebar summary={summary} briefing={briefing} />
    </div>
  );
}

function DraftCard({
  draft,
  selected,
  onToggleSelected,
  disabled,
  onApprove,
  onDefer,
  onSaveEdit,
  onReject,
}: {
  draft: OperatorDraft;
  selected: boolean;
  onToggleSelected: () => void;
  disabled: boolean;
  onApprove: () => void;
  onDefer: () => void;
  onSaveEdit: (body: string) => void;
  onReject: (reason: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [draftBody, setDraftBody] = useState(draft.draftBody);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelected}
          className="mt-1 h-4 w-4 accent-[color:var(--assembl-pounamu)]"
          aria-label={`Select ${draft.title}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]">
              {draft.agentName} · {draft.phaseLabel}
            </span>
            <span className="rounded-full border border-[rgba(35,33,31,0.10)] bg-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
              {draft.confidence == null ? 'confidence n/a' : `${Math.round(draft.confidence * 100)}%`}
            </span>
          </div>
          <h3 className="mt-2 truncate font-display text-2xl font-light leading-none">
            {draft.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[color:var(--text-body)]">
            {draft.preview}
          </p>

          {draft.citations.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {draft.citations.map((citation) => (
                <span
                  key={citation}
                  className="whitespace-nowrap rounded-full border border-[rgba(212,168,83,0.35)] bg-white px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#7A5C1E]"
                >
                  {citation}
                </span>
              ))}
            </div>
          ) : null}

          {editing ? (
            <div className="mt-4">
              <label className="sr-only" htmlFor={`draft-body-${draft.id}`}>
                Edit draft body
              </label>
              <textarea
                id={`draft-body-${draft.id}`}
                value={draftBody}
                onChange={(event) => setDraftBody(event.target.value)}
                rows={6}
                className="w-full rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white p-3 text-sm leading-relaxed outline-none focus:border-[color:var(--assembl-pounamu)]"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <DraftButton
                  icon={Check}
                  label="Save revision"
                  disabled={disabled}
                  onClick={() => {
                    onSaveEdit(draftBody);
                    setEditing(false);
                  }}
                />
                <DraftButton
                  icon={X}
                  label="Cancel"
                  disabled={disabled}
                  onClick={() => setEditing(false)}
                />
              </div>
            </div>
          ) : null}

          {rejecting ? (
            <div className="mt-4">
              <label className="sr-only" htmlFor={`reject-reason-${draft.id}`}>
                Rejection reason
              </label>
              <input
                id={`reject-reason-${draft.id}`}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Reason"
                className="h-10 w-full rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white px-3 text-sm outline-none focus:border-[color:var(--assembl-pounamu)]"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <DraftButton
                  icon={X}
                  label="Confirm reject"
                  disabled={disabled}
                  onClick={() => {
                    onReject(rejectReason);
                    setRejecting(false);
                    setRejectReason('');
                  }}
                />
                <DraftButton
                  icon={Archive}
                  label="Cancel"
                  disabled={disabled}
                  onClick={() => setRejecting(false)}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <DraftButton icon={Check} label="Approve" disabled={disabled} onClick={onApprove} />
            <DraftButton
              icon={Edit3}
              label="Edit"
              disabled={disabled}
              onClick={() => setEditing((value) => !value)}
            />
            <DraftButton
              icon={X}
              label="Reject"
              disabled={disabled}
              onClick={() => setRejecting((value) => !value)}
            />
            <DraftButton icon={Archive} label="Defer" disabled={disabled} onClick={onDefer} />
            <a
              href={`/app/evidence/export?draft=${draft.id}`}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[rgba(35,33,31,0.12)] bg-white px-3 text-xs text-[color:var(--text-primary)] transition-colors hover:bg-[color:var(--assembl-pounamu-paper)]"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              See full pack
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function DraftButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: typeof Check;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center rounded-full border border-[rgba(35,33,31,0.12)] bg-white px-3 text-xs text-[color:var(--text-primary)] transition-colors hover:bg-[color:var(--assembl-pounamu-paper)]"
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

function BatchBar({
  selectedCount,
  disabled,
  onApprove,
  onSendToLedger,
  onNeedsVoice,
}: {
  selectedCount: number;
  disabled: boolean;
  onApprove: () => void;
  onSendToLedger: () => void;
  onNeedsVoice: () => void;
}) {
  return (
    <div className="sticky top-3 z-10 mt-4 rounded-[8px] border border-[rgba(43,107,87,0.22)] bg-white/95 p-3 shadow-[0_14px_44px_rgba(35,33,31,0.10)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]">
          {selectedCount} selected
        </p>
        <div className="flex flex-wrap gap-2">
          <DraftButton
            icon={Check}
            label="Approve all selected"
            disabled={disabled}
            onClick={onApprove}
          />
          <DraftButton
            icon={Send}
            label="Send to ledger"
            disabled={disabled}
            onClick={onSendToLedger}
          />
          <DraftButton
            icon={Edit3}
            label="Mark needs-my-voice"
            disabled={disabled}
            onClick={onNeedsVoice}
          />
        </div>
      </div>
    </div>
  );
}

function BriefingSidebar({
  summary,
  briefing,
}: {
  summary: ReturnType<typeof summariseDrafts>;
  briefing: BriefingSummary;
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          Today's briefing
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Metric label="Drafts" value={summary.total} />
          <Metric label="High confidence" value={summary.highConfidence} />
          <Metric label="Needs voice" value={summary.needsVoice} />
          <Metric label="Ledger" value={summary.byPhase.find((p) => p.phase === 'ledger')?.count ?? 0} />
        </div>
      </section>

      <SidebarBlock title="Weather">
        <p className="text-sm leading-relaxed text-[color:var(--text-body)]">{briefing.weather}</p>
      </SidebarBlock>

      <SidebarBlock title="Upcoming jobs">
        <SidebarList items={briefing.upcomingJobs} empty="No jobs pulled from calendar yet." />
      </SidebarBlock>

      <SidebarBlock title="Recent outcomes">
        <SidebarList items={briefing.recentOutcomes} empty="No outcomes logged yet." />
      </SidebarBlock>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] p-3">
      <p className="font-display text-3xl font-light leading-none">{value}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
        {label}
      </p>
    </div>
  );
}

function SidebarBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SidebarList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-[color:var(--text-secondary)]">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="text-sm leading-relaxed text-[color:var(--text-body)]">
          {item}
        </li>
      ))}
    </ul>
  );
}
