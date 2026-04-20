import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "What is Assembl?", a: "Assembl is the product layer for NZ business — pre-trained on NZ law, tikanga-governed, with industry kete that turn compliance into evidence packs you can file with your auditor, lawyer, or board. Seven industry kete cover Manaaki (hospitality), Waihanga (construction), Auaha (creative), Arataki (automotive & fleet), Pikau (freight & customs), Hoko (retail), and Ako (early childhood education). Tōro is the consumer kete for whānau running family admin." },
  { q: "How is this different from ChatGPT?", a: "ChatGPT gives generic answers based on global training data. Assembl is grounded in NZ legislation and policy workflows, with a tikanga governance posture and an audit trail on every output. When you ask a compliance question, the answer is anchored in the law that actually applies to your business and you can see where it came from." },
  { q: "How does Assembl fit with Kererū.ai and other NZ AI infrastructure?", a: "Kererū.ai answers where your data lives. Assembl answers what your data does. Kererū is NZ-sovereign AI infrastructure; Assembl is the product layer built on top — pre-trained on NZ law, tikanga-governed, with industry kete that turn compliance into evidence packs. We think NZ businesses need both." },
  { q: "Where is my data hosted?", a: "We're actively working with NZ-owned infrastructure partners so your data can stay on NZ soil. Sovereign hosting is in flight — not yet live for every customer. Ask us where your specific kete runs and we'll tell you the truth, including which workloads still touch overseas hyperscalers." },
  { q: "What is the minimum wage in New Zealand in 2026?", a: "As of 1 April 2026, the NZ adult minimum wage is $23.65 per hour. The starting-out and training minimum wage is $18.92 per hour." },
  { q: "Do I need technical skills to use it?", a: "Not at all. Every agent works through natural conversation — just type or speak. No code, no training required." },
  { q: "Is my data safe?", a: "All data is encrypted in transit and at rest. We follow NZISM guidance, align to AAAIP and the NZ Privacy Act 2020, and your business data is never used to train models. Enterprise customers get attested NZ data residency where available." },
  { q: "Is the advice legally reliable?", a: "Assembl provides guidance grounded in current NZ legislation and policy workflows, not legal advice. Every response references the rule or regulation it draws from. Use Assembl alongside qualified professionals — it's a specialist research and operations layer, not a replacement for your lawyer or accountant." },
  { q: "Can I use it if I don't speak te reo?", a: "Absolutely. All agents work in English. Te reo Māori is woven into Assembl's governance, naming, and tikanga layer — reflecting our commitment to Te Tiriti and the four pou (Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga)." },
  { q: "What does it cost?", a: "Tōro (Family) is $29/mo for whānau (SMS-first, no setup). Operator is $1,490/mo + $590 setup for sole traders and micro-SMEs (1 industry kete). Leader is $1,990/mo + $1,290 setup for multi-discipline teams (2 industry ketes). Enterprise is $2,990/mo + $2,890 setup for multi-site, regulated operations (all 7 industry ketes + Tōro). Outcome is from $5,000/mo for bespoke engagements where Assembl takes on the result. Every paid tier includes the cross-cutting agents AROHA (HR), SIGNAL (security), and SENTINEL (monitoring). All NZD ex GST. Setup fees can be split across the first 3 invoices on request." },
  { q: "I run a business that doesn't fit any industry kete (tech, professional services, B2B). What do I buy?", a: "Operator-as-platform — same $1,490/mo + $590 setup as Operator, no industry kete bundle. You get the full platform, the cross-cutting agents (AROHA, SIGNAL, SENTINEL), and you build your own workflows on top of Iho (our governed router). See /platform." },
  { q: "Can I try before I buy?", a: "Sign up and we map your workflows, agree what success looks like, and run a 10-business-day setup: kickoff workshop, data import, brand kit, two policy gates, and a pilot kit. If we miss the 10-day window we refund the setup fee." },
  { q: "What happens if legislation changes?", a: "We monitor NZ legislative changes and update our compliance layer regularly. When a rate changes (like minimum wage or KiwiSaver), a new regulation takes effect, or an Act is amended, the relevant agents and policy gates are updated to reflect the current law." },
  { q: "How does the annual prepay work?", a: "Annual prepay (ANNUAL12) saves 12% on any business tier. You're billed once per year alongside the setup fee, with a 14-day cool-off. Non-refundable after that." },
  { q: "Can I embed agents on my website?", a: "Yes. Leader and above include an embeddable chat widget. Drop it straight into your website — instant compliance and operational support for your team or customers." },
  { q: "What industries do you cover?", a: "Seven industry kete: Manaaki (hospitality), Waihanga (construction), Auaha (creative), Arataki (automotive & fleet), Pikau (freight & customs), Hoko (retail), and Ako (early childhood education). Tōro covers whānau. Business, professional services, and technology customers buy Operator-as-platform and build their own workflows." },
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
              color: "#4AA5A8",
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
