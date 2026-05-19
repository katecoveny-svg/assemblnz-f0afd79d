import type { Metadata } from "next";
import { FoodTempLog } from "@/components/hapai/FoodTempLog";

export const metadata: Metadata = {
  title: "Food temperature log",
  description: "A free daily food safety temperature and cleaning record for hospitality operators.",
};

export default function HapaiFoodTempLogPage() {
  return <FoodTempLog context="hapai" />;
}
