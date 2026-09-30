import type { LifeAdminCategory } from './templates';

/** Fictional, local-only examples. Never represent them as the person's real admin or completed work. */
export const LIFE_ADMIN_EXAMPLES = [
  {
    id: 'school', category: 'school' as LifeAdminCategory,
    label: 'School notice', action: 'Try school notice', title: 'Example: Friday school trip',
    document: 'School trip', detail: 'FRIDAY · PACKED LUNCH', output: 'Dates. Gear. Reply.',
    source: 'FICTIONAL EXAMPLE — not a real school notice. Example School trip on Friday 16 October 2026. Meet at school at 8:45 am; return at 3 pm. Bring a packed lunch, water and a sunhat. Return the permission form through the school office by Wednesday 14 October. No payment is needed.',
  },
  {
    id: 'bills', category: 'bills' as LifeAdminCategory,
    label: 'Bill or renewal', action: 'Try bill example', title: 'Example: Power bill to review',
    document: '$89.00', detail: 'POWER BILL · OCTOBER', output: 'Amount. Date. Next step.',
    source: 'FICTIONAL EXAMPLE — not a real bill. Example Power bill for October 2026: amount due NZ$89.00, due date 20 October 2026. The account holder wants to check the amount against the previous bill and confirm whether an existing automatic payment covers it. No account number or payment details are included.',
  },
  {
    id: 'vehicle', category: 'vehicle' as LifeAdminCategory,
    label: 'Car reminder', action: 'Try car reminder', title: 'Example: Car dates to check',
    document: 'WoF due', detail: '16 OCTOBER 2026', output: 'Dates to check.',
    source: 'FICTIONAL EXAMPLE — not a real vehicle record. Car WoF due 16 October 2026. Rego expires 30 November 2026. This fictional petrol car does not need RUC. Check the dates against the actual vehicle documents, then arrange a WoF appointment yourself. No registration plate, VIN or personal details are included.',
  },
] as const;
