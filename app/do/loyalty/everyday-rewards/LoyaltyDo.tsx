"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Pause,
  Play,
  Plus,
  Minus,
  Camera,
  Mic,
  ShoppingBag,
  Leaf,
  RotateCcw,
} from "lucide-react";
import {
  GroceryPhoto,
  sampleProvenance,
  type GroceryProvenance,
} from "./GroceryPhoto";
import { IngredientEditor } from "./IngredientEditor";
import {
  reviewIngredients,
  parseIngredientObservation,
  type IngredientRow,
} from "./ingredients";
import { DoGeminiLive } from "../../DoGeminiLive";
import { GlassIdentity } from "@/components/brand/GlassIdentity";
import {
  pantryTemplate,
  planShop,
  money,
  canApprove,
  meals,
  recipeDescriptions,
} from "./model";

import "./loyalty.css";

const sampleRows = (): IngredientRow[] =>
  pantryTemplate.map((p) => ({
    id: p.id,
    name: p.name,
    amount: p.quantity.amount,
    unit: p.quantity.unit,
    confirmed: true,
    source: "sample",
    uncertainty: "Illustrative sample quantity, not detected from the image.",
  }));
const steps = ["Your kitchen", "The plan", "Your basket", "Ready to review"];
export default function LoyaltyDo() {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [rows, setRows] = useState<IngredientRow[]>(sampleRows);
  const [provenance, setProvenance] =
    useState<GroceryProvenance>(sampleProvenance);
  const [ingredientNotice, setIngredientNotice] = useState("");
  const [recipe, setRecipe] = useState("pasta-night");
  const [budgetInput, setBudgetInput] = useState("40");
  const [usable, setUsable] = useState(false);
  const [servings, setServings] = useState(4);
  const [occasion, setOccasion] = useState("Family dinner");
  const [reviewed, setReviewed] = useState<string | null>(null);
  const [approved, setApproved] = useState<string | null>(null);
  const [reward, setReward] = useState<"available" | "skipped" | "kept">(
    "available",
  );
  const [notes, setNotes] = useState("");
  const [notesSource, setNotesSource] = useState("Manual notes");
  const [notesEdited, setNotesEdited] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [voice, setVoice] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const workspace = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const stock = reviewIngredients(rows);
  const budgetMinor = Math.round(Number(budgetInput) * 100);
  const budgetValid =
    /^\d+(?:\.\d{0,2})?$/.test(budgetInput) &&
    budgetMinor >= 100 &&
    budgetMinor <= 500000;
  const plan = planShop(
    stock.pantry,
    servings,
    usable && stock.issues.length === 0,
    budgetValid ? budgetMinor : 4000,
    recipe,
  );
  if (!budgetValid)
    plan.blockers.push(
      "Enter a valid NZD budget between $1 and $5,000 with at most two decimal places.",
    );
  const selectedRecipe = meals.find((m) => m.id === recipe)!;
  const revision = JSON.stringify([
    plan.digest,
    occasion,
    notes,
    notesSource,
    notesEdited,
    rows,
    provenance,
    budgetInput,
  ]);
  const approvedCurrent = approved === revision;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const frame = requestAnimationFrame(update);
    media.addEventListener("change", update);
    const visibility = () =>
      root.current?.toggleAttribute("data-hidden", document.hidden);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) =>
      root.current?.toggleAttribute("data-offscreen", !entry.isIntersecting),
    );
    const hero = root.current?.querySelector(".ld-hero");
    if (hero) observer.observe(hero);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);
  function move(next: number) {
    setStep(next);
    requestAnimationFrame(() => title.current?.focus());
  }
  function start() {
    setStarted(true);
    requestAnimationFrame(() => {
      workspace.current?.scrollIntoView({
        behavior: reduced || paused ? "instant" : "smooth",
        block: "start",
      });
      title.current?.focus({ preventScroll: true });
    });
  }
  function reset() {
    setStep(0);
    setUsable(false);
    setRows(sampleRows());
    setProvenance(sampleProvenance);
    setIngredientNotice("");
    setRecipe("pasta-night");
    setBudgetInput("40");
    setServings(4);
    setOccasion("Family dinner");
    setNotes("");
    setNotesSource("Manual notes");
    setNotesEdited(false);
    setReviewed(null);
    setApproved(null);
    setReward("available");
    setPhoto(false);
    setVoice(false);
  }
  function invalidate() {
    setUsable(false);
    setReviewed(null);
    setApproved(null);
  }
  function changeRows(next: IngredientRow[]) {
    const content = (values: IngredientRow[]) =>
      JSON.stringify(
        values.map(({ name, amount, unit }) => ({ name, amount, unit })),
      );
    if (content(next) !== content(rows))
      setProvenance((p) => ({ ...p, userEdited: true }));
    setRows(next);
    invalidate();
  }
  function applyObservation(
    next: IngredientRow[],
    text: string,
    source: GroceryProvenance,
  ) {
    setRows(next);
    setNotes(text);
    setNotesSource(
      source.source === "photo"
        ? "Vision observation"
        : "Synthetic photo observation",
    );
    setNotesEdited(source.userEdited);
    setProvenance(source);
    setIngredientNotice(
      "Review and confirm every imported ingredient. Unknown quantities are not zero.",
    );
    invalidate();
  }
  function mapNotes() {
    const parsed = parseIngredientObservation(notes, "voice");
    setIngredientNotice(parsed.notice);
    if (!parsed.rows.length) return;
    setRows(
      parsed.rows.map((r) => ({
        ...r,
        source: notesSource.includes("voice") ? "voice" : "manual",
      })),
    );
    setProvenance(
      notesSource === "Vision observation"
        ? { ...provenance, userEdited: true }
        : {
            source: notesSource.includes("voice") ? "voice" : "manual",
            model: null,
            imageHash: null,
            outputHash: null,
            createdAt: null,
            userEdited: true,
          },
    );
    invalidate();
  }
  function exportPlan() {
    const text = [
      "ASSEMBL · INDEPENDENT LOYALTY DO PROPOSAL",
      "SIMULATED HANDOFF · NO ORDER OR POINTS ISSUED",
      `${occasion} · ${selectedRecipe.name} · ${servings} people`,
      `Budget: NZ${money(budgetMinor)}; demo pickup fee NZ$0; actual fees unknown.`,
      `Observation provenance: ${JSON.stringify(provenance)}`,
      `Confirmed pantry: ${JSON.stringify(stock.pantry)}`,
      ...plan.basket.map(
        (l) => `${l.name}: ${l.packs} demo packs · ${money(l.estimatedMinor)}`,
      ),
      `Fictional basket total: NZ${money(plan.estimatedMinor)}`,
      "Demo pickup fee: NZ$0. Actual fees and stock unknown.",
      `Observation source: ${notes ? notesSource : "Synthetic sample; no model call"}${notesEdited ? "; edited by user" : ""}`,
      `Kitchen notes (user reviewed, not retailer instructions): ${notes || "None"}`,
      `Optional activity: ${reward}. No real rewards.`,
      "Retailer connection: absent. Approved product feed, account scope and cart/handoff agreement required.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "loyalty-do-simulated-handoff.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div
      className="loyalty-do"
      ref={root}
      data-paused={paused || reduced ? "" : undefined}
    >
      <div className="ld-proposal">
        Independent assembl proposal <span>·</span> Not affiliated with or
        endorsed by Woolworths NZ. No retailer connection.
      </div>
      <header className="ld-header">
        <a href="#top" className="ld-brand" aria-label="Loyalty DO concept">
          <span className="ld-do">
            DO<span>.</span>
          </span>
          <span>
            for everyday
            <br />
            <b>rewards</b>
          </span>
        </a>
        <div className="ld-header-actions">
          <button
            className="ld-motion"
            onClick={() => setPaused(!paused)}
            disabled={reduced}
            aria-pressed={paused || reduced}
          >
            {paused || reduced ? <Play size={15} /> : <Pause size={15} />}
            <span>
              {reduced
                ? "Motion reduced"
                : paused
                  ? "Play motion"
                  : "Pause motion"}
            </span>
          </button>
          <button className="ld-dark ld-top-start" onClick={start}>
            Try the concept <ArrowUpRight size={17} />
          </button>
        </div>
      </header>
      <article id="top">
        <section className="ld-hero" aria-labelledby="ld-hero-title">
          <Image
            className="ld-hero-image"
            unoptimized
            src="/loyalty/everyday-rewards/kitchen.jpg"
            alt="Synthetic kitchen still life: tomatoes, basil, aubergines and an orange shopping bag on a sunlit island"
            fill
            priority
            sizes="100vw"
          />
          <div className="ld-hero-copy">
            <h1 id="ld-hero-title">
              Everyday,
              <br />a little
              <br />
              <em>easier.</em>
            </h1>
            <p>
              Your kitchen. Tonight’s dinner.
              <br />A more thoughtful way to shop.
            </p>
            <button className="ld-dark ld-hero-cta" onClick={start}>
              Let’s make dinner <ArrowRight size={20} />
            </button>
            <span className="ld-caption">
              A loyalty DO concept for Woolworths NZ
            </span>
          </div>
          <div
            className="ld-reward-object"
            aria-label="Concept loyalty card, not a real membership card"
          >
            <div className="ld-object-top">
              <span>
                everyday
                <br />
                <b>possibilities.</b>
              </span>
              <ShoppingBag size={26} />
            </div>
            <p>
              A little less admin.
              <br />
              <strong>A little more life.</strong>
            </p>
            <div className="ld-object-bottom">
              <span>LOYALTY DO</span>
              <span>CONCEPT / NZ</span>
            </div>
          </div>
          <div className="ld-scene-note">
            <span className="ld-scene-line" />
            FROM WHAT YOU HAVE → TO WHAT YOU NEED
            <span>Synthetic concept artwork</span>
          </div>
        </section>
        <section className="ld-intro">
          <p>Good things come together.</p>
          <h2>
            Start with what’s in the kitchen.
            <br />
            <span>DO helps with what comes next.</span>
          </h2>
          <div>
            <span>
              <Leaf size={19} /> Use what you have
            </span>
            <span>
              <ShoppingBag size={19} /> Review what you need
            </span>
            <span>
              <Check size={19} /> Stay in control
            </span>
          </div>
        </section>
        <section
          className="ld-workspace"
          ref={workspace}
          id="try-the-concept"
          aria-label="Interactive loyalty DO demonstration"
        >
          <aside className="ld-side">
            <div className="ld-assistant">
              <GlassIdentity kind="do" size={46} />
              <div>
                <strong>Your loyalty DO</strong>
                <span>Fictional shopping demonstration</span>
              </div>
            </div>
            <nav aria-label="Your dinner plan">
              <ol>
                {steps.map((s, i) => (
                  <li key={s} aria-current={i === step ? "step" : undefined}>
                    <span>{i < step ? <Check size={16} /> : `0${i + 1}`}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </nav>
            <p className="ld-session">
              This demo stays in this tab.
              <br />
              No account, cart or reward balance is connected.
            </p>
            <button className="ld-text-button" onClick={reset}>
              <RotateCcw size={14} /> Reset demonstration
            </button>
          </aside>
          <div className="ld-task">
            <div className="ld-task-top">
              <span>SIMULATED · {String(step + 1).padStart(2, "0")} / 04</span>
              <span>YOU DECIDE. DO PREPARES.</span>
            </div>
            {step === 0 && (
              <>
                <h2 ref={title} tabIndex={-1}>
                  Dinner starts here.
                </h2>
                <p className="ld-lead">
                  Review the illustrative pantry or bring your own ingredients.
                  Photo and voice observations become candidates, never approved
                  stock.
                </p>
                <div className="ld-secondary-actions">
                  <button
                    onClick={() => setPhoto(!photo)}
                    aria-expanded={photo}
                  >
                    <Camera size={17} />
                    Review a fridge photo
                  </button>
                  <button
                    onClick={() => setVoice(!voice)}
                    aria-expanded={voice}
                  >
                    <Mic size={17} />
                    Talk through dinner
                  </button>
                </div>
                {photo && <GroceryPhoto onApply={applyObservation} />}
                {voice && (
                  <section className="ld-provider">
                    <h3>Voice planning with DO</h3>
                    <p>
                      Existing authenticated Google voice, with its own fresh
                      consent. Sign-in opens a new tab and returns to this
                      loyalty route. Keep this original tab open: your reviewed
                      dinner remains here. After signing in, return to this tab
                      and check availability. Closing or reloading this tab
                      loses the local draft; no private notes are put in the
                      sign-in URL.
                    </p>
                    <DoGeminiLive
                      signInReturnTo="/do/loyalty/everyday-rewards"
                      context="Help identify ingredients for a dinner plan. No merchant access or ordering. At the end, offer one ingredient per line in this exact format: Tomatoes | 400 | g. Use ? for unknown quantities or units. Do not invent quantities. The person must review every line and confirm food usability."
                      onDraft={(text) => {
                        setNotes(text);
                        setNotesSource("Reviewed DO voice notes");
                        setNotesEdited(false);
                        setIngredientNotice(
                          "Voice notes are ready below. Review them, then explicitly map ingredient lines; ordinary prose is never inferred as stock.",
                        );
                        invalidate();
                        return true;
                      }}
                    />
                  </section>
                )}
                <div className="ld-pantry">
                  <div className="ld-sample">
                    <Image
                      src="/loyalty/everyday-rewards/kitchen.jpg"
                      unoptimized
                      width={560}
                      height={420}
                      alt="Synthetic kitchen sample; quantities are separate illustrative fixtures"
                    />
                    <span>SYNTHETIC SAMPLE · NO MODEL CALL</span>
                  </div>
                  <div>
                    <h3>Use what you have.</h3>
                    <p>
                      Check identities, quantities and usability against your
                      kitchen. The photo cannot verify freshness, expiry or
                      hidden stock.
                    </p>
                    <p>
                      Planning covers three explicitly chosen sample recipes.
                      Other ingredients are retained in your pantry record, but
                      do not silently change a recipe.
                    </p>
                  </div>
                </div>
                <IngredientEditor rows={rows} onChange={changeRows} />
                {ingredientNotice && (
                  <p className="ld-ingredient-notice" role="status">
                    {ingredientNotice}
                  </p>
                )}
                {stock.issues.length > 0 && (
                  <p className="ld-ingredient-notice">
                    {stock.issues.join(" ")}
                  </p>
                )}
                {stock.uncovered.length > 0 && (
                  <p>
                    Outside the supported recipe catalogue:{" "}
                    {stock.uncovered.join(", ")}. These remain in your reviewed
                    pantry but are not used by the three sample recipes.
                  </p>
                )}
                <label className="ld-check">
                  <input
                    type="checkbox"
                    aria-label="Confirm entire pantry"
                    checked={usable}
                    disabled={stock.issues.length > 0}
                    onChange={(e) => {
                      setUsable(e.target.checked);
                      setReviewed(null);
                      setApproved(null);
                    }}
                  />
                  <span>
                    I’ve reviewed the complete pantry, including missing items.
                    All quantities are usable; a photo cannot prove food safety.
                  </span>
                </label>
                <label className="ld-notes">
                  Reviewed voice or written ingredient notes
                  <span>
                    Local text only. One ingredient per line: Tomatoes | 400 |
                    g. Use ? for unknown. No model runs when you type.
                  </span>
                  <textarea
                    aria-label="Ingredient notes"
                    value={notes}
                    maxLength={16000}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setNotesEdited(true);
                      setProvenance((p) => ({ ...p, userEdited: true }));
                      invalidate();
                    }}
                  />
                </label>
                <button
                  className="ld-text-button"
                  disabled={!notes.trim()}
                  onClick={mapNotes}
                >
                  Map reviewed notes to ingredient candidates
                </button>
                <div className="ld-next">
                  <p>
                    These are sample recipes. Check real product labels,
                    allergies and dietary suitability before cooking.
                  </p>
                  <button
                    className="ld-dark"
                    disabled={!usable || stock.issues.length > 0}
                    onClick={() => {
                      setStarted(true);
                      move(1);
                    }}
                  >
                    Make a plan <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h2 ref={title} tabIndex={-1}>
                  One good dinner.
                  <br />
                  Less to think about.
                </h2>
                <p className="ld-lead">
                  Choose a supported sample recipe. DO scales it and subtracts
                  your confirmed pantry; it does not invent a meal from
                  free-text notes.
                </p>
                <div className="ld-plan-paper">
                  <div className="ld-plan-heading">
                    <Leaf size={30} />
                    <span>Tonight, assembled.</span>
                  </div>
                  <h3>{selectedRecipe.name}</h3>
                  <p>
                    {recipeDescriptions[recipe]} Follow a suitable recipe and
                    check food safety before cooking.
                  </p>
                  <label>
                    Sample recipe
                    <select
                      aria-label="Sample recipe"
                      value={recipe}
                      onChange={(e) => {
                        setRecipe(e.target.value);
                        setReviewed(null);
                        setApproved(null);
                      }}
                    >
                      {meals.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Basket budget (NZD)
                    <input
                      aria-label="Basket budget NZD"
                      type="number"
                      min="1"
                      max="5000"
                      step="0.01"
                      value={budgetInput}
                      onChange={(e) => {
                        setBudgetInput(e.target.value);
                        setReviewed(null);
                        setApproved(null);
                      }}
                    />
                  </label>
                  <p>
                    Budget applies to fictional whole-pack prices plus a
                    simulated NZ$0 pickup fee. Actual retailer fees, stock and
                    prices are unknown. Increase the budget or change the plan
                    if the estimate exceeds it.
                  </p>
                  {!budgetValid && (
                    <p role="alert">
                      Enter a budget from NZ$1 to NZ$5,000, with at most two
                      decimal places.
                    </p>
                  )}
                  <label>
                    What’s the occasion?
                    <select
                      value={occasion}
                      onChange={(e) => {
                        setOccasion(e.target.value);
                        setReviewed(null);
                        setApproved(null);
                      }}
                    >
                      <option>Family dinner</option>
                      <option>Friends around the table</option>
                      <option>A quiet night in</option>
                    </select>
                  </label>
                  <div className="ld-servings">
                    <span>People at the table</span>
                    <div>
                      <button
                        aria-label="One fewer person"
                        disabled={servings <= 1}
                        onClick={() => {
                          setServings(servings - 1);
                          setReviewed(null);
                          setApproved(null);
                        }}
                      >
                        <Minus size={16} />
                      </button>
                      <output aria-live="polite">{servings}</output>
                      <button
                        aria-label="One more person"
                        disabled={servings >= 8}
                        onClick={() => {
                          setServings(servings + 1);
                          setReviewed(null);
                          setApproved(null);
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="ld-next">
                  <button className="ld-text-button" onClick={() => move(0)}>
                    Edit the kitchen
                  </button>
                  <button className="ld-dark" onClick={() => move(2)}>
                    Review the basket <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 ref={title} tabIndex={-1}>
                  Only what’s missing.
                </h2>
                <p className="ld-lead">
                  Your pantry comes first. Quantities scale with the plan; whole
                  demo packs cover the rest.
                </p>
                <div
                  className="ld-basket"
                  role="table"
                  aria-label="Fictional basket"
                >
                  <div role="row" className="ld-basket-head">
                    <span role="columnheader">Ingredient / pantry used</span>
                    <span role="columnheader">Demo packs</span>
                    <span role="columnheader">NZD</span>
                  </div>
                  {plan.basket.map((l) => (
                    <div role="row" key={l.ingredientId}>
                      <span role="cell">
                        <strong>{l.name}</strong>
                        <small>
                          {l.pantryUsed} {l.unit} from home · {l.needed}{" "}
                          {l.unit} needed
                          {l.leftover > 0
                            ? ` · ${l.leftover} ${l.unit} left over`
                            : ""}
                        </small>
                      </span>
                      <span role="cell">{l.packs || "At home"}</span>
                      <span role="cell">{money(l.estimatedMinor)}</span>
                    </div>
                  ))}
                </div>
                <div className="ld-total">
                  <div>
                    <span>Fictional basket total</span>
                    <small>
                      Budget NZ{money(budgetMinor)} · demo pickup fee NZ$0 ·
                      real fees & stock unknown
                    </small>
                  </div>
                  <strong>NZ{money(plan.estimatedMinor)}</strong>
                </div>
                <div className="ld-loyalty">
                  <h3>Rewards that make sense.</h3>
                  <p>
                    NZ programme guidance: 1 point per eligible NZ$1. 2,000
                    points convert to a NZ$15 voucher for a future eligible shop
                    of at least NZ$15 after discounts. Exclusions apply,
                    including fulfilment fees.
                  </p>
                  <p>
                    EasyBoost can activate weekly and featured ProductBoosts
                    when you open the app before shopping. Other Boost types
                    differ. Check your own account’s offer and conditions; an
                    advert is not eligibility. Substitutions may affect points.
                  </p>
                  <p>
                    <strong>
                      No offer was activated. No points were calculated or
                      issued here.
                    </strong>{" "}
                    We never add something you don’t need just for points.
                  </p>
                  <a
                    href="https://www.everydayrewards.co.nz/terms-and-conditions/product-boost"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read official NZ ProductBoost terms{" "}
                    <ArrowUpRight size={14} />
                  </a>
                </div>
                {plan.blockers.length > 0 && (
                  <p role="alert">
                    {plan.blockers.join(". ")}. Go back and edit the plan.
                  </p>
                )}
                <label className="ld-check">
                  <input
                    type="checkbox"
                    aria-label="Confirm simulated basket"
                    checked={reviewed === revision}
                    onChange={(e) =>
                      setReviewed(e.target.checked ? revision : null)
                    }
                  />
                  <span>
                    I’ve reviewed this simulated basket, pack quantities and
                    fictional prices. Nothing will be ordered.
                  </span>
                </label>
                <div className="ld-next">
                  <button className="ld-text-button" onClick={() => move(1)}>
                    Edit the plan
                  </button>
                  <button
                    className="ld-dark"
                    disabled={!canApprove(reviewed, revision, plan.blockers)}
                    onClick={() => move(3)}
                  >
                    Continue to handoff <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 ref={title} tabIndex={-1}>
                  {approvedCurrent
                    ? "Ready for a real conversation."
                    : "Your plan. Your call."}
                </h2>
                <p className="ld-lead">
                  {approvedCurrent
                    ? "A reviewed preparation receipt shows exactly what this concept did — and where a retailer partnership would begin."
                    : "The next step would be an approved retailer handoff. This concept prepares a local receipt only."}
                </p>
                {!approvedCurrent && (
                  <div className="ld-optional">
                    <span>OPTIONAL · WHILE YOU REVIEW</span>
                    <h3>A useful little extra.</h3>
                    <p>
                      Take a moment to check how you’ll store leftover
                      ingredients. In a future partner programme, an optional
                      useful task could carry a funded reward. There is no
                      processing delay to wait through here.
                    </p>
                    {reward === "available" ? (
                      <div>
                        <button onClick={() => setReward("kept")}>
                          I’ve checked the leftovers
                        </button>
                        <button
                          className="ld-text-button"
                          onClick={() => setReward("skipped")}
                        >
                          Skip and continue
                        </button>
                      </div>
                    ) : (
                      <p role="status">
                        {reward === "kept"
                          ? "Demo acknowledgement recorded once. No points, cash value or Everyday Rewards benefit."
                          : "Skipped. Your dinner plan is unchanged."}
                      </p>
                    )}
                    <small>
                      Proposed reward opportunity only. No sponsor funding or
                      points issuance is connected.
                    </small>
                  </div>
                )}
                <div className="ld-receipt">
                  <h3>
                    {approvedCurrent
                      ? "Preparation receipt"
                      : "Handoff preview"}
                  </h3>
                  <dl>
                    <div>
                      <dt>Kitchen</dt>
                      <dd>
                        {stock.pantry.length} confirmed ingredient rows ·{" "}
                        {provenance.source} source
                        {notes ? " + reviewed notes" : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Observation source</dt>
                      <dd>
                        {notes
                          ? notesSource
                          : "Synthetic sample · no model call"}
                        {notesEdited ? " · user-edited" : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Photo provenance</dt>
                      <dd>
                        {provenance.source === "photo" ? (
                          <>
                            <span>
                              Model: {provenance.model}; observed{" "}
                              {provenance.createdAt}
                            </span>
                            <br />
                            <span>Image hash: {provenance.imageHash}</span>
                            <br />
                            <span>
                              Original output hash: {provenance.outputHash}
                            </span>
                            <br />
                            <span>
                              User edited:{" "}
                              {provenance.userEdited || notesEdited
                                ? "yes"
                                : "no"}
                              . Hash identifies the original provider evidence,
                              not the corrected quantities. Raw image not
                              retained in receipt.
                            </span>
                          </>
                        ) : (
                          `${provenance.source}: no image/model fingerprint. User edited: ${provenance.userEdited || notesEdited ? "yes" : "no"}.`
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Recipe and budget</dt>
                      <dd>
                        {selectedRecipe.name} · NZ{money(budgetMinor)} budget ·
                        simulated NZ$0 pickup fee
                      </dd>
                    </div>
                    <div>
                      <dt>Calculation</dt>
                      <dd>Shared DO Shop preparation · {servings} servings</dd>
                    </div>
                    <div>
                      <dt>Basket</dt>
                      <dd>NZ{money(plan.estimatedMinor)} · fictional prices</dd>
                    </div>
                    <div>
                      <dt>Retailer execution</dt>
                      <dd>Not connected · no cart write or checkout</dd>
                    </div>
                    <div>
                      <dt>Rewards</dt>
                      <dd>No account access, balance change or real points</dd>
                    </div>
                    <div>
                      <dt>Next integration gate</dt>
                      <dd>
                        Approved product feed, account permissions and retailer
                        handoff agreement
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="ld-next">
                  <button className="ld-text-button" onClick={() => move(2)}>
                    Back to basket
                  </button>
                  {approvedCurrent ? (
                    <button className="ld-dark" onClick={exportPlan}>
                      Download demo receipt <ArrowUpRight size={18} />
                    </button>
                  ) : (
                    <button
                      className="ld-dark"
                      disabled={!canApprove(reviewed, revision, plan.blockers)}
                      onClick={() => setApproved(revision)}
                    >
                      Approve simulated handoff <Check size={18} />
                    </button>
                  )}
                </div>
                {approvedCurrent && (
                  <p className="ld-success" role="status">
                    <Check size={18} /> Prepared in this tab. Nothing sent to
                    Woolworths.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
        <section className="ld-outro">
          <h2>
            A loyalty programme
            <br />
            that helps with <em>life.</em>
          </h2>
          <p>
            That’s the possibility. One familiar DO, helping the household make
            a plan, make a choice, and keep control of the next step.
          </p>
          <button
            className="ld-outline"
            onClick={() => {
              reset();
              start();
            }}
          >
            {started ? "Try another dinner" : "Explore the concept"}{" "}
            <ArrowRight size={18} />
          </button>
        </section>
      </article>
      <footer className="ld-footer">
        <div>
          <strong>assembl</strong>
          <p>
            Independent partner proposal · October 2026.
            <br />
            Synthetic artwork, recipes, prices and stock. No commercial
            relationship implied.
          </p>
        </div>
        <nav aria-label="Legal and programme information">
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <a
            href="https://www.everydayrewards.co.nz/terms-and-conditions"
            target="_blank"
            rel="noreferrer"
          >
            Official NZ programme terms <ArrowUpRight size={14} />
          </a>
        </nav>
      </footer>
    </div>
  );
}
