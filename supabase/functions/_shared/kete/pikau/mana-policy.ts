// ═══════════════════════════════════════════════════════════════
// PIKAU · MANA — egress policy (extra hard rules)
// ═══════════════════════════════════════════════════════════════
export const pikau_extraHardRules = [
  { id: "pikau_no_nzcs_submit",        re: /\b(submit|file|lodge)\b.*\bnzcs\b/i },
  { id: "pikau_no_broker_impersonate", re: /\b(I am|on behalf of)\b.*\b(licensed broker|customs broker)\b/i },
  { id: "pikau_no_release_authority",  re: /\b(authorise|release|clear)\b.*\b(goods|consignment|cargo)\b.*\b(without|before)\b/i },
  { id: "pikau_no_payment_movement",   re: /\b(pay|transfer)\b.*\b(duty|gst)\b/i },
  { id: "pikau_no_dg_self_certify",    re: /\b(certified|approved)\b.*\bdangerous goods\b/i },
];
