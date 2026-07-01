import styles from '../airnz.module.css';
import { AirNzHeader, ConceptTop } from '@/components/customers/air-nz/chrome';
import { WaitStatesExplorer } from '@/components/customers/air-nz/WaitStatesExplorer';

const BASE = '/customers/air-nz/dash';

export default function AirNzWaitStatesPage() {
  return (
    <>
      <AirNzHeader back={BASE} />
      <ConceptTop />
      <div className={styles.screenEyebrow}>Six un-monetised canvases</div>
      <h1 className={styles.screenTitle}>Wait states</h1>
      <p className={styles.screenSub}>
        The largest un-monetised asset any airline owns is the attention it
        already has. Tap each wait to see the earn moment in place.
      </p>
      <div className={styles.body}>
        <WaitStatesExplorer />
      </div>
    </>
  );
}
