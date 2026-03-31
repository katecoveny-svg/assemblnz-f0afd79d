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
  <div className="min-h-screen flex items-center justify-center px-4 py-20" style={{ background: '#09090B' }}>
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
          style={{ background: '#10B981' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
        >
          <Check size={24} color="#09090B" strokeWidth={3} />
        </motion.div>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-[2.5rem] font-display font-bold leading-tight" style={{ color: '#FAFAFA', letterSpacing: '-0.025em' }}>
          Welcome to Assembl
        </h1>
        <p className="mt-2 text-sm sm:text-base font-body" style={{ color: '#A1A1AA' }}>
          Your subscription is active. Here's what happens next.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="rounded-xl p-5"
            style={{
              background: 'rgba(15, 15, 18, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-display font-bold" style={{ background: '#10B981', color: '#09090B' }}>
                {i + 1}
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold" style={{ color: '#FAFAFA' }}>{step.title}</h3>
                <p className="text-xs font-body mt-1 leading-relaxed" style={{ color: '#71717A' }}>{step.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/"
        className="block w-full text-center py-3 rounded-lg text-sm font-semibold font-body transition-colors duration-200"
        style={{ background: '#10B981', color: '#09090B' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
        onMouseLeave={e => (e.currentTarget.style.background = '#10B981')}
      >
        Go to Agent Directory →
      </Link>

      {/* Support */}
      <p className="text-center text-sm font-body" style={{ color: '#71717A' }}>
        Questions? Email{' '}
        <a href="mailto:assembl@assembl.co.nz" className="underline" style={{ color: '#A1A1AA' }}>
          assembl@assembl.co.nz
        </a>
      </p>

      <p className="text-center text-xs font-body" style={{ color: '#3F3F46' }}>
        Built in Aotearoa for NZ businesses
      </p>
    </motion.div>
  </div>
);

export default WelcomePage;
