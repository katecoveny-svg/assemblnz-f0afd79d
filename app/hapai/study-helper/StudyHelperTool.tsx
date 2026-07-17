"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  CheckCircle2,
  Copy,
  Download,
  GraduationCap,
  ImagePlus,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { ShareableToolActions } from "@/components/hapai/ShareableToolActions";
import { ToolLeadCapture } from "@/components/hapai/ToolLeadCapture";
import { useToolGate } from "@/lib/hapai/use-tool-gate";

const modes = [
  { id: "essay-plan", label: "Essay plan", icon: BookOpen },
  { id: "quiz", label: "Quiz me", icon: GraduationCap },
  { id: "sprint", label: "60-min sprint", icon: TimerReset },
  { id: "paragraph", label: "Fix paragraph", icon: CheckCircle2 },
] as const;

const focusChips = [
  "whānau / family",
  "courage under challenge",
  "identity and culture",
  "Rarohenga as setting",
  "relationships",
  "character change",
  "symbols and foreshadowing",
] as const;

function htmlToMarkdown(html: string) {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, "\n## $1\n")
    .replace(/<li>(.*?)<\/li>/g, "- $1\n")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<\/?ul>/g, "")
    .replace(/<p>(.*?)<\/p>/g, "$1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function StudyHelperTool() {
  const [student, setStudent] = useState("");
  const [yearLevel, setYearLevel] = useState("Year 9");
  const [school, setSchool] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [examContext, setExamContext] = useState("English novel study essay tomorrow");
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("essay-plan");
  const [essayQuestion, setEssayQuestion] = useState("");
  const [roughIdeas, setRoughIdeas] = useState("");
  const [quoteBank, setQuoteBank] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const gate = useToolGate("study-helper");

  async function generateStudyPlan() {
    setError("");
    setHtml("");
    setLoading(true);
    try {
      const response = await gate.fetch("/api/hapai/study-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student,
          yearLevel,
          school,
          textTitle,
          author,
          examContext,
          mode,
          essayQuestion,
          roughIdeas,
          quoteBank,
          imageDataUrl,
        }),
      });
      if (!response) return; // gated — the email-capture modal is showing
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not draft the study plan.");
      setHtml(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draft the study plan.");
    } finally {
      setLoading(false);
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(htmlToMarkdown(html));
  }

  function downloadMarkdown() {
    const blob = new Blob([htmlToMarkdown(html)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "study-helper-plan.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImageUpload(file: File | null) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload a photo or screenshot image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Please upload an image under 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result ?? ""));
      setImageName(file.name);
    };
    reader.onerror = () => setError("Could not read that image. Try a clearer screenshot.");
    reader.readAsDataURL(file);
  }

  // Fictional sample — a worked example, never a real student.
  function loadExamSample() {
    setStudent("Alex");
    setYearLevel("Year 9");
    setSchool("Harbourside College");
    setTextTitle("Falling into Rarohenga");
    setAuthor("Steph Matuku");
    setExamContext("First English exam tomorrow. Novel study essay.");
    setEssayQuestion("We do not know the exact question yet. Build an adaptable essay plan for a novel study essay.");
    setRoughIdeas(
      "The student needs a direct plan for tonight. Help them remember plot, themes, characters, setting, and how to turn one scene into a paragraph. They need confidence, not a full essay to memorise.",
    );
    setQuoteBank("No exact quotes yet. Make a quote/evidence hunt list and remind them not to invent wording.");
    setMode("essay-plan");
  }

  const hasInput = `${essayQuestion}${roughIdeas}${quoteBank}${imageDataUrl ? "image" : ""}`.trim().length >= 8;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_78%_18%,rgba(58,56,50,0.13),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f3f5f3_55%,#ffffff_100%)] px-6 py-12 text-[#313c42] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/hapai" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#313c42]">
          <ArrowLeft className="h-3.5 w-3.5" /> SPARK library
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_0.72fr] lg:items-stretch">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#313c42]">SPARK · study helper</p>
            <h1 className="mt-3 max-w-4xl font-display text-[clamp(4.1rem,8.4vw,8.8rem)] font-normal leading-[0.84] text-[#313c42]">
              Turn notes into a plan.
            </h1>
            <p className="mt-7 max-w-3xl text-[clamp(1.05rem,1.8vw,1.35rem)] leading-relaxed text-[#3D4250]">
              Upload a teacher prompt, notes photo, rough paragraph, or quote bank.
              Study Helper turns it into an essay plan, recall quiz, quote checklist,
              or 20-minute drill mapped to NZ Curriculum English skills.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Camera, title: "reads a photo", body: "a handout, whiteboard, or rough notes page" },
                { icon: BookOpen, title: "essay plan", body: "thesis options, paragraph moves, evidence to find" },
                { icon: TimerReset, title: "20-min drills", body: "recall, quote hunt, and practice paragraph sprints" },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/58 p-4 shadow-[0_18px_54px_rgba(35,33,31,0.06)]">
                  <Icon className="h-5 w-5 text-[#313c42]" aria-hidden />
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#313c42]">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#5A5550]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#313c42] p-6 text-[#ffffff] shadow-[0_34px_110px_rgba(35,33,31,0.18)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(184, 150, 79,0.24),transparent_34%),linear-gradient(135deg,rgba(250,247,242,0.10),transparent_48%)]" />
            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#b8964f]">how it helps</p>
              <p className="mt-3 font-display text-4xl font-light leading-none text-[#ffffff]">
                It builds the plan. He writes the answer.
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[#ffffff]/82">
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Reads photos of notes, teacher prompts, and rough drafts.</li>
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Maps the task to ideas, structure, language features, audience, purpose, and evidence.</li>
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> No made-up quotes, page numbers, or ghostwritten final essays.</li>
              </ul>
              <div className="mt-5">
                <ShareableToolActions
                  title="Study Helper by assembl"
                  text="Upload notes or a teacher prompt. Get an essay plan, quote checklist, recall quiz, or study sprint mapped to NZ Curriculum skills."
                  path="/hapai/study-helper"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.55fr]">
          <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/84 p-5 shadow-[0_22px_80px_rgba(35,33,31,0.08)] md:p-7">
            <div className="mb-5 flex flex-wrap gap-3">
              <button type="button" onClick={loadExamSample} className="rounded-full border border-[rgba(58,56,50,0.24)] bg-[#ffffff] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#313c42] hover:bg-white">
                Load a sample exam night
              </button>
              {modes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] ${
                    mode === id
                      ? "border-[#313c42] bg-[#313c42] text-[#ffffff]"
                      : "border-[rgba(35,33,31,0.14)] bg-[#ffffff] text-[#5A5550] hover:bg-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SmallInput label="Student" value={student} onChange={setStudent} />
              <SmallInput label="Year level" value={yearLevel} onChange={setYearLevel} />
              <SmallInput label="School" value={school} onChange={setSchool} />
              <SmallInput label="Exam context" value={examContext} onChange={setExamContext} />
              <SmallInput label="Text" value={textTitle} onChange={setTextTitle} />
              <SmallInput label="Author" value={author} onChange={setAuthor} />

              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Upload notes, handout, or whiteboard photo</span>
                <div className="relative overflow-hidden rounded-[10px] border border-dashed border-[rgba(58,56,50,0.32)] bg-[#f7f9f8] p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Upload an image for Study Helper"
                  />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#313c42] text-[#ffffff]">
                        <ImagePlus className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-medium text-[#313c42]">
                          {imageName || "Drop in a teacher sheet, notes page, or essay plan photo."}
                        </p>
                        <p className="mt-1 text-sm text-[#6B6661]">
                          The parser reads visible text only. The student still checks exact quotes in the novel.
                        </p>
                      </div>
                    </div>
                    {imageDataUrl ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setImageDataUrl("");
                          setImageName("");
                        }}
                        className="relative z-10 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] bg-white px-4 text-sm text-[#5A5550]"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  {imageDataUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageDataUrl} alt="" className="max-h-[260px] w-full object-contain" />
                    </div>
                  ) : null}
                </div>
              </label>

              <Field label="Likely question or teacher wording" value={essayQuestion} onChange={setEssayQuestion} placeholder="Paste the essay question, teacher hints, or write: unknown question, build an adaptable plan." />
              <Field label="What he remembers or is worried about" value={roughIdeas} onChange={setRoughIdeas} placeholder="Characters, themes, scenes, what is confusing, what he thinks might come up." />
              <Field label="Quote bank or page refs" value={quoteBank} onChange={setQuoteBank} placeholder="Paste exact quotes from the book if he has them. If not, say no exact quotes yet." />
              <label>
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Focus ideas</span>
                <div className="min-h-[170px] rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#f7f9f8] p-4">
                  <div className="flex flex-wrap gap-2">
                    {focusChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setRoughIdeas((current) => `${current}${current ? "\n" : ""}Focus on ${chip}.`)}
                        className="rounded-full border border-[rgba(58,56,50,0.20)] bg-white/72 px-3 py-2 text-left text-xs text-[#313c42] hover:bg-white"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#6B6661]">
                    These are prompts, not claims. The plan will ask the student to prove any idea with a scene or exact quote.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateStudyPlan}
                disabled={loading || !hasInput}
                className="inline-flex rounded-full bg-[#313c42] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#313c42] disabled:bg-[#C8C2BC]"
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                {loading ? "Drafting study help..." : "Draft study help"}
              </button>
              <span className="flex items-center">{gate.counter}</span>
              {gate.modal}
              <button
                type="button"
                onClick={() => {
                  setEssayQuestion("");
                  setRoughIdeas("");
                  setQuoteBank("");
                  setImageDataUrl("");
                  setImageName("");
                  setHtml("");
                }}
                className="rounded-full border border-[rgba(35,33,31,0.18)] px-6 py-3 text-sm text-[#5A5550] hover:text-[#313c42]"
              >
                Clear notes
              </button>
            </div>
            {loading ? (
              <p className="mt-4 rounded-[10px] border border-[#b8964f]/30 bg-[#f7f9f8] px-4 py-3 text-sm text-[#6B5A28]">
                Building the plan: no invented quotes, no full essay to copy, just the next useful study move.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>
            ) : null}
          </div>

          <aside className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/64 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#313c42]">what this becomes</p>
            <h2 className="mt-3 font-display text-4xl font-light leading-none">Mapped to NZ Curriculum skills.</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#5A5550]">
              <li><strong>Sample:</strong> Year 9 English exam prep on <em>Falling into Rarohenga</em> — swap in your own details.</li>
              <li><strong>Next:</strong> upload teacher rubrics, timetable photos, novel notes, and practice paragraphs.</li>
              <li><strong>Generic version:</strong> share this with any NZ student for a prompt, notes photo, quote bank, or practice paragraph.</li>
              <li><strong>Guardrail:</strong> coaching and recall, not ghostwriting.</li>
            </ul>
          </aside>
        </section>

        {html ? (
          <section className="mt-8 rounded-[14px] border border-[rgba(35,33,31,0.08)] bg-white p-8">
            <div className="prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-[#313c42]" dangerouslySetInnerHTML={{ __html: html }} />
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-full bg-[#313c42] px-5 py-3 text-sm font-medium text-white hover:bg-[#313c42]">
                <Copy className="h-4 w-4" /> Copy markdown
              </button>
              <button type="button" onClick={downloadMarkdown} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#313c42]">
                <Download className="h-4 w-4" /> Download .md
              </button>
            </div>
            <div className="mt-6">
              <ToolLeadCapture
                toolSlug="study-helper"
                title="Email me this study plan"
                blurb="Optional. We’ll send a copy of this plan. The tool works either way."
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function SmallInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#f7f9f8] px-3 outline-none focus:border-[#313c42] focus:bg-white"
      />
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[170px] w-full rounded-[10px] border border-[rgba(35,33,31,0.08)] bg-[#f7f9f8] p-4 text-sm leading-relaxed outline-none focus:border-[#313c42] focus:bg-white"
        placeholder={placeholder}
      />
    </label>
  );
}
