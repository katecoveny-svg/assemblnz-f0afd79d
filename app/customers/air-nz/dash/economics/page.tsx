import styles from '../airnz.module.css';
import { AirNzHeader, ConceptTop } from '@/components/customers/air-nz/chrome';
import { EconomicsCalculator } from '@/components/customers/air-nz/EconomicsCalculator';

const BASE = '/customers/air-nz/dash';

export default function AirNzEconomicsPage() {
  return (
    <>
      <AirNzHeader back={BASE} />
      <ConceptTop />
      <div className={styles.screenEyebrow}>More › Unit economics</div>
      <h1 className={styles.screenTitle}>The maths, live</h1>
      <p className={styles.screenSub}>
        Publicly sourced Air New Zealand inputs, assembl canon assumptions marked.
        Drag the sliders — Year 1 gross recomputes in the moment.
      </p>
      <EconomicsCalculator />
    </>
  );
}
