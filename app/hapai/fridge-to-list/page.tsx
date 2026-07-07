import type { Metadata } from "next";
import { FridgeToList } from "@/components/hapai/FridgeToList";

export const metadata: Metadata = {
  title: "Fridge to shopping list — assembl SPARK",
  description: "Upload a fridge photo and get a NZ kai meal plan with a supermarket-aisle shopping list.",
};

export default function FridgeToListPage() {
  return <FridgeToList context="hapai" />;
}
