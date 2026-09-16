'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchMetaAssets,
  saveMetaAssetSelection,
  type MetaAssetOption,
  type MetaConnectionStatus,
  sharedMetaConnectionId,
} from '@/lib/meta/business-connection';
import styles from './meta-business.module.css';

type Props = {
  accessToken: string;
  status: MetaConnectionStatus;
  onSaved: () => void;
};

type Draft = {
  business: MetaAssetOption | null;
  page: MetaAssetOption | null;
  instagram: MetaAssetOption | null;
  adAccount: MetaAssetOption | null;
};

export function MetaAssetSelector({ accessToken, status, onSaved }: Props) {
  const connectionId = sharedMetaConnectionId(status);
  const [businesses, setBusinesses] = useState<MetaAssetOption[]>([]);
  const [pages, setPages] = useState<MetaAssetOption[]>([]);
  const [instagram, setInstagram] = useState<MetaAssetOption[]>([]);
  const [adAccounts, setAdAccounts] = useState<MetaAssetOption[]>([]);
  const [draft, setDraft] = useState<Draft>({
    business: null,
    page: null,
    instagram: null,
    adAccount: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadCatalogue = useCallback(async (
    businessId: string | null,
    pageId: string | null,
    preserve: Partial<Draft> = {},
  ) => {
    if (!connectionId) return;
    setLoading(true);
    setError(null);
    try {
      const assets = await fetchMetaAssets(accessToken, { businessId, pageId });
      setBusinesses(assets.businesses);
      setPages(assets.pages);
      setInstagram(assets.instagram);
      setAdAccounts(assets.ad_accounts);

      const pick = (
        list: MetaAssetOption[],
        id: string | null | undefined,
        fallback: MetaAssetOption | null,
      ) => (id ? list.find((item) => item.id === id) ?? fallback : fallback);

      setDraft((prev) => ({
        business: pick(
          assets.businesses,
          preserve.business?.id ?? status.business_id,
          preserve.business ?? prev.business,
        ),
        page: pick(
          assets.pages,
          preserve.page?.id ?? status.page_id,
          preserve.page ?? prev.page,
        ),
        instagram: pick(
          assets.instagram,
          preserve.instagram?.id ?? status.instagram_id,
          preserve.instagram ?? prev.instagram,
        ),
        adAccount: pick(
          assets.ad_accounts,
          preserve.adAccount?.id ?? status.ad_account_id,
          preserve.adAccount ?? prev.adAccount,
        ),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load assets');
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    connectionId,
    status.ad_account_id,
    status.business_id,
    status.instagram_id,
    status.page_id,
  ]);

  useEffect(() => {
    void loadCatalogue(status.business_id ?? null, status.page_id ?? null);
  }, [loadCatalogue, status.business_id, status.page_id]);

  if (!connectionId) {
    return (
      <p className={styles.helper}>
        Connect Meta Business once to unlock the asset selector.
      </p>
    );
  }

  async function onBusinessChange(id: string) {
    const business = businesses.find((item) => item.id === id) ?? null;
    setDraft({ business, page: null, instagram: null, adAccount: null });
    await loadCatalogue(business?.id ?? null, null, { business });
  }

  async function onPageChange(id: string) {
    const page = pages.find((item) => item.id === id) ?? null;
    setDraft((prev) => ({ ...prev, page, instagram: null }));
    await loadCatalogue(draft.business?.id ?? null, page?.id ?? null, {
      business: draft.business,
      page,
    });
  }

  async function save() {
    if (!connectionId) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await saveMetaAssetSelection(accessToken, {
        meta_connection_id: connectionId,
        business_id: draft.business?.id ?? null,
        business_name: draft.business?.name ?? null,
        page_id: draft.page?.id ?? null,
        page_name: draft.page?.name ?? null,
        instagram_id: draft.instagram?.id ?? null,
        instagram_username:
          draft.instagram?.meta?.username ??
          draft.instagram?.name?.replace(/^@/, '') ??
          null,
        ad_account_id: draft.adAccount?.id ?? null,
        ad_account_name: draft.adAccount?.name ?? null,
      });
      setNotice('Assets saved for this Meta connection.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save assets');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.selector} aria-labelledby="meta-asset-selector-heading">
      <header className={styles.selectorHeader}>
        <div>
          <p className={styles.kicker}>Asset cascade</p>
          <h3 id="meta-asset-selector-heading">Portfolio → Page → Instagram → Ad account</h3>
        </div>
        <p className={styles.monoHint}>
          meta_connection_id · {connectionId}
        </p>
      </header>

      <p className={styles.helper}>
        Choose the Business Portfolio, Page, Instagram account and Ad Account that Pursuit
        and Studio should read against. Paid activation stays off.
      </p>

      {loading ? (
        <p className={styles.monoHint} role="status">Loading Meta assets…</p>
      ) : (
        <div className={styles.selectorGrid}>
          <label className={styles.field}>
            <span>Business Portfolio</span>
            <select
              value={draft.business?.id ?? ''}
              onChange={(event) => void onBusinessChange(event.target.value)}
            >
              <option value="">Select portfolio</option>
              {businesses.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Facebook Page</span>
            <select
              value={draft.page?.id ?? ''}
              onChange={(event) => void onPageChange(event.target.value)}
              disabled={!draft.business && pages.length === 0}
            >
              <option value="">Select page</option>
              {pages.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Instagram</span>
            <select
              value={draft.instagram?.id ?? ''}
              onChange={(event) => {
                const next = instagram.find((item) => item.id === event.target.value) ?? null;
                setDraft((prev) => ({ ...prev, instagram: next }));
              }}
              disabled={!draft.page}
            >
              <option value="">Select Instagram</option>
              {instagram.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Ad Account</span>
            <select
              value={draft.adAccount?.id ?? ''}
              onChange={(event) => {
                const next = adAccounts.find((item) => item.id === event.target.value) ?? null;
                setDraft((prev) => ({ ...prev, adAccount: next }));
              }}
            >
              <option value="">Select ad account</option>
              {adAccounts.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className={styles.selectorActions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => void save()}
          disabled={saving || loading || !draft.page}
        >
          {saving ? 'Saving…' : 'Save assets'}
        </button>
        {!draft.page ? (
          <span className={styles.monoHint}>Page required before save</span>
        ) : null}
      </div>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
    </section>
  );
}
