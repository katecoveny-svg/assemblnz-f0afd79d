import { useEffect, useState } from "react";
import { Loader2, Sparkles, Copy, Check, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { MeetingItem } from "./MeetingList";
import { exportHuiSummaryPdf } from "@/lib/huiPdf";

interface Props {
  meeting: MeetingItem;
}

export const MeetingSummary = ({ meeting }: Props) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting.id]);

  const generate = async () => {
    setLoading(true);
    setSummary("");
    try {
      const attendees = (meeting.attendees ?? [])
        .map((a) => a.displayName || a.email)
        .filter(Boolean)
        .join(", ");
      const prompt = `Write a calm, NZ-business one-paragraph executive summary (max 90 words) for this hui. Plain English, no jargon.

Title: ${meeting.summary || "(untitled)"}
When: ${meeting.start}${meeting.end ? ` — ${meeting.end}` : ""}
${attendees ? `Attendees: ${attendees}` : ""}
${meeting.description ? `Brief: ${meeting.description}` : ""}

Then list 3 likely focus points as short bullet lines starting with "• ".`;

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          agentId: "echo",
          messages: [{ role: "user", content: prompt }],
        },
      });
      if (error) throw error;
      const text =
        (typeof data?.content === "string" && data.content) ||
        (typeof data === "string" ? data : "");
      setSummary(
        text ||
          "Summary unavailable. Try again once the meeting has notes or a transcript attached."
      );
    } catch {
      setSummary(
        `Summary unavailable. Quick view: ${
          meeting.summary || "(untitled)"
        } scheduled for ${new Date(meeting.start).toLocaleString("en-NZ")}.`
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#9D8C7D]">
            {meeting.summary || "(untitled)"}
          </h2>
          <p className="font-['Inter'] text-sm text-[#9D8C7D]/80">Executive summary</p>
        </div>
        <button
          onClick={generate}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-['Inter'] bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] transition-colors"
        >
          <Sparkles size={12} /> Regenerate
        </button>
      </header>

      <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)] min-h-[160px]">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#9D8C7D] font-['Inter']">
            <Loader2 size={14} className="animate-spin" /> Generating summary…
          </div>
        ) : (
          <p className="font-['Inter'] text-sm text-[#6F6158] whitespace-pre-wrap leading-relaxed">
            {summary}
          </p>
        )}
      </section>

      {!loading && summary && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-['Inter'] border border-[rgba(142,129,119,0.2)] text-[#6F6158] hover:bg-[#EEE7DE] transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy summary"}
          </button>
          <button
            onClick={() => exportHuiSummaryPdf(meeting, summary)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-['Inter'] bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] transition-colors"
          >
            <FileDown size={12} /> Download PDF
          </button>
        </div>
      )}
    </div>
  );
};
