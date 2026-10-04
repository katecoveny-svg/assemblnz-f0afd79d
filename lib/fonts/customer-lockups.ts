import localFont from 'next/font/local';

// Same Cormorant Garamond 4.001 and 500–600 weight range as the previous
// Google loader. Local assets avoid its intermittent Turbopack query failure.
export const airNzLockup = localFont({
  src: './assets/cormorant-garamond-normal.woff2',
  weight: '500 600',
  style: 'normal',
  variable: '--airnz-lockup',
  display: 'swap',
  fallback: ['Times New Roman'],
});

export const contactLockup = localFont({
  src: './assets/cormorant-garamond-normal.woff2',
  weight: '500 600',
  style: 'normal',
  variable: '--contact-lockup',
  display: 'swap',
  fallback: ['Times New Roman'],
});
