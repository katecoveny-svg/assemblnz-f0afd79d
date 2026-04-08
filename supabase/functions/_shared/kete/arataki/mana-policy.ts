// ═══════════════════════════════════════════════════════════════
// ARATAKI · MANA — egress policy (hard rules + tikanga gate)
// Hard rules are extra to the platform-wide ones in pipeline.runMana.
// ═══════════════════════════════════════════════════════════════
export const arataki_extraHardRules = [
  // Never autonomously price a vehicle
  { id: "arataki_no_autonomous_pricing", re: /\b(reduce|raise|set|change)\s+(the\s+)?(price|listing)\b/i },
  // Never autonomously commit the dealer to a sale
  { id: "arataki_no_sale_commit",        re: /\b(sold|sale confirmed|deposit accepted)\b/i },
  // Never represent finance approval
  { id: "arataki_no_finance_approval",   re: /\b(finance approved|loan approved|pre-?approved)\b/i },
  // Never claim a Warrant of Fitness pass
  { id: "arataki_no_wof_claim",          re: /\bwof (passed|granted|issued)\b/i },
  // Never claim odometer accuracy
  { id: "arataki_no_odo_certification",  re: /\bodometer (verified|certified|guaranteed)\b/i },
];
