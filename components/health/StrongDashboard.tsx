'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Dumbbell,
  ExternalLink,
  HeartPulse,
  Home,
  ListChecks,
  RotateCcw,
  Salad,
  ShieldCheck,
  ShoppingBasket,
  Store,
  Utensils,
  Waves,
} from 'lucide-react';
import {
  FICTIONAL_STRONG_PROFILE,
  RECIPES,
  STRONG_AGENTS,
  WEEK_MEAL_PLAN,
} from '@/lib/health/strong/catalogue';
import {
  buildSession,
  buildSessionCalendarFile,
  buildShoppingListText,
  buildTwelveWeekProgramme,
  compileShoppingList,
  findMealSwap,
  recipesForDay,
  replaceMeal,
  retailerHandoffUrl,
  totalDayNutrition,
  type Retailer,
  type SwapMode,
} from '@/lib/health/strong/engine';
import type { MealPlanDay, ShoppingItem, TrainingLocation } from '@/lib/health/strong/schema';
import styles from './strong-dashboard.module.css';

type TabId = 'today' | 'programme' | 'meals' | 'shop' | 'agents';

const TABS: Array<{ id: TabId; label: string; icon: typeof Home }> = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'programme', label: '12 weeks', icon: Dumbbell },
  { id: 'meals', label: 'Meals', icon: Salad },
  { id: 'shop', label: 'Shop', icon: ShoppingBasket },
  { id: 'agents', label: 'Agents', icon: Activity },
];

const LOCATION_LABEL: Record<TrainingLocation, string> = {
  home: 'Home',
  gym: 'Gym',
  pilates: 'Pilates',
};

const SWAP_LABELS: Array<{ mode: SwapMode; label: string }> = [
  { mode: 'faster', label: 'Faster' },
  { mode: 'higher-protein', label: 'Higher protein' },
  { mode: 'vegetarian', label: 'Vegetarian' },
  { mode: 'family', label: 'Family-friendly' },
];

const NZ_TODAY = new Intl.DateTimeFormat('en-NZ', {
  weekday: 'long',
  timeZone: 'Pacific/Auckland',
}).format(new Date());

export function StrongDashboard() {
  const profile = FICTIONAL_STRONG_PROFILE;
  const [tab, setTab] = useState<TabId>('today');
  const [location, setLocation] = useState<TrainingLocation>('home');
  const [minutes, setMinutes] = useState(35);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>(WEEK_MEAL_PLAN);
  const [selectedDay, setSelectedDay] = useState(0);
  const [retailer, setRetailer] = useState<Retailer>('woolworths');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

  const session = useMemo(() => buildSession(profile, location, minutes), [location, minutes, profile]);
  const programme = useMemo(() => buildTwelveWeekProgramme(profile.trainingDays), [profile.trainingDays]);
  const shopping = useMemo(() => compileShoppingList(mealPlan), [mealPlan]);
  const day = mealPlan[selectedDay];
  const dayRecipes = recipesForDay(day);
  const selectedDayNutrition = totalDayNutrition(day);
  const todayPlan = mealPlan.find((entry) => entry.day === NZ_TODAY) ?? mealPlan[0];
  const todayNutrition = totalDayNutrition(todayPlan);

  function swapDinner(mode: SwapMode) {
    const currentId = day.recipeIds[3];
    const replacement = findMealSwap(currentId, mode, profile);
    setMealPlan((current) => current.map((entry, index) => index === selectedDay ? replaceMeal(entry, currentId, replacement.id) : entry));
    setNotice(replacement.id === currentId ? 'No closer swap matches those rules yet.' : `${replacement.name} is now ${day.day} dinner.`);
  }

  async function copyShoppingList() {
    try {
      await navigator.clipboard.writeText(buildShoppingListText(shopping));
      setNotice('Shopping list copied. Review it in the retailer app before buying.');
    } catch {
      setNotice('The browser could not copy the list. Use the visible checklist or allow clipboard access and try again.');
    }
  }

  function downloadCalendarFile() {
    const blob = new Blob([buildSessionCalendarFile(session)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'strong-session.ics';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Tentative session calendar file downloaded.');
  }

  function toggleShoppingItem(item: ShoppingItem) {
    const key = `${item.aisle}|${item.name}|${item.unit}`;
    setCheckedItems((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroTopline}>
          <Link href="/" className={styles.wordmark}>assembl</Link>
          <span className={styles.sampleBadge}>fictional sample · adults 18+</span>
        </div>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>assembl health · first programme</p>
            <h1 className={styles.heroTitle}>Strong<span>.</span></h1>
            <p className={styles.heroCopy}>
              A 12-week operating system for movement, food and recovery. Switch the session, swap the meal,
              and take one reviewed list into the week.
            </p>
          </div>
          <div className={styles.heroSignal}>
            <div className={styles.signalOrb} aria-hidden>
              <HeartPulse />
            </div>
            <p>Today’s destination</p>
            <strong>Build strength. Eat enough. Recover well.</strong>
          </div>
        </div>
        <nav className={styles.tabs} aria-label="Strong dashboard sections">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={tab === item.id ? 'page' : undefined}
                className={tab === item.id ? styles.tabActive : styles.tab}
                onClick={() => setTab(item.id)}
              >
                <Icon aria-hidden /> {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className={styles.main}>
        {notice ? (
          <div className={styles.notice} role="status">
            <Check aria-hidden /> {notice}
            <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button>
          </div>
        ) : null}
        {tab === 'today' ? (
          <TodayView
            profileName={profile.displayName}
            location={location}
            minutes={minutes}
            session={session}
            protein={todayNutrition.proteinGrams}
            proteinTarget={profile.nutritionTargets.proteinGrams}
            onLocation={setLocation}
            onMinutes={setMinutes}
            onCalendar={downloadCalendarFile}
            onStart={() => setNotice('Session opened in review mode. Movements marked “review” still need clinician clearance.')}
            onOpenMeals={() => setTab('meals')}
          />
        ) : null}
        {tab === 'programme' ? <ProgrammeView programme={programme} onToday={() => setTab('today')} /> : null}
        {tab === 'meals' ? (
          <MealsView
            mealPlan={mealPlan}
            selectedDay={selectedDay}
            recipes={dayRecipes}
            totals={selectedDayNutrition}
            onDay={setSelectedDay}
            onSwap={swapDinner}
            onShop={() => setTab('shop')}
          />
        ) : null}
        {tab === 'shop' ? (
          <ShopView
            items={shopping}
            retailer={retailer}
            checkedItems={checkedItems}
            onRetailer={setRetailer}
            onCheck={toggleShoppingItem}
            onCopy={copyShoppingList}
          />
        ) : null}
        {tab === 'agents' ? <AgentsView /> : null}
      </main>

      <footer className={styles.safetyFooter}>
        <ShieldCheck aria-hidden />
        <div>
          <strong>General planning tool, not clinical care.</strong>
          <p>
            Strong applies restrictions entered by the user or clinician. It does not diagnose, prescribe treatment,
            set medication doses, or decide that an exercise is medically safe. Nutrition figures are sample estimates.
          </p>
        </div>
      </footer>
    </div>
  );
}

function TodayView({
  profileName,
  location,
  minutes,
  session,
  protein,
  proteinTarget,
  onLocation,
  onMinutes,
  onCalendar,
  onStart,
  onOpenMeals,
}: {
  profileName: string;
  location: TrainingLocation;
  minutes: number;
  session: ReturnType<typeof buildSession>;
  protein: number;
  proteinTarget: number;
  onLocation: (location: TrainingLocation) => void;
  onMinutes: (minutes: number) => void;
  onCalendar: () => void;
  onStart: () => void;
  onOpenMeals: () => void;
}) {
  const percent = Math.min(100, Math.round((protein / proteinTarget) * 100));
  return (
    <div className={styles.stack}>
      <section className={styles.sectionHeading}>
        <p className={styles.eyebrow}>mōrena, {profileName} · sample profile</p>
        <h2>One useful mission. Everything else supports it.</h2>
      </section>
      <div className={styles.dashboardGrid}>
        <article className={`${styles.card} ${styles.missionCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>today’s mission</p>
              <h3>{session.title}</h3>
            </div>
            <Dumbbell aria-hidden />
          </div>
          <div className={styles.segmented} aria-label="Training location">
            {(['home', 'gym', 'pilates'] as const).map((value) => (
              <button key={value} type="button" className={location === value ? styles.segmentActive : styles.segment} onClick={() => onLocation(value)}>
                {LOCATION_LABEL[value]}
              </button>
            ))}
          </div>
          <div className={styles.segmented} aria-label="Session duration">
            {[20, 35, 45].map((value) => (
              <button key={value} type="button" className={minutes === value ? styles.segmentActive : styles.segment} onClick={() => onMinutes(value)}>
                {value} min
              </button>
            ))}
          </div>
          <p className={styles.missionIntent}>{session.intent}</p>
          <ol className={styles.exerciseList}>
            {session.exercises.map((item) => (
              <li key={item.exercise.id}>
                <span><strong>{item.exercise.name}</strong><small>{item.exercise.coachingCue}</small></span>
                <span className={item.clearance === 'clinician-review' ? styles.reviewPill : styles.clearPill}>
                  {item.clearance === 'clinician-review' ? 'review' : `${item.sets} × ${item.reps}`}
                </span>
              </li>
            ))}
          </ol>
          <div className={styles.cardActions}>
            <button type="button" className={styles.primaryButton} onClick={onStart}>Start session <ChevronRight aria-hidden /></button>
            <button type="button" className={styles.secondaryButton} onClick={onCalendar}><CalendarDays aria-hidden /> Add to calendar</button>
          </div>
        </article>

        <aside className={styles.sideStack}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div><p className={styles.cardLabel}>fuel</p><h3>Today’s sample plan</h3></div>
              <Utensils aria-hidden />
            </div>
            <div className={styles.progressRow}>
              <div className={styles.progressRing} style={{ '--progress': `${percent}%` } as CSSProperties}>
                <strong>{protein}g</strong><span>protein</span>
              </div>
              <div><p><strong>{proteinTarget}g</strong> entered target</p><p className={styles.muted}>Estimated from stored recipes.</p></div>
            </div>
            <button type="button" className={styles.textButton} onClick={onOpenMeals}>See today’s meals <ChevronRight aria-hidden /></button>
          </article>
          <article className={`${styles.card} ${styles.checkCard}`}>
            <div className={styles.cardHeader}>
              <div><p className={styles.cardLabel}>check gate</p><h3>Restrictions applied before display</h3></div>
              <ShieldCheck aria-hidden />
            </div>
            <ul className={styles.compactList}>
              <li><Check aria-hidden /> Loaded spinal flexion excluded</li>
              <li><ClipboardCheck aria-hidden /> Loaded hinge marked for clinician review</li>
              <li><Check aria-hidden /> Meal allergens checked against profile</li>
            </ul>
            <p className={styles.muted}>{session.safetyNote}</p>
          </article>
        </aside>
      </div>
    </div>
  );
}

function ProgrammeView({ programme, onToday }: { programme: ReturnType<typeof buildTwelveWeekProgramme>; onToday: () => void }) {
  return (
    <div className={styles.stack}>
      <section className={styles.sectionHeading}>
        <p className={styles.eyebrow}>phase one · programme engine</p>
        <h2>Twelve weeks. Progress, recovery and assessment built in.</h2>
        <p>Pilates supports movement and recovery; two weekly strength sessions remain the minimum programme anchor.</p>
      </section>
      <div className={styles.weekGrid}>
        {programme.map((week) => (
          <article key={week.week} className={`${styles.weekCard} ${week.week === 1 ? styles.weekCurrent : ''}`}>
            <div><span>week {week.week}</span><strong>{week.phase}</strong></div>
            <h3>{week.focus}</h3>
            <p>{week.sessions} sessions · {week.sets} sets · {week.repRange}</p>
            {week.week === 1 ? <button type="button" onClick={onToday}>Open today <ChevronRight aria-hidden /></button> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function MealsView({ mealPlan, selectedDay, recipes, totals, onDay, onSwap, onShop }: {
  mealPlan: MealPlanDay[];
  selectedDay: number;
  recipes: ReturnType<typeof recipesForDay>;
  totals: ReturnType<typeof totalDayNutrition>;
  onDay: (index: number) => void;
  onSwap: (mode: SwapMode) => void;
  onShop: () => void;
}) {
  return (
    <div className={styles.stack}>
      <section className={styles.sectionHeading}>
        <p className={styles.eyebrow}>phase two · structured meals</p>
        <h2>A daily plan that swaps without losing the rules.</h2>
        <p>All figures are sample estimates from stored recipes. A real user’s targets belong in onboarding and clinical review where needed.</p>
      </section>
      <div className={styles.dayTabs}>
        {mealPlan.map((entry, index) => (
          <button key={entry.day} type="button" className={selectedDay === index ? styles.dayActive : styles.day} onClick={() => onDay(index)}>
            {entry.day.slice(0, 3)}
          </button>
        ))}
      </div>
      <div className={styles.nutritionStrip}>
        <span><strong>{totals.proteinGrams}g</strong> protein</span>
        <span><strong>{totals.energyKcal}</strong> kcal estimate</span>
        <span><strong>{totals.fibreGrams}g</strong> fibre</span>
        <span>4 meals</span>
      </div>
      <div className={styles.mealGrid}>
        {recipes.map((recipe) => (
          <article key={recipe.id} className={styles.mealCard}>
            <p className={styles.cardLabel}>{recipe.meal}</p>
            <h3>{recipe.name}</h3>
            <p>{recipe.minutes} min · {recipe.proteinGrams}g protein · {recipe.energyKcal} kcal</p>
            <div>{recipe.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
          </article>
        ))}
      </div>
      <section className={styles.swapPanel}>
        <div><p className={styles.cardLabel}>swap dinner</p><h3>Keep the meal type. Change the constraint.</h3></div>
        <div>{SWAP_LABELS.map((item) => <button key={item.mode} type="button" onClick={() => onSwap(item.mode)}><RotateCcw aria-hidden /> {item.label}</button>)}</div>
      </section>
      <button type="button" className={styles.primaryButton} onClick={onShop}>Build the weekly shop <ShoppingBasket aria-hidden /></button>
    </div>
  );
}

function ShopView({ items, retailer, checkedItems, onRetailer, onCheck, onCopy }: {
  items: ShoppingItem[];
  retailer: Retailer;
  checkedItems: string[];
  onRetailer: (retailer: Retailer) => void;
  onCheck: (item: ShoppingItem) => void;
  onCopy: () => void;
}) {
  const aisles = [...new Set(items.map((item) => item.aisle))];
  return (
    <div className={styles.stack}>
      <section className={styles.sectionHeading}>
        <p className={styles.eyebrow}>shop agent · handoff, not checkout</p>
        <h2>One consolidated list. You approve the products and purchase.</h2>
        <p>Strong does not access retailer accounts, create carts, choose substitutions, or check out.</p>
      </section>
      <section className={styles.integrationBar}>
        <div className={styles.segmented} aria-label="Retailer handoff">
          <button type="button" className={retailer === 'woolworths' ? styles.segmentActive : styles.segment} onClick={() => onRetailer('woolworths')}>Woolworths</button>
          <button type="button" className={retailer === 'new-world' ? styles.segmentActive : styles.segment} onClick={() => onRetailer('new-world')}>New World</button>
        </div>
        <button type="button" className={styles.secondaryButton} onClick={onCopy}><Copy aria-hidden /> Copy full list</button>
        <a className={styles.primaryButton} href={retailerHandoffUrl(retailer)} target="_blank" rel="noreferrer"><Store aria-hidden /> Open {retailer === 'woolworths' ? 'Woolworths' : 'New World'} <ExternalLink aria-hidden /></a>
      </section>
      <div className={styles.aisleGrid}>
        {aisles.map((aisle) => (
          <section key={aisle} className={styles.aisleCard}>
            <h3>{aisle}</h3>
            <ul>
              {items.filter((item) => item.aisle === aisle).map((item) => {
                const key = `${item.aisle}|${item.name}|${item.unit}`;
                const checked = checkedItems.includes(key);
                return (
                  <li key={key} className={checked ? styles.itemChecked : ''}>
                    <button type="button" onClick={() => onCheck(item)} aria-pressed={checked} aria-label={`${checked ? 'Uncheck' : 'Check'} ${item.name}`}><span>{checked ? <Check aria-hidden /> : null}</span></button>
                    <div><strong>{item.name}</strong><small>{item.quantity} {item.unit} · {item.recipeCount} recipe{item.recipeCount === 1 ? '' : 's'}</small></div>
                    <a href={retailerHandoffUrl(retailer, item.name)} target="_blank" rel="noreferrer" title={retailer === 'woolworths' ? `Search Woolworths for ${item.name}` : `Open New World to search for ${item.name}`}><ExternalLink aria-hidden /></a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <p className={styles.handoffNote}>Review pack size, price, stock, allergens and substitutions in the retailer’s own site or app. Checkout stays with you.</p>
    </div>
  );
}

function AgentsView() {
  return (
    <div className={styles.stack}>
      <section className={styles.sectionHeading}>
        <p className={styles.eyebrow}>phase three · focused agents</p>
        <h2>Each agent has one job. Check controls what reaches the dashboard.</h2>
      </section>
      <div className={styles.agentGrid}>
        {STRONG_AGENTS.map((agent) => (
          <article key={agent.id} className={styles.agentCard}>
            <div><span>{agent.status}</span><ListChecks aria-hidden /></div>
            <h3>{agent.name}</h3>
            <p>{agent.job}</p>
          </article>
        ))}
      </div>
      <section className={styles.connectorGrid}>
        <Connector title="Calendar" status="wired" note="Exports a tentative .ics session for review." icon={CalendarDays} />
        <Connector title="Woolworths" status="wired" note="Opens official product search pages. No cart access." icon={ShoppingBasket} />
        <Connector title="New World" status="wired" note="Opens the official online shop. No cart access." icon={Store} />
        <Connector title="Wearables" status="not connected" note="Requires explicit consent and a native Apple Health / Health Connect bridge." icon={Waves} />
      </section>
    </div>
  );
}

function Connector({ title, status, note, icon: Icon }: { title: string; status: string; note: string; icon: typeof Home }) {
  return <article className={styles.connectorCard}><Icon aria-hidden /><div><span>{status}</span><h3>{title}</h3><p>{note}</p></div></article>;
}
