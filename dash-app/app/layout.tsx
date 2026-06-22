import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dash — get paid for the wait",
  description: "An opt-in reward layer for AI agent wait time. A product of Assembl.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
