"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Copy, Download } from "lucide-react";

type FridgeResult = {
  spotted: string[];
  runningLow: string[];
  meals: Array<{ name: string; mainIngredients: string[]; extraNeeded: string[] }>;
  shoppingList: Array<{ aisle: string; items: string[] }>;
};

export function FridgeToList({ context = "hapai" }: { context?: "hapai" | "toro" }) {
  const [imageBase64, setImageBase64] = useState("");
  const [householdSize, setHouseholdSize] = useState(4);
  const [daysToCover, setDaysToCover] = useState(5);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [budget, setBudget] = useState<"tight" | "normal" | "generous">("normal");
  const [result, setResult] = useState<FridgeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const copy = context === "toro"
    ? {
        backHref: "/kete/toro",
        backLabel: "Tōro",
        eyebrow: "Tōro · kai planner",
        h1: "Photo the fridge. Plan this week's kai.",
        body: "Upload a fridge, pantry, or cupboard photo. Tōro turns it into meal ideas and a supermarket-aisle list for your whānau.",
        household: "Your whānau",
        button: "Plan this week's kai",
      }
    : {
        backHref: "/hapai",
        backLabel: "HAPAI library",
        eyebrow: "HAPAI · fridge to shopping list",
        h1: "Photo in. Shopping list out.",
        body: "Upload a fridge, pantry, or cupboard photo. Get meal ideas and a supermarket-aisle shopping list tuned for NZ kai conventions.",
        household: "Your household",
        button: "Generate shopping list",
      };

  const textOutput = useMemo(() => {
    if (!result) return "";
    return [
      "What's in your fridge",
      ...result.spotted.map((item) => `- ${item}`),
      "",
      "Running low / replace this week",
      ...result.runningLow.map((item) => `- ${item}`),
      "",
      "Suggested meals",
      ...result.meals.map((meal) => `- ${meal.name}: ${meal.mainIngredients.join(", ")}${meal.extraNeeded.length ? `; add ${meal.extraNeeded.join(", ")}` : ""}`),
      "",
      "Shopping list",
      ...result.shoppingList.flatMap((section) => [section.aisle, ...section.items.map((item) => `- ${item}`), ""]),
    ].join("\n");
  }, [result]);

  async function handleFile(file?: File) {
    setError("");
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Please upload an image under 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageBase64(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  async function generate() {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/hapai/fridge-to-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, householdSize, daysToCover, dietaryNotes, budget }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not read the photo.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the photo.");
    } finally {
      setLoading(false);
    }
  }

  function downloadTxt() {
    const blob = new Blob([textOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shopping-list.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 text-[#23211F] md:px-12 md:py-16">
      <div className="mx-auto max-w-[920px]">
        <Link href={copy.backHref} className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#2B6B57]">
          <ArrowLeft className="h-3.5 w-3.5" /> {copy.backLabel}
        </Link>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#6B6661]">{copy.eyebrow}</p>
        <h1 className="mt-3 font-display text-[38px] font-normal leading-tight md:text-[52px]">{copy.h1}</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#5A5550]">{copy.body}</p>

        <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-7">
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Fridge / pantry photo</span>
            <input type="file" accept="image/*" capture="environment" onChange={(event) => handleFile(event.target.files?.[0])} className="sr-only" id="fridge-photo" />
            <span className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[rgba(35,33,31,0.22)] bg-[#F7F4EE] p-5 text-center">
              {imageBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageBase64} alt="Uploaded fridge preview" className="max-h-[320px] rounded-[10px] object-contain" />
              ) : (
                <>
                  <Camera className="h-10 w-10 text-[#2B6B57]" />
                  <span className="mt-3 text-sm text-[#5A5550]">Tap to upload or take a photo</span>
                </>
              )}
            </span>
          </label>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Slider label={copy.household} value={householdSize} min={1} max={8} onChange={setHouseholdSize} />
            <Slider label="Days to cover" value={daysToCover} min={1} max={14} onChange={setDaysToCover} />
          </div>
          <label className="mt-5 block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Dietary notes</span>
            <textarea value={dietaryNotes} onChange={(event) => setDietaryNotes(event.target.value)} className="min-h-[96px] w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] p-3 outline-none focus:border-[#2B6B57] focus:bg-white" placeholder="vegetarian, no dairy, kid-friendly, school lunches..." />
          </label>
          <fieldset className="mt-5">
            <legend className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Budget</legend>
            <div className="flex flex-wrap gap-2">
              {(["tight", "normal", "generous"] as const).map((option) => (
                <label key={option} className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${budget === option ? "border-[#2B6B57] bg-[#2B6B57] text-white" : "border-[rgba(35,33,31,0.16)] text-[#5A5550]"}`}>
                  <input type="radio" checked={budget === option} onChange={() => setBudget(option)} className="sr-only" />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" onClick={generate} disabled={loading || !imageBase64} className="mt-6 rounded-full bg-[#23211F] px-6 py-3 text-sm font-medium text-white hover:bg-[#2B6B57] disabled:bg-[#C8C2BC]">{loading ? "Reading the photo..." : copy.button}</button>
          {loading && <p className="mt-4 rounded-[10px] border border-[#D4A853]/30 bg-[#FFF9EC] px-4 py-3 text-sm italic text-[#6B5A28]">Building a kai plan from the photo.</p>}
          {error && <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>}
        </section>

        {result && (
          <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-7">
            <ResultList title="What's in your fridge" items={result.spotted} empty="Nothing confidently spotted." />
            <ResultList title="Running low / replace this week" items={result.runningLow} empty="Nothing obvious." />
            <h2 className="mt-8 font-display text-2xl font-normal text-[#2B6B57]">Suggested meals</h2>
            <div className="mt-3 grid gap-3">
              {result.meals.map((meal) => (
                <article key={meal.name} className="rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#F7F4EE] p-4">
                  <h3 className="font-medium">{meal.name}</h3>
                  <p className="mt-2 text-sm text-[#5A5550]">Use: {meal.mainIngredients.join(", ") || "what you have"}</p>
                  <p className="mt-1 text-sm text-[#5A5550]">Add: {meal.extraNeeded.join(", ") || "nothing extra"}</p>
                </article>
              ))}
            </div>
            <h2 className="mt-8 font-display text-2xl font-normal text-[#2B6B57]">Shopping list</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {result.shoppingList.map((section) => <ResultList key={section.aisle} title={section.aisle} items={section.items} empty="No items." compact />)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => navigator.clipboard.writeText(textOutput)} className="inline-flex items-center gap-2 rounded-full bg-[#23211F] px-5 py-3 text-sm font-medium text-white hover:bg-[#2B6B57]"><Copy className="h-4 w-4" /> Copy list</button>
              <button type="button" onClick={downloadTxt} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#23211F]"><Download className="h-4 w-4" /> Download .txt</button>
              <button type="button" className="rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550]">Add to Tōro week plan</button>
            </div>
            {/* TODO 2026-Q3: post the meal plan to Tōro week-view via tenant_kete_data — link this tool into the broader Tōro family workflow when Tōro tenant onboarding is shipped. For now it's standalone at both routes. */}
          </section>
        )}
      </div>
    </main>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">{label}: {value}</span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#2B6B57]" />
    </label>
  );
}

function ResultList({ title, items, empty, compact = false }: { title: string; items: string[]; empty: string; compact?: boolean }) {
  return (
    <div className={compact ? "rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#F7F4EE] p-4" : "mt-6"}>
      <h2 className="font-display text-2xl font-normal text-[#2B6B57]">{title}</h2>
      {items.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#2A2825]">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm italic text-[#6B6661]">{empty}</p>}
    </div>
  );
}
