import { LULA_BRAND } from '@/lib/customers/lula-inn/brand';
import {
  Container,
  PageHeader,
  Card,
  Grid,
  Stat,
  Section,
  Pill,
} from '@/components/customers/lula-inn/ui';
import { COMMS_DRAFTS, type CommsDraft } from '@/lib/customers/lula-inn/demo-data';

const B = LULA_BRAND;

// Preferred display order — any other `kind` values fall in after these.
const KIND_ORDER = ['Booking confirmation', 'Event enquiry', 'Review reply', 'Loyal guest', 'Newsletter'];

const KIND_PILL_TONE: Record<string, { bg: string; text: string }> = {
  'Booking confirmation': { bg: B.oceanLight, text: B.ocean },
  'Event enquiry': { bg: B.amberBg, text: '#7c5610' },
  'Review reply': { bg: B.coralLight, text: B.coralDark },
  'Loyal guest': { bg: '#F1E6C9', text: B.brassDark },
  Newsletter: { bg: B.greenBg, text: '#1c5637' },
};

function kindTone(kind: string) {
  return KIND_PILL_TONE[kind] ?? { bg: B.sand, text: B.inkSoft };
}

function DraftCard({ draft }: { draft: CommsDraft }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <Pill tone={kindTone(draft.kind)}>{draft.kind}</Pill>
      </div>
      <div
        style={{
          fontFamily: 'var(--lula-mono), monospace',
          fontSize: 12,
          letterSpacing: '0.03em',
          color: B.inkSoft,
          marginBottom: 10,
        }}
      >
        {draft.context}
      </div>
      <blockquote
        style={{
          margin: 0,
          paddingLeft: 16,
          borderLeft: `3px solid ${B.brass}`,
          fontFamily: 'var(--lula-body), system-ui, sans-serif',
          fontSize: 14.5,
          lineHeight: 1.7,
          color: B.ink,
          fontStyle: 'italic',
        }}
      >
        “{draft.draft}”
      </blockquote>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${B.line}`,
        }}
      >
        {(['Copy', 'Edit', 'Send'] as const).map((action) => (
          <span
            key={action}
            aria-disabled="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: 999,
              fontFamily: 'var(--lula-body), system-ui, sans-serif',
              fontSize: 12.5,
              fontWeight: 700,
              color: action === 'Send' ? B.white : B.ocean,
              background: action === 'Send' ? B.ocean : B.white,
              border: `1px solid ${action === 'Send' ? B.ocean : B.line}`,
              opacity: 0.85,
              cursor: 'default',
            }}
          >
            {action}
          </span>
        ))}
        <span
          style={{
            marginLeft: 'auto',
            alignSelf: 'center',
            fontFamily: 'var(--lula-mono), monospace',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: B.inkSoft,
          }}
        >
          Draft only
        </span>
      </div>
    </Card>
  );
}

export default function CommsPage() {
  const byKind = new Map<string, CommsDraft[]>();
  for (const draft of COMMS_DRAFTS) {
    const list = byKind.get(draft.kind) ?? [];
    list.push(draft);
    byKind.set(draft.kind, list);
  }

  const orderedKinds = [
    ...KIND_ORDER.filter((k) => byKind.has(k)),
    ...[...byKind.keys()].filter((k) => !KIND_ORDER.includes(k)),
  ];

  const reviewReplyCount = byKind.get('Review reply')?.length ?? 0;
  const eventEnquiryCount = byKind.get('Event enquiry')?.length ?? 0;

  return (
    <Container>
      <PageHeader
        eyebrow="Guest comms"
        title="Guest comms drafts"
        intro="Booking confirmations, event quotes, review replies, newsletters and loyal-guest notes — drafted in Lula’s voice, a manager reviews and sends. Nothing sends automatically."
      />

      <Grid min={168} gap={14} style={{ marginBottom: 30 }}>
        <Card pad={18}>
          <Stat value={String(COMMS_DRAFTS.length)} label="Drafts ready for review" tone="coral" />
        </Card>
        <Card pad={18}>
          <Stat value={String(reviewReplyCount)} label="Review replies drafted" />
        </Card>
        <Card pad={18}>
          <Stat value={String(eventEnquiryCount)} label="Event enquiries drafted" />
        </Card>
      </Grid>

      <Card
        pad={16}
        style={{
          marginBottom: 30,
          background: B.oceanLight,
          border: `1px solid ${B.oceanMid}`,
        }}
      >
        <span style={{ fontSize: 13.5, color: B.ocean, lineHeight: 1.6 }}>
          Every message below is an AI-drafted starting point in the venue’s voice. A manager reads, edits if needed,
          and sends it themselves — <strong>the assistant never sends a message on its own.</strong>
        </span>
      </Card>

      {orderedKinds.map((kind) => {
        const drafts = byKind.get(kind) ?? [];
        const basis =
          kind === 'Review reply'
            ? 'Google · TripAdvisor · The Denizen'
            : kind === 'Loyal guest'
            ? 'repeat-visit recognition'
            : undefined;

        return (
          <Section key={kind} title={kind} basis={basis} demo>
            {kind === 'Review reply' ? (
              <p style={{ fontSize: 13, color: B.inkSoft, margin: '-6px 0 14px', maxWidth: 640, lineHeight: 1.6 }}>
                Covers reviews from Google, TripAdvisor and The Denizen — a thank-you for the good ones, and a
                service-recovery reply drafted whenever a review comes in negative.
              </p>
            ) : null}
            {kind === 'Loyal guest' ? (
              <p style={{ fontSize: 13, color: B.inkSoft, margin: '-6px 0 14px', maxWidth: 640, lineHeight: 1.6 }}>
                Recognises repeat guests — a milestone visit (like a 10th booking this season) gets a personal note,
                not a generic loyalty blast.
              </p>
            ) : null}
            <Grid min={320} gap={16}>
              {drafts.map((draft) => (
                <DraftCard key={draft.id} draft={draft} />
              ))}
            </Grid>
          </Section>
        );
      })}
    </Container>
  );
}
