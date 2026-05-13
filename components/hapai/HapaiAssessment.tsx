"use client";

/**
 * HapaiAssessment — 5-question client-side self-assessment that resolves
 * the team's current tier and surfaces a shareable result.
 *
 * No backend. No login. No email capture. Score lives in component state
 * (and gets encoded into the share URL so the receiver sees the same result).
 *
 * Tiers are passed in from the server component to keep one source of truth.
 */

import { useEffect, useMemo, useState } from "react";

type Tier = {
  slug: string;
  english: string;
  min: number;
  max: number;
  description: string;
};

type Answer = number; // 0..4 scale where 0=never, 4=daily

const QUESTIONS: Array<{ id: string; text: string; weight: number }> = [
  {
    id: "weekly_sessions",
    text: "On average, how many times per week does each person on your team open an intelligent-agent tool (Claude, ChatGPT, Copilot, etc.)?",
    weight: 1.0,
  },
  {
    id: "automation_requests",
    text: "In the last month, how often has someone said 'we should automate this'?",
    weight: 0.6,
  },
  {
    id: "team_sharing",
    text: "How often does someone share a useful prompt or workflow with the rest of the team?",
    weight: 0.8,
  },
  {
    id: "leadership_using",
    text: "How visibly does leadership (CEO / founders / management) use AI in their own work?",
    weight: 1.2,
  },
  {
    id: "smoothness",
    text: "How consistent is your team's AI use, week to week?",
    weight: 1.0,
  },
];

const SCALE: Array<{ value: Answer; label: string; sessions_estimate: number }> = [
  { value: 0, label: "Never / almost never", sessions_estimate: 0 },
  { value: 1, label: "Monthly-ish", sessions_estimate: 5 },
  { value: 2, label: "Weekly", sessions_estimate: 25 },
  { value: 3, label: "A few times a week", sessions_estimate: 75 },
  { value: 4, label: "Daily / multiple times daily", sessions_estimate: 200 },
];

function estimatedMonthlySessions(answers: (Answer | null)[]): number {
  // Weighted average of the scale estimates × weight
  let totalWeight = 0;
  let weightedSum = 0;
  for (let i = 0; i < QUESTIONS.length; i++) {
    if (answers[i] === null) continue;
    const est = SCALE.find((s) => s.value === answers[i])!.sessions_estimate;
    weightedSum += est * QUESTIONS[i].weight;
    totalWeight += QUESTIONS[i].weight;
  }
  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

function tierForSessions(sessions: number, tiers: Tier[]): Tier {
  for (const tier of tiers) {
    if (sessions >= tier.min && sessions <= tier.max) return tier;
  }
  return tiers[0];
}

export default function HapaiAssessment({ tiers }: { tiers: Tier[] }) {
  const [answers, setAnswers] = useState<(Answer | null)[]>(
    QUESTIONS.map(() => null)
  );
  const [showResult, setShowResult] = useState(false);

  // Read result from URL on mount (so shared links land on the result view)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("r");
    if (encoded && /^[0-4]{5}$/.test(encoded)) {
      const decoded = encoded.split("").map((c) => parseInt(c, 10) as Answer);
      setAnswers(decoded);
      setShowResult(true);
    }
  }, []);

  const allAnswered = useMemo(() => answers.every((a) => a !== null), [answers]);
  const sessions = useMemo(() => estimatedMonthlySessions(answers), [answers]);
  const tier = useMemo(() => tierForSessions(sessions, tiers), [sessions, tiers]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setShowResult(true);
    // Update URL so the result is shareable
    const encoded = answers.map((a) => String(a)).join("");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("r", encoded);
      url.hash = "assessment-result";
      window.history.replaceState({}, "", url.toString());
    }
  }

  function reset() {
    setAnswers(QUESTIONS.map(() => null));
    setShowResult(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("r");
      window.history.replaceState({}, "", url.toString());
    }
  }

  if (showResult) {
    return (
      <ResultCard
        tier={tier}
        sessions={sessions}
        answers={answers as Answer[]}
        onReset={reset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="assessment-result">
      {QUESTIONS.map((q, i) => (
        <div key={q.id} className="border-l-2 border-pounamu-300 pl-5">
          <p className="text-base lg:text-lg text-taupe-900 mb-4 leading-relaxed">
            <span className="font-cormorant text-pounamu-700 mr-2">{i + 1}.</span>
            {q.text}
          </p>
          <div className="grid gap-2">
            {SCALE.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md border cursor-pointer transition-colors ${
                  answers[i] === opt.value
                    ? "bg-pounamu-700 border-pounamu-700 text-mist-50"
                    : "bg-mist-50 border-taupe-200 hover:border-pounamu-300 text-taupe-900"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt.value}
                  checked={answers[i] === opt.value}
                  onChange={() => {
                    const next = [...answers];
                    next[i] = opt.value;
                    setAnswers(next);
                  }}
                  className="sr-only"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={!allAnswered}
        className="w-full py-3.5 rounded-md bg-pounamu-900 text-mist-50 font-medium hover:bg-pounamu-800 transition-colors disabled:bg-taupe-300 disabled:cursor-not-allowed"
      >
        {allAnswered ? "Show me where my team sits →" : `Answer all 5 questions (${answers.filter((a) => a !== null).length}/5 done)`}
      </button>
    </form>
  );
}

function ResultCard({
  tier,
  sessions,
  answers,
  onReset,
}: {
  tier: Tier;
  sessions: number;
  answers: Answer[];
  onReset: () => void;
}) {
  const encoded = answers.map((a) => String(a)).join("");
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/hapai?r=${encoded}#assessment-result`
      : `/hapai?r=${encoded}#assessment-result`;

  const tierIndex = ["akoranga", "kaimahi", "tohunga", "rangatira", "pou"].indexOf(tier.slug);

  return (
    <div className="border-2 border-pounamu-700 rounded-lg p-6 lg:p-8 bg-mist-50">
      <p className="text-xs uppercase tracking-widest text-pounamu-700 mb-2">
        Your team's tier
      </p>
      <h3 className="font-cormorant text-5xl lg:text-6xl text-pounamu-900 capitalize leading-none mb-1">
        {tier.slug}
      </h3>
      <p className="text-base text-taupe-600 mb-6">
        {tier.english} · ~{sessions} sessions per person per month
      </p>
      <p className="text-base lg:text-lg text-taupe-900 leading-relaxed mb-6">
        {tier.description}
      </p>

      {/* tier bar */}
      <div className="my-8">
        <div className="flex justify-between text-xs text-taupe-500 uppercase tracking-wider mb-2">
          <span>akoranga</span><span>kaimahi</span><span>tohunga</span><span>rangatira</span><span>pou</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2.5 rounded-sm ${
                i <= tierIndex ? "bg-pounamu-700" : "bg-taupe-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-pounamu-50 border border-pounamu-100 rounded-md p-5 mb-6">
        <p className="text-sm font-medium text-pounamu-900 mb-2">
          What HAPAI does at this tier
        </p>
        <p className="text-sm text-taupe-700 leading-relaxed">
          {tier.slug === "akoranga" &&
            "Kaupapa Board first. Make it easy for the curious to submit 'I want a thing that does X.' Build five quick wins in week one. Visibility beats training."}
          {tier.slug === "kaimahi" &&
            "Skills Library matters now — surface what the early adopters built, show the time saved. The middle of the team needs to see what's possible before they try."}
          {tier.slug === "tohunga" &&
            "The Adoption Dashboard becomes useful. Smoothness scores reveal which sub-teams are in flow and which are binge-using. Coach the curve."}
          {tier.slug === "rangatira" &&
            "Lead-user culture is locked in. Time to formalise the marketplace — let people build for each other. New hires are recruited for curiosity, not credentials."}
          {tier.slug === "pou" &&
            "You're the case study. HAPAI becomes the product you ship to other NZ businesses still on the wrong side of the trust gap. The framework scales out."}
        </p>
      </div>

      <p className="text-xs uppercase tracking-widest text-taupe-600 mb-3">Share this result</p>
      <ShareCluster shareUrl={shareUrl} tier={tier} sessions={sessions} />

      <button
        onClick={onReset}
        className="mt-6 text-sm text-taupe-600 hover:text-pounamu-900 transition-colors underline"
      >
        ← Run the assessment again
      </button>
    </div>
  );
}

function ShareCluster({
  shareUrl,
  tier,
  sessions,
}: {
  shareUrl: string;
  tier: Tier;
  sessions: number;
}) {
  const [copied, setCopied] = useState(false);
  const shareText = `My team sits at ${tier.slug} — ${tier.english} (~${sessions} sessions/month).\n\nThe HAPAI adoption framework from assembl maps where NZ teams actually are with AI vs where they paid to be. Try it:`;

  function copyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "HAPAI — your team's AI adoption tier",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled — silently
      }
    } else {
      copyLink();
    }
  }

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("HAPAI: where your team sits on the AI adoption ladder")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={nativeShare}
        className="px-4 py-2 rounded-md bg-pounamu-700 text-mist-50 text-sm font-medium hover:bg-pounamu-800 transition-colors"
      >
        Share
      </button>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-md border border-pounamu-300 text-pounamu-900 text-sm hover:bg-pounamu-50 transition-colors"
      >
        LinkedIn
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-md border border-pounamu-300 text-pounamu-900 text-sm hover:bg-pounamu-50 transition-colors"
      >
        X / Twitter
      </a>
      <a
        href={emailUrl}
        className="px-4 py-2 rounded-md border border-pounamu-300 text-pounamu-900 text-sm hover:bg-pounamu-50 transition-colors"
      >
        Email
      </a>
      <button
        onClick={copyLink}
        className="px-4 py-2 rounded-md border border-pounamu-300 text-pounamu-900 text-sm hover:bg-pounamu-50 transition-colors"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
