import type { Metadata } from 'next';
import '@/styles/dash-tokens.css';
import { dashFontVars } from '../fonts';
import { DashDemoLab } from './DashDemoLab';
import page from './page.module.css';

export const metadata: Metadata = {
  title: 'dash. loader — three-mode demo',
  description:
    'The Dash Loader in all three modes — consumer opt-in, whitelabel, and publisher — cycling through idle, processing, success and error.',
  robots: { index: false },
};

export default function DashDemoPage() {
  return (
    <main className={`${page.shell} ${dashFontVars}`} data-dash="">
      <header className={page.header}>
        <span className={page.eyebrow}>Component · three-mode loader</span>
        <h1 className={page.title}>
          dash<span className={page.dot}>.</span> loader
        </h1>
        <p className={page.sub}>
          One dachshund, three revenue flows. Consumer opt-in, whitelabel, and publisher — each
          cycling idle, processing, success and error. Sponsored labelling is always on in the ad
          modes; the palette is locked.
        </p>
      </header>
      <div className={page.labWrap}>
        <DashDemoLab />
      </div>
    </main>
  );
}
