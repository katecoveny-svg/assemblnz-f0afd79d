import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmailWatchCard } from "@/components/toro/EmailWatchCard";
import { FamilyCalendarCard } from "@/components/toro/FamilyCalendarCard";
import { SchoolReportsCard } from "@/components/toro/SchoolReportsCard";
import { ActionItemsCard } from "@/components/toro/ActionItemsCard";
import { ToroTutorChat } from "@/components/toro/ToroTutorChat";

const ToroDashboard = () => {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    void checkConnections();
  }, []);

  const checkConnections = async () => {
    try {
      const { data: cal } = await supabase.functions.invoke("google-calendar", {
        body: { action: "status" },
      });
      setCalendarConnected(Boolean(cal?.connected));
    } catch {
      // ignore
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: integration } = await supabase
          .from("user_integrations")
          .select("status")
          .eq("user_id", session.user.id)
          .eq("integration_name", "google_mail")
          .maybeSingle();
        setGmailConnected(integration?.status === "active");
      }
    } catch {
      // ignore
    }
  };

  const ConnIndicator = ({ name, ok }: { name: string; ok: boolean }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Inter'] bg-white/60 border border-[rgba(142,129,119,0.14)]">
      {ok ? (
        <Check size={12} className="text-[#9DB89D]" />
      ) : (
        <X size={12} className="text-[#C09494]" />
      )}
      <span className="text-[#6F6158]">{name}</span>
    </span>
  );

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <header className="mb-8">
          <Link
            to="/toro"
            className="inline-flex items-center gap-1 text-sm text-[#9D8C7D] hover:text-[#6F6158] font-['Inter'] mb-4"
          >
            <ChevronLeft size={14} />
            Back to Tōro
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-['Cormorant_Garamond'] text-5xl text-[#9D8C7D] inline-block border-b-2 border-[#C7D9E8] pb-1">
                Tōro
              </h1>
              <p className="font-['Inter'] text-base text-[#9D8C7D]/80 mt-2">Family Command Centre</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ConnIndicator name="Gmail" ok={gmailConnected} />
              <ConnIndicator name="Calendar" ok={calendarConnected} />
            </div>
          </div>
        </header>

        {/* 4-section grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section id="emails">
            <EmailWatchCard />
          </section>
          <section id="calendar">
            <FamilyCalendarCard />
          </section>
          <section id="reports">
            <SchoolReportsCard />
          </section>
          <section id="actions">
            <ActionItemsCard />
          </section>
        </div>

        {/* Tutor / day-plan chat */}
        <section id="ask-toro" className="mt-6">
          <ToroTutorChat
            variant="day"
            title="Ask Tōro about today"
            contextLines={[
              "Whānau dashboard view — no specific child selected.",
              `Connections: Gmail ${gmailConnected ? "linked" : "not linked"}, Calendar ${calendarConnected ? "linked" : "not linked"}.`,
            ]}
          />
        </section>
      </div>
    </div>
  );
};

export default ToroDashboard;
