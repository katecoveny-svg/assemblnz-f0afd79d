import type { Metadata } from "next";
import { AdminTaxCalculator } from "@/components/hapai/AdminTaxCalculator";

export const metadata: Metadata = {
  title: "The admin tax calculator — free SPARK tool",
  description:
    "Add up the unbilled admin hours your team loses each week and see the annual cost — then where a kete pack could claw it back.",
  openGraph: {
    title: "The admin tax calculator — free SPARK tool",
    description:
      "See what unbilled admin hours cost your team each year — and how much you could claw back.",
    images: ["/hapai/admin-tax/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/hapai/admin-tax/opengraph-image"],
  },
};

export default function HapaiAdminTaxPage() {
  return <AdminTaxCalculator />;
}
