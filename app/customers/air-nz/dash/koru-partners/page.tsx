import styles from '../airnz.module.css';
import { AirNzHeader, ConceptTop } from '@/components/customers/air-nz/chrome';
import { KoruMark } from '@/components/customers/air-nz/KoruMark';
import { KORU_PARTNERS } from '@/lib/customers/air-nz/data';

const BASE = '/customers/air-nz/dash';

export default function AirNzKoruPartnersPage() {
  return (
    <>
      <AirNzHeader back={BASE} />
      <ConceptTop />
      <div className={styles.screenEyebrow}>Earn Airpoints™ › All Koru Partners</div>
      <h1 className={styles.screenTitle}>All Koru Partners</h1>
      <p className={styles.screenSub}>
        assembl sits in the native partner list — earn Airpoints™ during app wait
        moments, alongside the partners passengers already know.
      </p>
      <div className={styles.body}>
        {KORU_PARTNERS.map((p) => (
          <div
            key={p.name}
            className={`${styles.card} ${p.assembl ? '' : styles.nested}`}
            style={
              p.assembl
                ? { borderColor: '#00b0b9', margin: '12px 0' }
                : { margin: '12px 0' }
            }
          >
            <div className={styles.row} style={{ padding: 0, borderBottom: 0 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span
                  aria-hidden
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: p.assembl ? '#3a3832' : '#f5f5f6',
                    border: '1px solid #eaeaea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: p.assembl
                      ? 'var(--airnz-lockup), Georgia, serif'
                      : 'var(--airnz-body), sans-serif',
                    fontWeight: 600,
                    color: p.assembl ? '#BFA37A' : '#6b6e71',
                    fontSize: p.assembl ? 15 : 14,
                  }}
                >
                  {p.assembl ? 'a' : p.name.slice(0, 1)}
                </span>
                <div>
                  <div
                    className={styles.cardTitle}
                    style={
                      p.assembl
                        ? {
                            fontFamily: 'var(--airnz-lockup), Georgia, serif',
                            fontSize: 18,
                            color: '#3a3832',
                          }
                        : undefined
                    }
                  >
                    {p.name}
                  </div>
                  <div className={styles.cardMeta}>{p.blurb}</div>
                </div>
              </div>
              <span className={styles.chevron}>›</span>
            </div>
            {p.assembl && (
              <div
                className={styles.tagRow}
                style={{ marginTop: 12, borderTop: '1px solid #eaeaea', paddingTop: 12 }}
              >
                <span className={styles.tag}>Native partner card</span>
                <span className={styles.tag}>No spend required</span>
                <span className={styles.tag}>Earn in the wait</span>
              </div>
            )}
          </div>
        ))}

        <div
          className={styles.card}
          style={{ display: 'flex', gap: 10, alignItems: 'center' }}
        >
          <span style={{ color: '#00b0b9' }}>
            <KoruMark size={20} color="#00b0b9" />
          </span>
          <p className={styles.cardMeta} style={{ margin: 0 }}>
            Every other partner earns Airpoints™ on <em>spend</em>. assembl is the
            only one that earns on <em>time</em> — the wait itself.
          </p>
        </div>
      </div>
    </>
  );
}
