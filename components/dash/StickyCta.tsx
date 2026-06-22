/**
 * StickyCta — a birdie-style sticky bottom bar (their "Add to cart"), reframed
 * as the waitlist CTA. Sits at the foot of the page, yellow with black ink.
 */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function StickyCta() {
  return (
    <div className="dashSticky">
      <div className="wrap dashSticky__inner">
        <span className="dashSticky__msg">
          Get paid to wait.
          <small>Opt-in · rewards, not cash · free</small>
        </span>
        <Link href="/dash#waitlist" className="btn btn--primary">
          Join the waitlist <ArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
