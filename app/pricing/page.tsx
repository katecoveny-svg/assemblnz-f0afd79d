import type { Metadata } from "next";
import { CinematicPricing } from "@/components/site/cinematic/CinematicPricing";

export const metadata: Metadata = {
  title: "assembl · pricing",
  description: "Agents prepare. People decide. assembl pricing.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const checkoutConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  return <CinematicPricing checkoutConfigured={checkoutConfigured} />;
}
