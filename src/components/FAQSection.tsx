import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "What is Assembl?", a: "Most businesses know they need to comply with NZ law. They just don't have time to read it all. Assembl has — 50+ Acts, from the Holidays Act to the Health and Safety at Work Act. Our 42 specialist tools turn that legislation into plain-English guidance, instant document generation, and compliance checks that take seconds instead of hours." },
  { q: "Do I need technical skills to use it?", a: "Not at all. Every advisor works through natural conversation — just type or speak. No code, no setup, no training required." },
  { q: "Is my data safe?", a: "Yes. All data is encrypted in transit and at rest. We follow NZISM guidelines and are SOC 2 ready. Your business data is never used to train models." },
  { q: "What NZ legislation is built in?", a: "Our tools are trained on 50+ NZ Acts including the Employment Relations Act 2000, Building Act 2004, Health and Safety at Work Act 2015, Privacy Act 2020, Consumer Guarantees Act 1993, Incorporated Societies Act 2022, Food Act 2014, and many more." },
  { q: "Can I try before I buy?", a: "Absolutely. Every specialist tool offers 3 free messages with no signup required. You can explore all 42 tools before choosing a plan. Powered by specialist intelligence trained on NZ law." },
  { q: "How does the annual discount work?", a: "Annual billing saves you 15% compared to monthly. You're billed once per year at the discounted rate, and can cancel anytime." },
  { q: "Can I embed tools on my website?", a: "Yes. Pro and above plans include an embeddable chat widget. Drop it straight into your website — instant compliance support for your team or customers." },
  { q: "What industries do you cover?", a: "Construction, hospitality, property management, automotive, HR, finance, maritime, agriculture, nonprofit, government, health, education, and many more — 42 specialist tools across every major NZ industry." },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-24 sm:py-32">
      <div className="section-divider" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-mono-jb text-[10px] uppercase tracking-[4px] text-primary/70 mb-3">Support</p>
          <h2
            className="text-2xl sm:text-[2.75rem] font-syne font-bold text-foreground mb-4"
            style={{ letterSpacing: '-0.02em', lineHeight: '1.15' }}
          >
            Frequently asked <span className="text-gradient-hero">questions</span>
          </h2>
          <p className="text-sm font-inter text-muted-foreground">Everything you need to know about Assembl.</p>
        </motion.div>

        <div className="space-y-2.5">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl overflow-hidden group"
                style={{
                  background: isOpen ? 'hsl(var(--surface-2) / 0.5)' : 'hsl(var(--surface-1) / 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${isOpen ? 'hsl(var(--border))' : 'hsl(var(--border) / 0.4)'}`,
                  transition: 'all 0.3s ease',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left"
                >
                  <span className="text-[13px] sm:text-sm font-syne font-bold text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 text-muted-foreground/50 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
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
                      <p className="px-5 sm:px-6 pb-5 text-xs sm:text-[13px] font-inter text-muted-foreground leading-relaxed">
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
