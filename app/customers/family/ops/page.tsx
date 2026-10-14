import Link from 'next/link';
import { FAMILY_DEMO, familyDemoSection } from '@/lib/family/demo';

/** Demo admission is not family-owner authorization. This route has no private data or action imports. */
export default async function FamilyOpsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const section = familyDemoSection((await searchParams).tab);
  return (
    <main className="flex flex-col gap-6 text-[color:var(--brand-ink)]">
      <header className="rounded-2xl border border-[color:var(--brand-muted)]/20 bg-[color:var(--brand-surface)] p-5">
        <p className="text-sm text-[color:var(--brand-muted)]">{FAMILY_DEMO.label}</p>
        <h1 className="mt-2 text-3xl">A little less family admin.</h1>
        <p className="mt-3 max-w-2xl leading-relaxed">Explore a made-up household. Every profile and example on this page is synthetic. This is a read-only demonstration, not a family account.</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed">No inbox, saved notes, family records or connected services are loaded. Real family profiles need a separately verified private workspace.</p>
      </header>
      <section aria-labelledby="family-demo-people">
        <h2 id="family-demo-people" className="text-xl">Example whānau</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {FAMILY_DEMO.people.map(person => <li key={person.id} className="rounded-xl border border-[color:var(--brand-muted)]/20 bg-[color:var(--brand-surface)] p-4"><h3 className="font-semibold">{person.name}</h3><p className="mt-1 text-sm text-[color:var(--brand-muted)]">{person.role}</p></li>)}
        </ul>
      </section>
      <section aria-labelledby="family-demo-section" className="rounded-2xl border border-[color:var(--brand-muted)]/20 bg-[color:var(--brand-surface)] p-5">
        <h2 id="family-demo-section" className="text-xl">{section.title}</h2>
        <p className="mt-3 max-w-2xl leading-relaxed">{section.text}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">{section.items.map(item => <li key={item}>{item}</li>)}</ul>
      </section>
      <p className="text-sm text-[color:var(--brand-muted)]">Nothing is saved, sent, booked or paid from this demonstration. <Link href="/do" className="underline">Open DO</Link></p>
    </main>
  );
}
