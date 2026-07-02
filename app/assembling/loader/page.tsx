import type { Metadata } from 'next';
import '@/styles/dash-tokens.css';
import { dashFontVars } from '../fonts';
import { ConsumerDemo } from './ConsumerDemo';
import page from './loader.module.css';

export const metadata: Metadata = {
  title: 'assembling. loader — get paid to wait',
  description:
    'Swap your default spinner for Assembling. While you wait, a small NZ-brand line earns revenue — keep it, or donate it to SPCA NZ, Trees That Count or Foodbank NZ. Opt-in, Privacy Act 2020 native.',
  alternates: { canonical: '/assembling/loader' },
};

export default function DashLoaderLandingPage() {
  return (
    <main className={`${page.shell} ${dashFontVars}`} data-dash="">
      <div className={page.inner}>
        <section>
          <span className={page.eyebrow}>Mahi for good · opt-in loader</span>
          <h1 className={page.title}>Get paid to wait.</h1>
          <p className={page.lead}>
            Swap your default spinner for Assembling. While you wait, a small NZ-brand line earns
            revenue. You choose where it goes — keep it, or fund something good. Off by default.
            Your content is never read.
          </p>
          <div className={page.taglines}>
            <span className={page.tag}>Mahi for Good.</span>
            <span className={page.tag}>Watch. Wait. Earn.</span>
            <span className={page.tag}>Built with tikanga values.</span>
          </div>
        </section>

        <ConsumerDemo />
      </div>
    </main>
  );
}
