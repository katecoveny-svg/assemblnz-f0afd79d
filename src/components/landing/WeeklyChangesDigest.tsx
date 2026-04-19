import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChangeItem {
  name: string;
  agent_packs: string[] | null;
  last_checked_at: string | null;
}

/**
 * "What changed this week" digest — shows recent governance updates ingested
 * from the compliance scanner. Recurring reason to visit the homepage.
 */
export default function WeeklyChangesDigest() {
  const [changes, setChanges] = useState<ChangeItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("kb_sources")
        .select("name, agent_packs, last_checked_at")
        .eq("active", true)
        .gte("last_checked_at", sevenDaysAgo)
        .order("last_checked_at", { ascending: false })
        .limit(5);
      if (!cancelled) setChanges((data ?? []) as ChangeItem[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const TEAL = "#4AA5A8";
  const OCHRE = "#E8A948";

  // Show component only when there's something to say — but keep skeleton during load
  const hasChanges = changes && changes.length > 0;
  if (changes && !hasChanges) return null;

  return (
    <section className="px-4 sm:px-6 py-12">
      <div className="max-w-[900px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-6 sm:p-10"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.85), rgba(238,238,242,0.65))",
            border: "1px solid rgba(74,165,168,0.15)",
            backdropFilter: "blur(24px) saturate(160%)",
            boxShadow:
              "6px 6px 16px rgba(166,166,180,0.25), -6px -6px 16px rgba(255,255,255,0.85), 0 0 40px -15px rgba(74,165,168,0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${OCHRE}12`, boxShadow: `0 0 18px ${OCHRE}25` }}
            >
              <Sparkles size={15} style={{ color: OCHRE }} />
            </div>
            <div>
              <p
                className="text-[10px] tracking-[3px] uppercase mb-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: TEAL }}
              >
                — What changed this week —
              </p>
              <h3 className="text-[16px] sm:text-[18px]" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>
                NZ governance sources Assembl ingested in the last 7 days
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {!changes &&
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-2xl animate-pulse"
                  style={{ background: "rgba(74,165,168,0.06)" }}
                />
              ))}
            {hasChanges &&
              changes!.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(232,230,240,0.4)" }}
                >
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full shrink-0 tracking-wider uppercase"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: `${TEAL}10`,
                      color: TEAL,
                      border: `1px solid ${TEAL}20`,
                    }}
                  >
                    {(c.agent_packs?.[0] ?? "cross").slice(0, 8)}
                  </span>
                  <span className="flex-1 text-[13px] truncate" style={{ color: "#3D4250" }}>
                    {c.name}
                  </span>
                  <span
                    className="text-[10px] shrink-0"
                    style={{ color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {c.last_checked_at ? formatAgo(new Date(c.last_checked_at)) : "—"}
                  </span>
                </div>
              ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              to="/status"
              className="inline-flex items-center gap-2 text-[12px] tracking-[1px] uppercase transition-all hover:gap-3"
              style={{ fontFamily: "'Lato', sans-serif", color: TEAL }}
            >
              See live status <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function formatAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
