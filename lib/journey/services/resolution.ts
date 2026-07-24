/**
 * assembl — resolution service
 * ----------------------------
 * Stage 9: handle the exceptions every real shop hits — an item becomes
 * unavailable, or the basket runs over budget. The agent proposes a resolution
 * and requests approval; when it cannot safely resolve within the dietary and
 * budget rules, it escalates to a human rather than guessing.
 */

import { productBySku, type CatalogueProduct, type DietaryTag } from '../catalogue';
import type { BasketItem, PlanResult } from './plan';

export type ResolutionProposal = {
  id: string;
  kind: 'swap' | 'remove' | 'escalate';
  fromSku?: string;
  toSku?: string;
  reason: string;
  /** Change to the basket total if applied (negative = saving). */
  estimatedDeltaNzd: number;
};

export type ResolutionOutcome = {
  issue: 'unavailable_item' | 'budget_exceeded';
  resolvable: boolean;
  proposals: ResolutionProposal[];
  summary: string;
  /** Consequential swaps always require approval. */
  requiresApproval: boolean;
};

function violatesDiet(dietary: DietaryTag[], exclusions: Set<DietaryTag>): boolean {
  return dietary.some((t) => exclusions.has(t));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Resolve any unavailable items in the basket by proposing an available,
 * diet-compatible substitute. Escalates the specific item if none exists.
 */
export function resolveUnavailableItems(
  basket: BasketItem[],
  exclusions: Set<DietaryTag>,
): ResolutionOutcome {
  const proposals: ResolutionProposal[] = [];
  const unavailable = basket.filter((i) => !i.available);

  for (const item of unavailable) {
    const product = productBySku(item.sku);
    const subSku = (product?.substitutes ?? []).find((s) => {
      const p = productBySku(s);
      return p?.available && !violatesDiet(p.dietary, exclusions);
    });
    if (subSku) {
      const sub = productBySku(subSku) as CatalogueProduct;
      proposals.push({
        id: `res-swap-${item.sku}`,
        kind: 'swap',
        fromSku: item.sku,
        toSku: subSku,
        reason: `${item.name} is unavailable. Closest available match: ${sub.name}.`,
        estimatedDeltaNzd: round2((sub.priceNzd - item.unitPriceNzd) * item.quantity),
      });
    } else {
      proposals.push({
        id: `res-escalate-${item.sku}`,
        kind: 'escalate',
        fromSku: item.sku,
        reason: `${item.name} is unavailable and no in-stock, diet-safe substitute exists. Handing to a person.`,
        estimatedDeltaNzd: 0,
      });
    }
  }

  const resolvable = unavailable.length > 0 && proposals.every((p) => p.kind !== 'escalate');
  return {
    issue: 'unavailable_item',
    resolvable,
    proposals,
    summary:
      unavailable.length === 0
        ? 'All items are available.'
        : `${unavailable.length} item(s) unavailable — ${proposals.filter((p) => p.kind === 'swap').length} swap(s) proposed.`,
    requiresApproval: proposals.some((p) => p.kind === 'swap'),
  };
}

/**
 * Resolve a basket that exceeds budget: propose premium→value swaps (cheapest
 * savings first), then removals, until the basket fits. Escalates if it still
 * cannot fit within the dietary rules.
 */
export function resolveBudget(plan: PlanResult): ResolutionOutcome {
  const proposals: ResolutionProposal[] = [];
  if (plan.budgetCeilingNzd == null || plan.withinBudget) {
    return {
      issue: 'budget_exceeded',
      resolvable: true,
      proposals,
      summary: 'Basket is within budget.',
      requiresApproval: false,
    };
  }

  let projectedTotal = plan.estimatedTotalNzd;
  const ceiling = plan.budgetCeilingNzd;

  // Apply the value swaps the plan already surfaced, biggest saving first.
  const swaps = [...plan.valueOpportunities].sort(
    (a, b) => b.estimatedSavingNzd - a.estimatedSavingNzd,
  );
  for (const swap of swaps) {
    if (projectedTotal <= ceiling) break;
    proposals.push({
      id: `res-budget-swap-${swap.sku}`,
      kind: 'swap',
      fromSku: swap.sku,
      reason: swap.suggestion,
      estimatedDeltaNzd: -swap.estimatedSavingNzd,
    });
    projectedTotal = round2(projectedTotal - swap.estimatedSavingNzd);
  }

  // If still over, propose removing the most expensive non-staple lines.
  if (projectedTotal > ceiling) {
    const removable = [...plan.basket]
      .filter((i) => !i.forMeals.length ? false : true)
      .sort((a, b) => b.lineTotalNzd - a.lineTotalNzd);
    for (const item of removable) {
      if (projectedTotal <= ceiling) break;
      proposals.push({
        id: `res-budget-remove-${item.sku}`,
        kind: 'remove',
        fromSku: item.sku,
        reason: `Remove ${item.name} to come back under budget.`,
        estimatedDeltaNzd: -item.lineTotalNzd,
      });
      projectedTotal = round2(projectedTotal - item.lineTotalNzd);
    }
  }

  const resolvable = projectedTotal <= ceiling;
  if (!resolvable) {
    proposals.push({
      id: 'res-budget-escalate',
      kind: 'escalate',
      reason: 'Cannot fit the basket within budget without breaking dietary needs. Handing to a person.',
      estimatedDeltaNzd: 0,
    });
  }

  return {
    issue: 'budget_exceeded',
    resolvable,
    proposals,
    summary: resolvable
      ? `Proposed changes bring the basket to about $${projectedTotal.toFixed(2)} (ceiling $${ceiling.toFixed(2)}).`
      : `Even after swaps and removals the basket stays over $${ceiling.toFixed(2)} — escalating.`,
    requiresApproval: proposals.some((p) => p.kind === 'swap' || p.kind === 'remove'),
  };
}
