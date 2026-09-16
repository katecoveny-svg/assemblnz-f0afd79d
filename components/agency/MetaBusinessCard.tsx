'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  fetchMetaConnectionStatus,
  sharedMetaConnectionId,
  startMetaBusinessOAuth,
  type MetaConnectionStatus,
} from '@/lib/meta/business-connection';
import { MetaAssetSelector } from './MetaAssetSelector';
import styles from './meta-business.module.css';

type Props = {
  /** Optional org scope passed through OAuth start. */
  organisationId?: string;
};

function formatExpiry(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-NZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function MetaBusinessCard({ organisationId }: Props) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [status, setStatus] = useState<MetaConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const refresh = useCallback(async (token: string) => {
    const next = await fetchMetaConnectionStatus(token);
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ) {
          throw new Error(
            'Supabase browser env is not configured in this preview. Connect UI is ready; secrets stay out of the PR.',
          );
        }
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? null;
        if (cancelled) return;
        setSessionToken(token);
        setSignedIn(Boolean(token));
        if (token) await refresh(token);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load connection');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('meta_connected') === '1') {
      setBanner('Meta Business connected. Select the assets Pursuit should read.');
    }
    const metaError = params.get('meta_error');
    if (metaError) {
      setError(`Connection failed: ${metaError}`);
    }
  }, []);

  async function connect() {
    if (!sessionToken) {
      window.location.assign('/auth?redirect=/agency/connections');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { auth_url } = await startMetaBusinessOAuth(sessionToken, {
        organisationId,
        redirectAfter: '/agency/connections',
      });
      window.location.assign(auth_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Meta OAuth');
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!sessionToken || !status) return;
    const connectionId = sharedMetaConnectionId(status);
    if (!connectionId) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: delError } = await supabase
        .from('meta_connections')
        .delete()
        .eq('id', connectionId);
      if (delError) throw delError;
      setStatus({ connected: false });
      setBanner('Meta Business disconnected. Tokens are removed with the connection row.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not disconnect');
    } finally {
      setBusy(false);
    }
  }

  const connected = Boolean(status?.connected);
  const connectionId = sharedMetaConnectionId(status);
  const capability = status?.capability;

  return (
    <article className={styles.card} aria-labelledby="meta-business-card-title">
      <div className={styles.cardTop}>
        <div>
          <p className={styles.kicker}>Pursuit · connections</p>
          <h2 id="meta-business-card-title">Meta Business</h2>
        </div>
        <span
          className={styles.statusChip}
          data-state={connected ? (status?.expiring ? 'expiring' : 'connected') : 'idle'}
        >
          {loading
            ? 'checking'
            : connected
              ? status?.expiring
                ? 'expiring'
                : 'connected'
              : 'not connected'}
        </span>
      </div>

      <p className={styles.blurb}>
        Connect once. Assembl reads your Business Portfolio, Page, Instagram and Ad Account
        for Pursuit — no Facebook Pixel on the public marketing site, and paid activation
        stays off until explicitly enabled.
      </p>

      <p className={styles.reads}>
        Reads · pages_show_list · pages_read_engagement · instagram_basic · business_management · ads_read
      </p>

      {connectionId ? (
        <p className={styles.monoHint}>meta_connection_id · {connectionId}</p>
      ) : null}

      {connected ? (
        <ul className={styles.assetList}>
          <li>
            <span>Portfolio</span>
            <strong>{status?.business_name ?? 'Not selected'}</strong>
          </li>
          <li>
            <span>Page</span>
            <strong>{status?.page_name ?? 'Not selected'}</strong>
          </li>
          <li>
            <span>Instagram</span>
            <strong>
              {status?.instagram_username
                ? `@${status.instagram_username}`
                : 'Not selected'}
            </strong>
          </li>
          <li>
            <span>Ad account</span>
            <strong>{status?.ad_account_name ?? 'Not selected'}</strong>
          </li>
        </ul>
      ) : null}

      {capability ? (
        <dl className={styles.capability}>
          <div>
            <dt>pursuit_read</dt>
            <dd>{capability.pursuit_read ? 'on' : 'off'}</dd>
          </div>
          <div>
            <dt>studio_organic_publish</dt>
            <dd>{capability.studio_organic_publish ? 'on' : 'off'}</dd>
          </div>
          <div>
            <dt>paid_activation</dt>
            <dd>{capability.paid_activation ? 'on' : 'off'}</dd>
          </div>
        </dl>
      ) : null}

      {status?.token_expires_at ? (
        <p className={styles.monoHint}>
          token expires · {formatExpiry(status.token_expires_at)}
        </p>
      ) : null}

      <div className={styles.actions}>
        {!connected ? (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => void connect()}
            disabled={busy || loading}
          >
            {busy ? 'Opening Meta…' : signedIn ? 'Connect Meta Business' : 'Sign in to connect'}
          </button>
        ) : (
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => void disconnect()}
            disabled={busy}
          >
            Disconnect
          </button>
        )}
        <Link className={styles.textLink} href="/legal/meta-data-deletion">
          Meta data deletion
        </Link>
        <Link className={styles.textLink} href="/legal/privacy">
          Privacy
        </Link>
      </div>

      {banner ? <p className={styles.notice} role="status">{banner}</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {!signedIn && !loading ? (
        <p className={styles.helper}>
          Sign in to connect Meta Business. OAuth starts only after you approve.
        </p>
      ) : null}

      {connected && sessionToken && status ? (
        <MetaAssetSelector
          accessToken={sessionToken}
          status={status}
          onSaved={() => {
            void refresh(sessionToken);
          }}
        />
      ) : null}
    </article>
  );
}
