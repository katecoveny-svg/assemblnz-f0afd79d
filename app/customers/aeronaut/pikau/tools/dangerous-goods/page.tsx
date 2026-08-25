'use client';

import { useState } from 'react';
import { draftDangerousGoods, DG_DEFAULTS, IMDG_CLASSES, type DgInput } from '@/lib/customs/dangerous-goods';
import { Card, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';

export default function DangerousGoodsPage() {
  const [input, setInput] = useState<DgInput>(DG_DEFAULTS);
  const result = draftDangerousGoods(input);
  const set = (patch: Partial<DgInput>) => setInput({ ...input, ...patch });

  return (
    <div>
      <PageHeader eyebrow="Tools" title="Dangerous goods declaration" lead="Draft an IMDG declaration for a qualified person to check and sign. Pīkau validates and flags — it never self-certifies dangerous goods." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Details</SectionTitle>
          <div className="space-y-3 text-sm">
            <Field label="UN number"><input value={input.unNumber} onChange={(e) => set({ unNumber: e.target.value })} className="in" /></Field>
            <Field label="Proper shipping name"><input value={input.properShippingName} onChange={(e) => set({ properShippingName: e.target.value })} className="in" /></Field>
            <Field label="IMDG class">
              <select value={input.imdgClass} onChange={(e) => set({ imdgClass: e.target.value })} className="in">
                {IMDG_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Packing group">
              <select value={input.packingGroup} onChange={(e) => set({ packingGroup: e.target.value as DgInput['packingGroup'] })} className="in">
                {['I', 'II', 'III'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Net quantity (kg)"><input type="number" value={input.netQuantityKg} onChange={(e) => set({ netQuantityKg: Number(e.target.value) })} className="in" /></Field>
            <Field label="24-hr emergency contact"><input value={input.emergencyContact} onChange={(e) => set({ emergencyContact: e.target.value })} className="in" /></Field>
            <label className="flex items-center gap-2 text-xs text-[color:var(--air-slate)]">
              <input type="checkbox" checked={input.hasExplosivesLicence} onChange={(e) => set({ hasExplosivesLicence: e.target.checked })} />
              Holds an Explosives Controller licence (Class 1 only)
            </label>
          </div>
          <style>{`.in{width:100%;border:1px solid var(--air-line);background:#fff;border-radius:8px;padding:6px 10px;font-size:0.85rem;outline:none}`}</style>
        </Card>
        <Card mist>
          <SectionTitle>Draft declaration</SectionTitle>
          {result.blocks.map((b, i) => <p key={i} className="mb-2 rounded bg-[color:rgba(165,64,47,0.1)] p-2 text-xs text-[color:var(--air-hold)]">{b}</p>)}
          {result.errors.length > 0 ? (
            <ul className="mb-2 list-disc pl-4 text-xs text-[color:var(--air-warn)]">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          ) : null}
          {result.declaration ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-[color:var(--air-line)] bg-white p-3 font-mono text-[0.75rem] text-[color:var(--air-ink)]">{result.declaration}</pre>
          ) : (
            <p className="text-sm text-[color:var(--air-slate)]">Complete the fields above to generate a draft.</p>
          )}
          <p className="mt-2 flex items-center gap-2 text-[0.75rem] text-[color:var(--air-slate)]"><Pill tone="navy">basis</Pill>{result.citation}</p>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[color:var(--air-slate)]">{label}</span>
      {children}
    </label>
  );
}
