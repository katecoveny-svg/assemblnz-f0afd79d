import type { Metadata } from "next";
import { FoodTempLog } from "@/components/hapai/FoodTempLog";

export const metadata: Metadata = {
  title: "Manaaki food temperature log",
  description: "Daily Food Act 2014 temperature and cleaning records for hospitality teams.",
};

export default function ManaakiFoodTempLogPage() {
  return <FoodTempLog context="manaaki" />;
}
