import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "APEX saved us 12 hours a week on compliance paperwork alone. It knows the Building Act better than most site managers I've worked with.",
    name: "Mike T.",
    role: "Construction Company Owner",
    location: "Auckland",
    color: "#5AADA0",
  },
  {
    quote: "I replaced three SaaS tools with Assembl. The accounting agent handles GST returns, PAYE calculations, and KiwiSaver contributions — all NZ-compliant out of the box.",
    name: "Sarah L.",
    role: "Small Business Accountant",
    location: "Wellington",
    color: "#3A6A9C",
  },
  {
    quote: "AURA generates pre-arrival guest dossiers that rival what a five-star concierge team produces. Our repeat booking rate is up 34% since we started using it.",
    name: "James W.",
    role: "Boutique Hotel Manager",
    location: "Queenstown",
    color: "#3A6A9C",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative z-10 py-20 sm:py-28 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-foreground mb-3">
            Built for <span className="text-gradient-hero">Aotearoa</span>
          </h2>
          <p className="text-sm font-body text-muted-foreground">Real feedback from NZ businesses using Assembl every day.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="relative rounded-2xl p-6 border border-border bg-card overflow-hidden"
              style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {/* Top glow */}
              <span
                className="absolute top-0 left-[15%] right-[15%] h-px opacity-30"
                style={{ background: `linear-gradient(90deg, transparent, ${t.color}, transparent)` }}
              />

              <Quote size={20} className="mb-3" style={{ color: t.color, opacity: 0.5 }} />

              <p className="text-xs font-body text-foreground/80 leading-relaxed mb-5 italic">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs"
                  style={{ backgroundColor: t.color + "18", color: t.color, border: `1px solid ${t.color}30` }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-display font-bold text-foreground">{t.name}</p>
                  <p className="text-[10px] font-body text-muted-foreground">{t.role} · {t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
