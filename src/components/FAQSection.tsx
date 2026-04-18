import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "What is Assembl?", a: "assembl is an intelligent business platform built for Aotearoa. It runs your compliance, operations, and reporting — then hands you signed evidence packs you can file with your auditor, send to your lawyer, or present at a board meeting. Six industry kete cover hospitality, construction, creative, automotive, freight & customs, and retail — plus Tōro for whānau. Early childhood education (AKO) is next." },
  { q: "How is this different from ChatGPT?", a: "ChatGPT gives generic answers based on global training data. Assembl is grounded in NZ legislation and policy workflows, with a tikanga governance posture and an audit trail on every output. When you ask a compliance question, the answer is anchored in the law that actually applies to your business and you can see where it came from." },
  { q: "What is the minimum wage in New Zealand in 2026?", a: "As of 1 April 2026, the NZ adult minimum wage is $23.65 per hour. The starting-out and training minimum wage is $18.92 per hour." },
  { q: "Do I need technical skills to use it?", a: "Not at all. Every agent works through natural conversation — just type or speak. No code, no training required." },
  { q: "Is my data safe?", a: "All data is encrypted in transit and at rest. We follow NZISM guidance, align to AAAIP and the NZ Privacy Act 2020, and your business data is never used to train models. Enterprise customers get attested NZ data residency." },
  { q: "Is the advice legally reliable?", a: "Assembl provides guidance grounded in current NZ legislation and policy workflows, not legal advice. Every response references the rule or regulation it draws from. Use Assembl alongside qualified professionals — it's a specialist research and operations layer, not a replacement for your lawyer or accountant." },
  { q: "Can I use it if I don't speak te reo?", a: "Absolutely. All agents work in English. Te reo Māori is woven into Assembl's governance, naming, and tikanga layer — reflecting our commitment to Te Tiriti and the four pou (Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga)." },
  { q: "What does it cost?", a: "Family is $29/mo for whānau (SMS-first). Operator is $590/mo + $1,490 setup for sole traders and micro-SMEs. Leader is $1,290/mo + $1,990 setup for multi-discipline teams. Enterprise is $2,890/mo + $2,990 setup for multi-site, regulated operations. Outcome is from $5,000/mo for bespoke engagements where Assembl takes on the result. All NZD ex GST. Setup fees can be split across the first 3 invoices on request." },
  { q: "Can I try before I buy?", a: "Sign up and we map your workflows, agree what success looks like, and run a 10-business-day setup: kickoff workshop, data import, brand kit, two policy gates, and a pilot kit. If we miss the 10-day window we refund the setup fee." },
  { q: "What happens if legislation changes?", a: "We monitor NZ legislative changes and update our compliance layer regularly. When a rate changes (like minimum wage or KiwiSaver), a new regulation takes effect, or an Act is amended, the relevant agents and policy gates are updated to reflect the current law." },
  { q: "How does the annual prepay work?", a: "Annual prepay saves 12% on any business tier. You're billed once per year alongside the setup fee, with a 14-day cool-off. Non-refundable after that." },
  { q: "Can I embed agents on my website?", a: "Yes. Leader and above include an embeddable chat widget. Drop it straight into your website — instant compliance and operational support for your team or customers." },
  { q: "What industries do you cover?", a: "Six industry kete: Manaaki (hospitality), Waihanga (construction), Auaha (creative), Arataki (automotive), Pikau (freight & customs), and Hoko (retail). Tōro covers whānau. Ako (early childhood education) is in build for V2 expansion." },
  { q: "Who built this?", a: "Assembl was founded in Auckland by Kate Hudson. Every workflow is designed, trained, and maintained in Aotearoa — built from the ground up for how NZ businesses actually operate." },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.getElementById("faq-jsonld")?.remove();
    };
  }, []);

  return (
    <section className="relative z-10 pt-[100px] pb-[100px]" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="uppercase mb-3"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "4px",
              color: "#D4A843",
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "2rem",
              color: "#1A1D29",
            }}
          >
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-1">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02 }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: isOpen ? "rgba(22,22,42,0.5)" : "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${isOpen ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.5)"}`,
                  transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left"
                >
                  <span
                    className="pr-4"
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 300,
                      fontSize: "14px",
                      color: "#1A1D29",
                    }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform duration-300"
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p
                        className="px-5 sm:px-6 pb-4"
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.65)",
                          lineHeight: 1.7,
                        }}
                      >
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
