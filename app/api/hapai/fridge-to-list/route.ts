import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DATA_URI_LENGTH = 8 * 1024 * 1024 * 1.38;

type FridgeResult = {
  spotted: string[];
  runningLow: string[];
  meals: Array<{ name: string; mainIngredients: string[]; extraNeeded: string[] }>;
  shoppingList: Array<{ aisle: string; items: string[] }>;
};

function fallbackResult(): FridgeResult {
  return {
    spotted: ["milk", "eggs", "cheese", "lettuce", "yoghurt"],
    runningLow: ["fresh fruit", "bread", "vegetables for dinners"],
    meals: [
      { name: "Omelette and salad", mainIngredients: ["eggs", "cheese", "lettuce"], extraNeeded: ["capsicum", "tomatoes"] },
      { name: "Yoghurt breakfast bowls", mainIngredients: ["yoghurt"], extraNeeded: ["bananas", "muesli"] },
      { name: "Toasties and vege sticks", mainIngredients: ["cheese"], extraNeeded: ["bread", "carrots"] },
    ],
    shoppingList: [
      { aisle: "Produce", items: ["bananas", "tomatoes", "capsicum", "carrots", "kūmara"] },
      { aisle: "Dairy & chilled", items: ["milk top-up"] },
      { aisle: "Pantry / dry goods", items: ["muesli", "pasta"] },
      { aisle: "Meat / fish", items: ["mince or vegetarian protein"] },
      { aisle: "Bakery", items: ["bread"] },
      { aisle: "Frozen", items: ["mixed vegetables"] },
    ],
  };
}

function cleanResult(value: unknown): FridgeResult {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const meals = Array.isArray(data.meals) ? data.meals : [];
  const shoppingList = Array.isArray(data.shoppingList) ? data.shoppingList : [];
  return {
    spotted: Array.isArray(data.spotted) ? data.spotted.map(String).slice(0, 40) : [],
    runningLow: Array.isArray(data.runningLow) ? data.runningLow.map(String).slice(0, 30) : [],
    meals: meals.slice(0, 5).map((meal) => {
      const row = meal && typeof meal === "object" ? (meal as Record<string, unknown>) : {};
      return {
        name: String(row.name ?? "Meal idea"),
        mainIngredients: Array.isArray(row.mainIngredients) ? row.mainIngredients.map(String).slice(0, 12) : [],
        extraNeeded: Array.isArray(row.extraNeeded) ? row.extraNeeded.map(String).slice(0, 12) : [],
      };
    }),
    shoppingList: shoppingList.slice(0, 8).map((section) => {
      const row = section && typeof section === "object" ? (section as Record<string, unknown>) : {};
      return {
        aisle: String(row.aisle ?? "Other"),
        items: Array.isArray(row.items) ? row.items.map(String).slice(0, 30) : [],
      };
    }),
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const imageBase64 = String(body?.imageBase64 ?? "");
  const householdSize = Number(body?.householdSize ?? 4);
  const daysToCover = Number(body?.daysToCover ?? 5);
  const budget = String(body?.budget ?? "normal");

  if (!imageBase64.startsWith("data:image/")) {
    return NextResponse.json({ error: "Upload a fridge, pantry, or cupboard photo first." }, { status: 400 });
  }
  if (imageBase64.length > MAX_DATA_URI_LENGTH) {
    return NextResponse.json({ error: "Please upload an image under 8MB." }, { status: 413 });
  }
  if (!["tight", "normal", "generous"].includes(budget)) {
    return NextResponse.json({ error: "Choose a budget setting." }, { status: 400 });
  }

  const payload = {
    imageBase64,
    householdSize: Math.min(8, Math.max(1, householdSize)),
    daysToCover: Math.min(14, Math.max(1, daysToCover)),
    dietaryNotes: String(body?.dietaryNotes ?? "").trim().slice(0, 500),
    budget,
  };

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const service = getServiceClient();
      const { data, error } = await service.functions.invoke("fridge-to-list", { body: payload });
      if (!error && data) return NextResponse.json(cleanResult(data));
    }
  } catch (error) {
    console.error("[hapai/fridge-to-list] function failed", error);
  }

  return NextResponse.json(fallbackResult());
}
