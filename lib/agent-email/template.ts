/**
 * Canon HTML email template for agent replies.
 *
 * Locked brand (CANON-LOCKED-2026-06-23): Cormorant Garamond headline, Lato
 * body, Space Mono signature, canary accent, lowercase `assembl` wordmark,
 * charcoal ink on cream. Email clients won't load web fonts reliably, so each
 * family carries a web-safe fallback and the layout is table-based with inline
 * styles only.
 *
 * Kept deliberately plain — warm-direct voice, no emoji, no exclamation marks.
 */

const PALETTE = {
  canary: '#FFD42A',
  ink: '#3A3832',
  body: '#56544B',
  paper: '#FFFFFF',
  cream: '#FFF7EC',
  hairline: '#EFEADC',
  gold: '#C79B1F',
  muted: '#8A8678',
};

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "'Lato', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'Space Mono', 'SFMono-Regular', Menlo, Consolas, monospace";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Turn a plain-text body into safe HTML paragraphs. */
function bodyToHtml(text: string): string {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((para) => para.replace(/\n/g, '<br>'))
    .map(
      (para) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${PALETTE.body};">${para}</p>`,
    )
    .join('');
}

export type AgentEmailTemplateInput = {
  /** Display name of the agent, e.g. "Treasury". */
  agentName: string;
  /** The agent's own address, e.g. tax-tidy@assembl.co.nz. */
  agentEmail: string;
  /** Plain-text reply body. */
  body: string;
};

/** Render the canon HTML for an outbound agent reply. */
export function renderAgentEmailHtml({ agentName, agentEmail, body }: AgentEmailTemplateInput): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(agentName)}</title>
</head>
<body style="margin:0;padding:0;background:${PALETTE.cream};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PALETTE.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PALETTE.paper};border:1px solid ${PALETTE.hairline};border-radius:18px;overflow:hidden;">
          <!-- canary rule -->
          <tr><td style="height:4px;background:${PALETTE.canary};line-height:4px;font-size:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px 36px 8px;">
              <p style="margin:0 0 4px;font-family:${MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${PALETTE.gold};">From your agent</p>
              <h1 style="margin:0;font-family:${SERIF};font-weight:600;font-size:34px;line-height:1.1;letter-spacing:-0.02em;color:${PALETTE.ink};">${escapeHtml(agentName)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px 8px;">
              ${bodyToHtml(body)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${PALETTE.hairline};margin-top:8px;">
                <tr><td style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>
                <tr>
                  <td>
                    <p style="margin:0;font-family:${MONO};font-size:12px;letter-spacing:0.04em;color:${PALETTE.muted};">
                      ${escapeHtml(agentName)} · <a href="mailto:${escapeHtml(agentEmail)}" style="color:${PALETTE.gold};text-decoration:none;">${escapeHtml(agentEmail)}</a>
                    </p>
                    <p style="margin:10px 0 0;font-family:${SERIF};font-weight:600;font-size:22px;letter-spacing:-0.01em;color:${PALETTE.ink};">assembl</p>
                    <p style="margin:4px 0 0;font-family:${SANS};font-size:12px;color:${PALETTE.muted};">Specialist Aotearoa agents, assembled into one calm surface.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-family:${SANS};font-size:11px;color:${PALETTE.muted};">Reply to this email to keep the thread going.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text alternative for clients that don't render HTML. */
export function renderAgentEmailText({ agentName, agentEmail, body }: AgentEmailTemplateInput): string {
  return `${body.trim()}\n\n— ${agentName}\n${agentEmail}\n\nassembl · Specialist Aotearoa agents, assembled into one calm surface.\nReply to this email to keep the thread going.`;
}
