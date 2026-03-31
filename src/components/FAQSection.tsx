import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "What is Assembl?", a: "Most businesses know they need to comply with NZ law. They just don't have time to read it all. Assembl has — 50+ Acts, from the Holidays Act to the Health and Safety at Work Act. Our 44 specialist tools turn that legislation into plain-English guidance, instant document generation, and compliance checks that take seconds instead of hours." },
  { q: "How is this different from ChatGPT?", a: "ChatGPT gives generic answers based on global training data. Assembl's 44 tools are each trained specifically on NZ legislation — the Employment Relations Act, Building Act, Food Act, Sale and Supply of Alcohol Act, and 50+ other NZ statutes. When you ask a compliance question, you get an answer grounded in the law that actually applies to your business, not American case law rephrased for a NZ audience." },
  { q: "What is the minimum wage in New Zealand in 2026?", a: "As of 1 April 2026, the NZ adult minimum wage is $23.65 per hour. The starting-out and training minimum wage is $18.92 per hour." },
  { q: "Do I need technical skills to use it?", a: "Not at all. Every advisor works through natural conversation — just type or speak. No code, no setup, no training required." },
  { q: "Is my data safe?", a: "Yes. All data is encrypted in transit and at rest. We follow NZISM guidelines and are SOC 2 ready. Your business data is never used to train models." },
  { q: "What NZ legislation is built in?", a: "Our tools are trained on 50+ NZ Acts including the Employment Relations Act 2000, Building Act 2004, Health and Safety at Work Act 2015, Privacy Act 2020, Consumer Guarantees Act 1993, Incorporated Societies Act 2022, Food Act 2014, and many more." },
  { q: "Is the advice legally reliable?", a: "Assembl provides guidance based on current NZ legislation, not legal advice. Every response references the specific Act or regulation it draws from, so you can verify it. We recommend using Assembl alongside qualified professionals — think of it as a specialist research assistant that already knows the law, not a replacement for your lawyer or accountant." },
  { q: "Can I use it if I don't speak te reo?", a: "Absolutely. All tools work in English. Te reo Māori is woven into Assembl's governance and naming — reflecting our commitment to tikanga and Te Tiriti. Te Kāhui Reo offers bilingual tools for businesses that serve Māori communities or want te reo capability, but it's completely optional." },
  { q: "Can I try before I buy?", a: "Absolutely. Every specialist tool offers free messages with no signup required. You can explore all 44 tools before choosing a plan. Powered by specialist intelligence trained on NZ law." },
  { q: "What happens if legislation changes?", a: "We monitor NZ legislative changes and update our tools regularly. When a rate changes (like minimum wage or KiwiSaver), a new regulation takes effect, or an Act is amended, the relevant specialist tools are updated to reflect the current law." },
  { q: "How does the annual discount work?", a: "Annual billing saves you 15% compared to monthly. You're billed once per year at the discounted rate, and can cancel anytime." },
  { q: "Can I embed tools on my website?", a: "Yes. Pro and above plans include an embeddable chat widget. Drop it straight into your website — instant compliance support for your team or customers." },
  { q: "What industries do you cover?", a: "Construction, hospitality, property management, automotive, HR, finance, maritime, agriculture, nonprofit, government, health, education, and many more — 44 specialist tools across every major NZ industry." },
  { q: "Who built this?", a: "Assembl was founded in Auckland by Kate Hudson. Every tool is designed, trained, and maintained in Aotearoa. We're not a US company rebranded for NZ — we built this from the ground up for how New Zealand businesses actually operate." },
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
    <section className="relative z-10 pt-[100px] pb-[100px]" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
              color: "#FFFFFF",
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
                  background: isOpen ? "rgba(22,22,42,0.5)" : "rgba(15,15,26,0.4)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${isOpen ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
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
                      color: "#FFFFFF",
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
