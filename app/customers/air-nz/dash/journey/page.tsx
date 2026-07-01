import styles from '../airnz.module.css';
import { AirNzHeader, ConceptTop } from '@/components/customers/air-nz/chrome';
import { JourneyDemo } from '@/components/customers/air-nz/JourneyDemo';

const BASE = '/customers/air-nz/dash';

export default function AirNzJourneyPage() {
  return (
    <>
      <AirNzHeader back={BASE} />
      <ConceptTop />
      <div className={styles.screenEyebrow}>One journey · one earn ecosystem</div>
      <h1 className={styles.screenTitle}>Trip journey</h1>
      <p className={styles.screenSub}>
        Walk one domestic trip end to end. Every wait state you already give Air
        New Zealand earns Airpoints Dollars in the moment.
      </p>
      <JourneyDemo />
    </>
  );
}
