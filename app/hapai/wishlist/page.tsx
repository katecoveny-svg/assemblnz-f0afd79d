import type { Metadata } from "next";
import { WishlistTool } from "@/components/hapai/WishlistTool";

export const metadata: Metadata = {
  title: "The wishlist — free SPARK tool",
  description:
    "Name one job you wish you could hand off. We draft the spec for the specialist assembl would build you — tailored to your business, built on NZ law, draft-only.",
  openGraph: {
    title: "The wishlist — free SPARK tool",
    description: "Name one job you wish you could hand off and get a tailored specialist spec.",
    images: ["/hapai/wishlist/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/hapai/wishlist/opengraph-image"],
  },
};

export default function HapaiWishlistPage() {
  return <WishlistTool />;
}
