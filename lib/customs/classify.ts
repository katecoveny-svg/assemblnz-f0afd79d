/**
 * HS classification — the Pīkau intelligence layer's tariff engine.
 *
 * Ported from the tariff-classifier sub-agent contract
 * (plugins/managed-agent-cookbooks/pikau-customs-broker/subagents/
 * tariff-classifier.yaml). Behaviour is deterministic and draft-only:
 *
 *   - ALWAYS returns three ranked candidates, never one.
 *   - Each candidate names the General Rule(s) of Interpretation applied.
 *   - Codes matched against the real Working Tariff reference are marked
 *     confirmed-from-reference; anything else is an explicit SUGGESTION that a
 *     licensed broker (or a binding tariff ruling) must confirm.
 *   - Recommends a binding tariff ruling (Customs and Excise Act 2018 s.135)
 *     when the best candidate is low-confidence or the field is contested.
 *
 * It never lodges, never commits a single code, never speaks for the importer.
 */
import type {
  ClassificationResult,
  CustomsCitation,
  HsCandidate,
} from './types';
import {
  HS_REFERENCE,
  WORKING_TARIFF_CITATION,
  inferDutyRateByChapter,
  matchReference,
  type HsReferenceEntry,
} from './hs-reference';

const CE_ACT_RULING: CustomsCitation = {
  source: 'Customs and Excise Act 2018',
  ref: 's.135 (Tariff classification rulings)',
  note: 'A binding tariff ruling gives certainty on classification before importation.',
  url: 'https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html',
  retrievedAt: '2026-07-01',
};

const GRI_CITATION: CustomsCitation = {
  source: 'WCO Harmonised System — General Rules for the Interpretation',
  ref: 'GRI 1–6',
  note: 'Goods are classified by applying the GRIs in order.',
  url: 'https://www.wcoomd.org/en/topics/nomenclature/instrument-and-tools/hs-nomenclature-2022-edition.aspx',
  retrievedAt: '2026-07-01',
};

const SIGN_OFF =
  'Drafted by the Pīkau tariff engine. A licensed customs broker must review and select a single classification before lodgement — this is not advice and nothing here is lodged with the NZ Customs Service.';

function referenceCandidate(
  entry: HsReferenceEntry,
  confidence: HsCandidate['confidence'],
  rank: 'preferred' | 'alternate' | 'long shot',
): HsCandidate {
  return {
    hsCode: entry.hsCode,
    headingText: entry.headingText,
    griApplied: entry.griApplied,
    griReasoning: entry.griReasoning,
    confidence,
    dutyRatePercent: entry.dutyRatePercent,
    suggestion: false,
    brokerNote:
      rank === 'preferred'
        ? `Matched against the Working Tariff reference (${entry.chapterText}). Broker to confirm the full 11-digit code (8-digit tariff + 3-digit statistical key).${entry.exciseNote ? ' ' + entry.exciseNote : ''}`
        : `Alternate reading — consider if the goods differ from the preferred description. ${entry.griReasoning}`,
  };
}

/**
 * Classify a goods description into three ranked HS candidates with GRI
 * reasoning. `hintCode` lets a user seed a code they believe applies; it is
 * treated as a suggestion and reasoned about, never trusted blindly.
 */
export function classifyGoods(
  goodsDescription: string,
  hintCode?: string,
): ClassificationResult {
  const description = goodsDescription.trim();
  const matches = matchReference(description);
  const candidates: HsCandidate[] = [];

  if (matches.length > 0) {
    // Preferred = strongest keyword match.
    candidates.push(referenceCandidate(matches[0], 'high', 'preferred'));
    // Alternate = next reference match, or a related line in the same chapter.
    if (matches[1]) {
      candidates.push(referenceCandidate(matches[1], 'medium', 'alternate'));
    } else {
      const sameChapter = HS_REFERENCE.find(
        (e) =>
          e.hsCode.slice(0, 2) === matches[0].hsCode.slice(0, 2) &&
          e.hsCode !== matches[0].hsCode,
      );
      if (sameChapter) {
        candidates.push(referenceCandidate(sameChapter, 'medium', 'alternate'));
      }
    }
  }

  // Long-shot / suggestion candidate — always present so brokers see the
  // boundary case, and to fill to three when the reference is thin.
  const hint = (hintCode ?? '').trim();
  if (hint) {
    candidates.push(suggestionCandidate(description, hint));
  }

  while (candidates.length < 3) {
    candidates.push(
      suggestionCandidate(
        description,
        undefined,
        candidates.length === 0 ? 'preferred' : 'long shot',
      ),
    );
  }

  const best = candidates[0];
  const recommendRuling =
    best.suggestion || best.confidence === 'low' || matches.length === 0;

  return {
    goodsDescription: description,
    candidates: candidates.slice(0, 3),
    recommendRuling,
    rulingReason: recommendRuling
      ? 'The description does not resolve cleanly to a single Working Tariff line, or the leading candidate is a suggestion. Seek a binding tariff ruling (s.135) before importation to lock the classification and duty treatment.'
      : 'The leading candidate matches a Working Tariff reference line with high confidence. A binding ruling is optional; the broker confirms at lodgement.',
    citations: [WORKING_TARIFF_CITATION, GRI_CITATION, CE_ACT_RULING],
    signOffLine: SIGN_OFF,
  };
}

function suggestionCandidate(
  description: string,
  hintCode?: string,
  rank: 'preferred' | 'alternate' | 'long shot' = 'long shot',
): HsCandidate {
  const code = normaliseHsHint(hintCode);
  const dutyRatePercent = inferDutyRateByChapter(code || '', description);
  return {
    hsCode: code || 'to be classified — broker confirms',
    headingText: code
      ? 'Suggested heading — confirm against the Working Tariff chapter and section notes.'
      : 'No confident reference match — classification requires broker judgement or a binding ruling.',
    griApplied: code ? ['GRI 1', 'GRI 6'] : ['GRI 1'],
    griReasoning: code
      ? 'GRI 1 applied provisionally to the seeded code: verify the heading terms and any relevant section/chapter notes actually cover these goods before relying on it. GRI 6 for the subheading.'
      : 'GRI 1: no heading was identified from the description alone. The goods need to be examined against heading terms and section/chapter notes, applying GRI 2–6 as needed.',
    confidence: 'low',
    dutyRatePercent,
    suggestion: true,
    brokerNote:
      rank === 'preferred'
        ? 'SUGGESTION ONLY — not matched to the reference. Do not lodge on this basis; classify from the Tariff or seek a ruling.'
        : 'Boundary/long-shot reading offered for completeness. Duty rate is an indicative chapter default, not a confirmed rate.',
  };
}

function normaliseHsHint(code?: string): string {
  if (!code) return '';
  const cleaned = code.replace(/[^\d.]/g, '');
  return /^\d{4}(\.\d{2}){0,2}$/.test(cleaned) ? cleaned : '';
}
