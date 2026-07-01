/**
 * Free Trade Agreement preference checker.
 *
 * Ported from legacy-vite/src/components/pikau/PikauFtaChecker.tsx. Given an
 * HS code and origin country, reports whether a preferential duty rate may be
 * claimed under one of New Zealand's FTAs, the rule of origin that applies,
 * and the origin evidence a broker will need on file.
 *
 * Preferential rates are indicative and origin-dependent — eligibility always
 * turns on the goods actually meeting the rule of origin, which the licensed
 * broker verifies from the certificate/declaration of origin.
 */
import type { FtaAgreement, FtaCheckResult } from './types';
import { inferDutyRateByChapter } from './hs-reference';

export const FTA_AGREEMENTS: FtaAgreement[] = [
  {
    country: 'AU',
    countryName: 'Australia',
    agreement: 'ANZCERTA / AANZFTA',
    preferentialRatePercent: 0,
    ruleOfOrigin: 'Wholly obtained, or substantial transformation (change in tariff heading).',
    originEvidence: 'Manufacturer/exporter declaration of origin.',
    citation: {
      source: 'Australia–New Zealand Closer Economic Relations Trade Agreement',
      ref: 'CER Rules of Origin',
      url: 'https://www.customs.govt.nz/business/international/free-trade-agreements/',
      retrievedAt: '2026-07-01',
    },
  },
  {
    country: 'CN',
    countryName: 'China',
    agreement: 'NZ–China FTA',
    preferentialRatePercent: 0,
    ruleOfOrigin: 'Regional value content ≥ 40%, or change in tariff classification per the PSR schedule.',
    originEvidence: 'Certificate of origin (Form issued by an authorised body).',
    citation: {
      source: 'New Zealand–China Free Trade Agreement',
      ref: 'Chapter 4 (Rules of Origin)',
      url: 'https://www.customs.govt.nz/business/international/free-trade-agreements/',
      retrievedAt: '2026-07-01',
    },
  },
  {
    country: 'JP',
    countryName: 'Japan',
    agreement: 'CPTPP',
    preferentialRatePercent: 0,
    ruleOfOrigin: 'Product-specific rule per CPTPP Annex 3-D; certification of origin.',
    originEvidence: 'Certification of origin (importer, exporter or producer).',
    citation: {
      source: 'Comprehensive and Progressive Agreement for Trans-Pacific Partnership',
      ref: 'Annex 3-D (Product-Specific Rules)',
      url: 'https://www.customs.govt.nz/business/international/free-trade-agreements/',
      retrievedAt: '2026-07-01',
    },
  },
  {
    country: 'GB',
    countryName: 'United Kingdom',
    agreement: 'NZ–UK FTA',
    preferentialRatePercent: 0,
    ruleOfOrigin: 'Originating goods per NZ–UK FTA Article 3.2; many lines phased to 0%.',
    originEvidence: 'Declaration of origin, or importer knowledge.',
    citation: {
      source: 'New Zealand–United Kingdom Free Trade Agreement',
      ref: 'Article 3.2 (Originating Goods)',
      url: 'https://www.customs.govt.nz/business/international/free-trade-agreements/',
      retrievedAt: '2026-07-01',
    },
  },
  {
    country: 'KR',
    countryName: 'Korea',
    agreement: 'NZ–Korea FTA',
    preferentialRatePercent: 0,
    ruleOfOrigin: 'Product-specific rule per NZ–Korea Annex 3-A.',
    originEvidence: 'Certificate of origin.',
    citation: {
      source: 'New Zealand–Korea Free Trade Agreement',
      ref: 'Annex 3-A (Product-Specific Rules)',
      url: 'https://www.customs.govt.nz/business/international/free-trade-agreements/',
      retrievedAt: '2026-07-01',
    },
  },
];

/** UK is reachable via GB or UK inputs. */
function normaliseCountry(code: string): string {
  const c = code.trim().toUpperCase();
  if (c === 'UK') return 'GB';
  return c;
}

export function checkFtaPreference(
  hsCode: string,
  originCountry: string,
  referenceDutyRatePercent?: number,
): FtaCheckResult {
  const country = normaliseCountry(originCountry);
  const agreement = FTA_AGREEMENTS.find((a) => a.country === country) ?? null;
  const generalRatePercent =
    referenceDutyRatePercent ?? inferDutyRateByChapter(hsCode, '');

  if (!agreement) {
    return {
      hsCode,
      originCountry: country,
      eligible: false,
      agreement: null,
      generalRatePercent,
      preferentialRatePercent: generalRatePercent,
      savingPercent: 0,
      requirement: 'No FTA covers this origin — the General (Normal) duty rate applies.',
      note:
        generalRatePercent === 0
          ? 'The General rate is already Free for this line, so no preference is needed.'
          : 'Duty is payable at the General rate. Check whether a concession or the origin qualifies under any other scheme.',
    };
  }

  const preferentialRatePercent = agreement.preferentialRatePercent;
  const savingPercent = Math.max(0, generalRatePercent - preferentialRatePercent);

  return {
    hsCode,
    originCountry: country,
    eligible: true,
    agreement,
    generalRatePercent,
    preferentialRatePercent,
    savingPercent,
    requirement: `${agreement.ruleOfOrigin} Evidence on file: ${agreement.originEvidence}`,
    note:
      savingPercent > 0
        ? `Claiming ${agreement.agreement} preference could reduce duty from ${generalRatePercent}% to ${preferentialRatePercent}% — but only if the goods meet the rule of origin and the evidence is held.`
        : `The General rate is already ${generalRatePercent}%. ${agreement.agreement} preference confirms Free treatment; keep the origin evidence on file regardless.`,
  };
}
