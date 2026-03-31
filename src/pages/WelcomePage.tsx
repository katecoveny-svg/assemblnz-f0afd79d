import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Check your email",
    desc: "We've sent your login details to the email you used at checkout. If you don't see it within 5 minutes, check your spam folder.",
  },
  {
    title: "Choose your agents",
    desc: "Browse the agent directory and select your agent(s). Your plan determines how many you can activate.",
  },
  {
    title: "Start your first conversation",
    desc: "Your agents already know NZ legislation, your industry templates, and compliance deadlines. Just ask them anything — they're ready.",
  },
];

const WelcomePage = () => (
  <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-background">
    {/* Dot grid */}
    <div className="fixed inset-0 pointer-events-none z-0" style={{
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }} />

    <motion.div
      className="relative z-10 w-full max-w-[640px] space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Checkmark */}
      <div className="flex justify-center">
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'hsl(var(--primary))' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
        >
          <Check size={24} className="text-primary-foreground" strokeWidth={3} />
        </motion.div>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-[2.5rem] font-display leading-tight text-foreground" style={{ fontWeight: 300, letterSpacing: '-0.025em' }}>
          Welcome to Assembl
        </h1>
        <p className="mt-2 text-sm sm:text-base font-body text-muted-foreground">
          Your subscription is active. Here's what happens next.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="glass-card glow-card-hover rounded-xl p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-display" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontWeight: 300 }}>
                {i + 1}
              </div>
              <div>
                <h3 className="text-sm font-display font-medium text-foreground">{step.title}</h3>
                <p className="text-xs font-body mt-1 leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/"
        className="cta-glass-green block w-full text-center py-3 rounded-full text-sm"
      >
        Go to Agent Directory →
      </Link>

      {/* Support */}
      <p className="text-center text-sm font-body text-muted-foreground">
        Questions? Email{' '}
        <a href="mailto:assembl@assembl.co.nz" className="underline text-foreground/70 hover:text-foreground transition-colors">
          assembl@assembl.co.nz
        </a>
      </p>

      <p className="text-center text-xs font-body text-muted-foreground/40">
        Built in Aotearoa for NZ businesses
      </p>
    </motion.div>
  </div>
);

export default WelcomePage;