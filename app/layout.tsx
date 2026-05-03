import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Assembl — Autonomous AI agents for New Zealand business",
    template: "%s · Assembl",
  },
  description:
    "Industry-specific kete that cite legislation, produce evidence packs, and pass auditor scrutiny. Built in Aotearoa.",
  metadataBase: new URL("https://assembl.nz"),
  openGraph: {
    title: "Assembl — Autonomous AI agents for New Zealand business",
    description:
      "Industry-specific kete that cite legislation, produce evidence packs, and pass auditor scrutiny.",
    type: "website",
    locale: "en_NZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ">
      <body>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
