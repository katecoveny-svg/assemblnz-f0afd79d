'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  boardByStatus,
  installHouseholdFloor,
  tickHouseholdFloor,
  whoIsWhereSummary,
  type HouseholdFloorInstance,
  type HouseholdSeatId,
} from '@/apps/do/shared/household-floor';
import {
  OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE,
  PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
} from '@/apps/do/shared/household-floor-templates';
import {
  clearLocalHouseholdFloor,
  patchLocalPersonalisation,
  readLocalHouseholdFloor,
  writeLocalHouseholdFloor,
} from '@/apps/do/shared/household-floor-local';
import {
  DO_AVATAR_MARKS,
  DO_BRAND_ACCENTS,
  personalisationInk,
  type DoAvatarMark,
} from '@/apps/do/shared/do-personalisation';
import { BROWSER_SEAT_FOLLOW_UPS, HOUSEHOLD_BROWSER_SEAT_HOSTS } from '@/apps/do/shared/browser-seat';
import {
  resolveDoConnectorStatuses,
  type DoConnectionsSnapshot,
  type DoConnectorStatus,
} from '@/apps/do/shared/do-connectors';

import { DoTaskPanel } from '@/components/do/DoTaskPanel';
import styles from './household.module.css';

type Tab = 'board' | 'seats' | 'customise' | 'browser' | 'connectors';

export function HouseholdFloorClient({
  initialPrivate = false,
}: {
  initialPrivate?: boolean;
}) {
  const [floor, setFloor] = useState<HouseholdFloorInstance | null>(null);
  const [tab, setTab] = useState<Tab>('board');
  const [message, setMessage] = useState('Install the public Household Floor to try seats, boards and the browser seat path.');
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [connectorStatuses, setConnectorStatuses] = useState<DoConnectorStatus[]>([]);
  const [connectorMessage, setConnectorMessage] = useState('');
  const [connectorBusy, setConnectorBusy] = useState('');

  useEffect(() => {
    const existing = readLocalHouseholdFloor();
    if (existing) {
      const migrated = {
        ...existing,
        connectors: existing.connectors?.length
          ? existing.connectors
          : existing.visibility === 'owner_private'
            ? OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE.connectors
            : PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.connectors,
        mcpAllowlist: existing.mcpAllowlist?.length
          ? existing.mcpAllowlist
          : existing.visibility === 'owner_private'
            ? OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE.mcpAllowlist
            : PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.mcpAllowlist,
      };
      writeLocalHouseholdFloor(migrated);
      setFloor(migrated);
      setMessage(`Restored ${migrated.personalisation.displayName} from this device.`);
      return;
    }
    if (initialPrivate) {
      // Public site must not offer an owner-private install door. Real household
      // context does not ship in the web bundle; use the scrubbed public template.
      setMessage(
        'Owner-private install is not available on the public site. Install the scrubbed public Household Floor template instead.',
      );
    }
  }, [initialPrivate]);

  const refreshConnectors = useCallback(async (requirements = floor?.connectors ?? []) => {
    if (!requirements.length) {
      setConnectorStatuses([]);
      return;
    }
    try {
      const response = await fetch('/api/do/connections', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Connections unavailable');
      const snapshot = await response.json() as DoConnectionsSnapshot;
      setConnectorStatuses(resolveDoConnectorStatuses(requirements, snapshot));
      setConnectorMessage(snapshot.accountsAvailable === false
        ? 'Connected accounts could not be checked. Status is unknown until Pipedream responds.'
        : '');
    } catch {
      setConnectorMessage('Could not load connector state. Open /do/connections or try again.');
    }
  }, [floor?.connectors]);

  useEffect(() => {
    if (!floor?.connectors?.length) return;
    void refreshConnectors(floor.connectors);
  }, [floor?.id, floor?.connectors, refreshConnectors]);

  const boards = useMemo(() => (floor ? boardByStatus(floor.board) : null), [floor]);
  const accent = floor?.personalisation.accentColor ?? '#240B21';
  const ink = personalisationInk(accent);

  const persist = useCallback((next: HouseholdFloorInstance, note: string) => {
    writeLocalHouseholdFloor(next);
    setFloor(next);
    setMessage(note);
  }, []);

  function installPublic() {
    setBusy(true);
    try {
      const next = installHouseholdFloor({ template: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE });
      persist(next, 'Public Household Floor installed on this device. Customise it, then run the evening board.');
      setTab('board');
    } finally {
      setBusy(false);
    }
  }

  function refusePrivateInstall() {
    setMessage(
      'Owner-private install is closed on the public site. Use the scrubbed public template — personal household context does not ship in this web app.',
    );
  }

  async function runEveningBoard() {
    if (!floor || busy) return;
    setBusy(true);
    try {
      const response = await fetch('/api/do/household', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'tick',
          forceScheduleId: 'evening-board',
          floor,
        }),
      });
      const data = await response.json() as {
        floor?: HouseholdFloorInstance;
        receipt?: { summary: string };
        message?: string;
      };
      if (!response.ok || !data.floor) {
        // Fail-soft: tick locally with the same contract.
        const local = tickHouseholdFloor({ floor, forceScheduleId: 'evening-board' });
        persist(local.floor, local.receipt.summary);
        return;
      }
      persist(data.floor, data.receipt?.summary || 'Evening board updated.');
      setTab('board');
    } catch {
      const local = tickHouseholdFloor({ floor, forceScheduleId: 'evening-board' });
      persist(local.floor, local.receipt.summary);
    } finally {
      setBusy(false);
    }
  }

  async function runMorningBoard() {
    if (!floor || busy) return;
    setBusy(true);
    try {
      const local = tickHouseholdFloor({ floor, forceScheduleId: 'morning-bus' });
      persist(local.floor, local.receipt.summary);
      setTab('board');
    } finally {
      setBusy(false);
    }
  }

  function updatePersonalisation(patch: {
    displayName?: string;
    accentColor?: string;
    avatarMark?: DoAvatarMark;
  }) {
    if (!floor) return;
    const next = patchLocalPersonalisation(floor, patch);
    setFloor(next);
    setMessage('Personalisation saved on this device.');
  }

  async function connectApp(app: string) {
    if (connectorBusy) return;
    setConnectorBusy(app);
    setConnectorMessage('');
    try {
      const response = await fetch('/api/do/connections', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ app }),
      });
      const data = await response.json() as { url?: string; message?: string };
      if (response.status === 401) {
        window.location.assign('/login?redirect=%2Fdo%2Fhousehold');
        return;
      }
      if (!response.ok || !data.url) throw new Error(data.message || 'Connection unavailable.');
      window.location.assign(data.url);
    } catch (error) {
      setConnectorMessage(error instanceof Error ? error.message : 'Connection unavailable.');
      setConnectorBusy('');
    }
  }

  function resetFloor() {
    clearLocalHouseholdFloor();
    setFloor(null);
    setMessage('Cleared this device’s Household Floor. Install the public template to share tonight.');
  }

  const shareText = floor && floor.visibility === 'public_template'
    ? `Try Assembl Household Floor — a runnable family DO with nine seats, evening board, and drafts-only gates.\n${typeof window !== 'undefined' ? `${window.location.origin}/do/household` : 'https://www.assembl.co.nz/do/household'}`
    : '';

  return (
    <div className={styles.page} style={{ ['--hf-accent' as string]: accent, ['--hf-ink' as string]: ink }}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Link href="/do" className={styles.wordmark}>DO</Link>
          <span>household floor</span>
          <span className={styles.chip}>{floor?.visibility === 'owner_private' ? 'owner private' : 'public template'}</span>
        </div>
        <div className={styles.headerActions}>
          <Link href="/do">DO hub</Link>
          <Link href="/api/do/download?format=extension">Extension ZIP</Link>
          <Link href="/do" className={styles.primaryLink}>assembl home DO</Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.orbStage} aria-hidden>
            <button type="button" className={styles.orb} tabIndex={-1}>
              <span>{floor?.personalisation.avatarMark ?? '⌂'}</span>
            </button>
            <div className={styles.orbGlow} />
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>pin · template · place · run</p>
            <h1>{floor?.personalisation.displayName ?? 'Household Floor'}</h1>
            <p className={styles.lede}>
              Nine specialist seats. Evening, morning and Sunday boards. Drafts-only hard gates.
              Owner-browser seat for school and council pages — consent required, never send or pay.
            </p>
            <div className={styles.ctaRow}>
              {!floor ? (
                <button type="button" className={styles.cta} disabled={busy} onClick={installPublic}>
                  Install public template
                </button>
              ) : (
                <button type="button" className={styles.cta} disabled={busy} onClick={() => void runEveningBoard()}>
                  Run evening board
                </button>
              )}
              {floor ? (
                <button type="button" className={styles.secondaryCta} disabled={busy} onClick={() => void runMorningBoard()}>
                  Run morning board
                </button>
              ) : null}
              <button type="button" className={styles.secondaryCta} onClick={() => setShareOpen(true)} disabled={!floor || floor.visibility !== 'public_template'}>
                Share tonight
              </button>
            </div>
            <p className={styles.status} role="status">{message}</p>
          </div>
        </section>

        <DoTaskPanel boardId="household-floor" title="Household Floor to-do" />

        {!floor ? (
          <section className={styles.installGrid}>
            <article className={styles.templateCard} data-shareable="true">
              <div className={styles.cardMark}>⌂</div>
              <h2>Household Floor</h2>
              <p>Scrubbed public competition template — fictional Avery / Quinn / Harper household. Safe to offer extensively tonight.</p>
              <ul>
                <li>Seats SCHOOL → DESK</li>
                <li>SchoolBridge-style demo portals</li>
                <li>Bins Thursday · bus morning · fridge kitchen</li>
              </ul>
              <button type="button" disabled={busy} onClick={installPublic}>Install &amp; customise</button>
            </article>
            <article className={styles.templateCard} data-shareable="false">
              <div className={styles.cardMark}>◎</div>
              <h2>Owner mode</h2>
              <p>
                Personal household context does not ship in this public web app.
                Use the scrubbed public template above. Owner-private seeds stay off the public site.
              </p>
              <ul>
                <li>No private install on assembl.co.nz</li>
                <li>Public template is drafts-only</li>
                <li>{initialPrivate ? 'Private URL path refused here' : 'Demo-safe share path'}</li>
              </ul>
              <button type="button" className={styles.danger} disabled={busy} onClick={refusePrivateInstall}>
                Private install unavailable
              </button>
            </article>
          </section>
        ) : (
          <>
            <nav className={styles.tabs} aria-label="Household Floor panels">
              {([
                ['board', 'Board'],
                ['seats', 'Seats'],
                ['connectors', 'Connectors'],
                ['customise', 'Customise'],
                ['browser', 'Browser seat'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  data-active={tab === id}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </nav>

            {tab === 'board' ? (
              <section className={styles.boardSection}>
                <div className={styles.whoWhere}>
                  <p className={styles.eyebrow}>who is where</p>
                  <p>{whoIsWhereSummary(floor.context)}</p>
                </div>
                <div className={styles.boardGrid}>
                  {([
                    ['needs_you', 'Needs you'],
                    ['working', 'Working'],
                    ['done', 'Done'],
                  ] as const).map(([key, label]) => (
                    <div key={key} className={styles.boardCol} data-col={key}>
                      <header>
                        <h2>{label}</h2>
                        <span>{boards?.[key].length ?? 0}</span>
                      </header>
                      <div className={styles.cardStack}>
                        {(boards?.[key] ?? []).length ? (boards?.[key] ?? []).map((item) => (
                          <article key={item.id} className={styles.seatCard}>
                            <div className={styles.seatCardTop}>
                              <strong>{item.seatId}</strong>
                              <span>{item.status.replace('_', ' ')}</span>
                            </div>
                            <h3>{item.title}</h3>
                            <p>{item.summary}</p>
                            {item.needsYouReason ? <p className={styles.need}>{item.needsYouReason}</p> : null}
                            {item.draft ? <pre className={styles.draft}>{item.draft}</pre> : null}
                          </article>
                        )) : (
                          <div className={styles.empty}>
                            <span>quiet</span>
                            <p>{key === 'needs_you' ? 'Run evening board to open today’s Needs you pile.' : 'Nothing here yet.'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.order}>
                  <p className={styles.eyebrow}>daily board order</p>
                  <ol>{floor.dailyBoardOrder.map((line) => <li key={line}>{line}</li>)}</ol>
                </div>
              </section>
            ) : null}

            {tab === 'seats' ? (
              <section className={styles.seatsGrid}>
                {floor.seats.map((seat) => (
                  <article key={seat.id} className={styles.seatTile}>
                    <header>
                      <span className={styles.seatId}>{seat.id as HouseholdSeatId}</span>
                      <h3>{seat.title}</h3>
                    </header>
                    <p>{seat.summary}</p>
                    <p className={styles.meta}>{seat.browserSeatPreferred ? 'Browser seat preferred' : 'Notes / photo path'}</p>
                    <div className={styles.gates}>
                      <span>never</span>
                      <ul>{seat.never.slice(0, 2).map((line) => <li key={line}>{line}</li>)}</ul>
                    </div>
                  </article>
                ))}
              </section>
            ) : null}

            {tab === 'connectors' ? (
              <section className={styles.browserSeat}>
                <div className={styles.browserHero}>
                  <h2>Connectors for this DO</h2>
                  <p>
                    Declared Pipedream Connect apps — no tokens in the template.
                    Gmail is optional for school mail (readonly). Drafts only; never auto-send.
                  </p>
                </div>
                <div className={styles.cardStack}>
                  {(connectorStatuses.length ? connectorStatuses : (floor.connectors ?? []).map((requirement) => ({
                    ...requirement,
                    state: 'sign_in' as const,
                    stateLabel: 'Checking…',
                  }))).map((row) => (
                    <article key={`${row.app}-${row.capabilityKey}`} className={styles.seatCard}>
                      <div className={styles.seatCardTop}>
                        <strong>{row.label}</strong>
                        <span data-state={row.state}>{row.stateLabel}{row.required ? ' · required' : ' · optional'}</span>
                      </div>
                      <h3>{row.purpose}</h3>
                      <p className={styles.need}>{row.safety}</p>
                      <div className={styles.ctaRow}>
                        {row.state === 'connected' ? (
                          <span className={styles.meta}>Linked{row.accountLabel ? ` · ${row.accountLabel}` : ''}. Authority: {row.authority}.</span>
                        ) : row.state === 'sign_in' ? (
                          <a className={styles.cta} href="/login?redirect=%2Fdo%2Fhousehold">Sign in to connect</a>
                        ) : row.state === 'setup_needed' ? (
                          <span className={styles.meta}>Platform setup needed (Pipedream / DO_GMAIL_OAUTH_APP_ID).</span>
                        ) : (
                          <button
                            type="button"
                            className={styles.cta}
                            disabled={Boolean(connectorBusy)}
                            onClick={() => void connectApp(row.app)}
                          >
                            {connectorBusy === row.app
                              ? 'Opening Connect…'
                              : row.state === 'needs_reconnect'
                                ? `Reconnect ${row.label}`
                                : `Connect ${row.label}`}
                          </button>
                        )}
                        <a className={styles.secondaryCta} href="/do/connections">All DO connections</a>
                        <button type="button" className={styles.secondaryCta} onClick={() => void refreshConnectors(floor.connectors)}>Refresh</button>
                      </div>
                    </article>
                  ))}
                </div>
                {connectorMessage ? <p className={styles.status} role="status">{connectorMessage}</p> : null}
                <div className={styles.browserHero} style={{ marginTop: 28 }}>
                  <h2>MCP tool allowlist</h2>
                  <p>
                    Cursor IDE MCP plugins do not flow into this DO. Tools only run when declared here and called through the DO MCP gateway (Composio primary · Zapier long-tail · Treg data APIs · Pipedream for first-party Gmail).
                  </p>
                </div>
                <div className={styles.cardStack}>
                  {(floor.mcpAllowlist ?? []).map((tool) => (
                    <article key={`${tool.provider}-${tool.toolId}`} className={styles.seatCard}>
                      <div className={styles.seatCardTop}>
                        <strong>{tool.label}</strong>
                        <span>{tool.provider} · {tool.sideEffect}{tool.approvalRequired ? ' · approval' : ''}</span>
                      </div>
                      <h3>{tool.purpose}</h3>
                      <p className={styles.need}><code>{tool.toolId}</code></p>
                      <div className={styles.ctaRow}>
                        <a className={styles.secondaryCta} href="/do/connections#mcp-gateway">MCP gateway status</a>
                      </div>
                    </article>
                  ))}
                </div>
                <p className={styles.honesty}>
                  Pipedream Connect remains for first-party Gmail. Marketplace “heaps of APIs” = Composio → Zapier → Treg via DO MCP — never fake live access when env is missing.
                </p>
              </section>
            ) : null}

            {tab === 'customise' ? (
              <section className={styles.customise}>
                <label>
                  Display name
                  <input
                    value={floor.personalisation.displayName}
                    maxLength={48}
                    onChange={(event) => updatePersonalisation({ displayName: event.target.value })}
                  />
                </label>
                <div>
                  <p className={styles.eyebrow}>accent colour</p>
                  <div className={styles.swatches}>
                    {DO_BRAND_ACCENTS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Accent ${color}`}
                        className={styles.swatch}
                        style={{ background: color }}
                        data-active={floor.personalisation.accentColor.toUpperCase() === color.toUpperCase()}
                        onClick={() => updatePersonalisation({ accentColor: color })}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className={styles.eyebrow}>avatar mark</p>
                  <div className={styles.marks}>
                    {DO_AVATAR_MARKS.map((mark) => (
                      <button
                        key={mark}
                        type="button"
                        data-active={floor.personalisation.avatarMark === mark}
                        onClick={() => updatePersonalisation({ avatarMark: mark })}
                      >
                        {mark}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.previewCard} style={{ background: accent, color: ink }}>
                  <span>{floor.personalisation.avatarMark}</span>
                  <strong>{floor.personalisation.displayName}</strong>
                  <small>widget preview · drafts only</small>
                </div>
                <button type="button" className={styles.danger} onClick={resetFloor}>Clear this device floor</button>
              </section>
            ) : null}

            {tab === 'browser' ? (
              <section className={styles.browserSeat}>
                <div className={styles.browserHero}>
                  <h2>Per-DO browser seat</h2>
                  <p>
                    Session key <code>{floor.browserSeatSessionKey}</code> — not a shared anonymous scrape.
                    Consent per domain or session. Never send, pay or submit from the seat.
                  </p>
                </div>
                <ol className={styles.steps}>
                  <li>Download the extension ZIP and Load unpacked in Chrome.</li>
                  <li>Open a SchoolBridge / Council / AT tab (catalog hosts below).</li>
                  <li>Side panel → <strong>Capture page for this DO</strong> (consent checkbox required).</li>
                  <li>Optional screenshot via visible tab — reviewed before use.</li>
                  <li>Receipt lands on Needs you. Drafts stay drafts until you approve.</li>
                </ol>
                <div className={styles.hostList}>
                  <p className={styles.eyebrow}>catalog hosts</p>
                  <ul>{HOUSEHOLD_BROWSER_SEAT_HOSTS.map((host) => <li key={host}>{host}</li>)}</ul>
                </div>
                <div className={styles.followUps}>
                  <p className={styles.eyebrow}>follow-ups (honest)</p>
                  <p>{BROWSER_SEAT_FOLLOW_UPS.isolatedChromiumProfiles.summary}</p>
                  <p>{BROWSER_SEAT_FOLLOW_UPS.screenRecordLearnMode.summary}</p>
                  <p>{BROWSER_SEAT_FOLLOW_UPS.macCompanionHook.summary}</p>
                </div>
                <p className={styles.honesty}>
                  Dragging the floating ✦ does not share your screen. Show DO / ScreenCaptureKit remain explicit user actions.
                </p>
              </section>
            ) : null}

            <section className={styles.gatesBar}>
              <p className={styles.eyebrow}>hard gates</p>
              <ul>{floor.context.hardGates.map((gate) => <li key={gate}>{gate}</li>)}</ul>
            </section>

            {floor.receipts[0] ? (
              <section className={styles.receipt}>
                <p className={styles.eyebrow}>latest receipt</p>
                <strong>{floor.receipts[0].title}</strong>
                <p>{floor.receipts[0].summary}</p>
              </section>
            ) : null}
          </>
        )}

        <section className={styles.honestyBand}>
          <p className={styles.eyebrow}>product honesty</p>
          <h2>Save to Office ≠ a running agent</h2>
          <p>
            Builder “save to office” stores an accepted plan with a <code>job_accepted</code> receipt — it does not start Household Floor.
            Path for tonight: install this public template → customise → install extension → place DO → run evening board → work the Needs you pile.
          </p>
        </section>
      </main>

      {shareOpen && floor?.visibility === 'public_template' ? (
        <div className={styles.shareModal} role="dialog" aria-modal="true" aria-label="Share Household Floor">
          <div className={styles.shareCard}>
            <h2>Share the public template</h2>
            <p>Copy this link. Do not share an owner-private seed or screenshots with real household details.</p>
            <textarea readOnly value={shareText} rows={4} />
            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.cta}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareText);
                    setMessage('Share text copied.');
                  } catch {
                    setMessage('Copy failed — select the text manually.');
                  }
                }}
              >
                Copy share text
              </button>
              <button type="button" className={styles.secondaryCta} onClick={() => setShareOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
