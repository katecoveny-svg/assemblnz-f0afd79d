'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ASSEMBL_GOLD,
  ASSEMBL_WARM_GREY,
  MatarikiCluster,
  levitateClass,
} from '@/components/assembl/chrome';
import type { Tenant } from '@/lib/customers/tenants';

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

export function HubTenantCard({ tenant }: { tenant: Tenant }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -8, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
    >
      <Link
        href={`/customers/${tenant.slug}`}
        className={[
          'group block rounded-2xl border bg-white/85 p-6 shadow-sm backdrop-blur-sm',
          levitateClass,
          tenant.accentClass ?? 'border-neutral-200',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg" style={{ fontFamily: serif, fontWeight: 600 }}>
            {tenant.displayName}
          </h3>
          <MatarikiCluster size={24} gold={tenant.status === 'pilot'} />
        </div>
        {tenant.parentBrand && (
          <p className="mt-1 text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
            {tenant.parentBrand}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed" style={{ color: '#3E3C36' }}>
          {tenant.blurb}
        </p>
        <p
          className="mt-4 text-[12px] uppercase transition-colors group-hover:text-[color:var(--hover)]"
          style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY, ['--hover' as string]: ASSEMBL_GOLD }}
        >
          open ops console →
        </p>
      </Link>
    </motion.div>
  );
}
