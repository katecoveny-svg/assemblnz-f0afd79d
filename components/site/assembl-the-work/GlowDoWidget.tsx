"use client";

import Script from "next/script";
import Link from "next/link";

/** The same working companion as the embed and Chrome extension. Its draft survives SPA navigation. */
export function GlowDoWidget() {
  return <>
    <Script src="/api/do/widget" strategy="afterInteractive" />
    <noscript><Link href="/do/widget">Open DO workspace</Link></noscript>
  </>;
}
