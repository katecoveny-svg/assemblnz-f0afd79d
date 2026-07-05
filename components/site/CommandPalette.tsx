'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { CornerDownLeft, FileText, Layers3, Search, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AGENTS } from '@/lib/agents';
import { KETES } from '@/lib/kete';
import { KETE_VESSEL_IMAGES } from '@/lib/brand-tokens';

const PAGES = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Evidence pack', href: '/evidence-pack' },
  { label: 'Arataki loan cars', href: '/operator/arataki/loan-cars' },
  { label: 'HAPAI tools', href: '/hapai' },
  { label: 'Founder', href: '/about' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const agents = useMemo(() => AGENTS.filter((agent, index, array) => array.findIndex((a) => a.slug === agent.slug) === index), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const onOpen = () => setOpen(true);
    window.addEventListener('assembl:open-command', onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('assembl:open-command', onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(35,33,31,0.24)] backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-0 top-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[color:var(--assembl-paper)] shadow-[0_32px_90px_rgba(35,33,31,0.24)] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 md:left-1/2 md:top-[12vh] md:h-auto md:w-[min(calc(100vw-2rem),720px)] md:-translate-x-1/2 md:rounded-[8px] md:border md:border-[rgba(35,33,31,0.14)]"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <Dialog.Title className="sr-only">Search assembl</Dialog.Title>
          <Command label="Search assembl" className="flex flex-1 flex-col [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-[color:var(--text-secondary)]">
            <div className="flex items-center gap-3 border-b border-[rgba(35,33,31,0.10)] px-4 py-3">
              <Search className="h-4 w-4 text-[color:var(--text-secondary)]" aria-hidden />
              <Command.Input
                autoFocus
                placeholder="Find HAPAI tools, kete packs, agents, or pages..."
                aria-label="Search assembl"
                className="h-11 flex-1 bg-transparent text-base outline-none placeholder:text-[color:var(--text-secondary)] md:text-body-md"
              />
              <Dialog.Close
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition hover:bg-[rgba(35,33,31,0.06)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:bg-[rgba(35,33,31,0.06)] focus-visible:text-[color:var(--text-primary)]"
                aria-label="Close command palette"
                title="Close"
              >
                <X className="h-5 w-5" aria-hidden />
              </Dialog.Close>
            </div>
            <Command.List
              className="flex-1 overflow-y-auto p-2 md:max-h-[62vh]"
              style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
            >
              <Command.Empty className="px-4 py-8 text-center text-body-md text-[color:var(--text-secondary)]">No result found.</Command.Empty>
              <Command.Group heading="Kete packs">
                {KETES.map((kete) => (
                  <Command.Item
                    key={kete.slug}
                    value={`${kete.name} ${kete.englishName} ${kete.industry} ${kete.meaning}`}
                    onSelect={() => go(`/kete/${kete.slug}`)}
                    className="group flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[8px] border-l-4 px-3 py-3 transition-all aria-selected:bg-assembl-pounamu/10 aria-selected:shadow-sm aria-selected:ring-1 aria-selected:ring-[color:var(--assembl-pounamu)]/30"
                    style={{ borderLeftColor: kete.accent }}
                  >
                    <img src={KETE_VESSEL_IMAGES[kete.slug]} alt="" className="h-8 w-8 rounded-sm object-cover" />
                    <Layers3 className="h-4 w-4 text-[color:var(--text-secondary)]" aria-hidden />
                    <span className="flex-1 text-body-md">{kete.name}</span>
                    <span className="text-xs text-[color:var(--text-secondary)] group-aria-selected:hidden">{kete.englishName}</span>
                    <kbd className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--text-secondary)] group-aria-selected:flex">
                      <span>Press</span>
                      <CornerDownLeft className="h-3 w-3" />
                    </kbd>
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Specialist agents">
                {agents.map((agent) => {
                  const kete = KETES.find((item) => item.slug === agent.kete)!;
                  return (
                    <Command.Item
                      key={agent.slug}
                      value={`${agent.name} ${agent.role} ${kete.name} ${kete.englishName}`}
                      onSelect={() => go(`/agents/${agent.slug}`)}
                      className="group flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[8px] border-l-4 px-3 py-3 transition-all aria-selected:bg-assembl-pounamu/10 aria-selected:shadow-sm aria-selected:ring-1 aria-selected:ring-[color:var(--assembl-pounamu)]/30"
                      style={{ borderLeftColor: kete.accent }}
                    >
                      <Sparkles className="h-4 w-4 text-[color:var(--text-secondary)]" aria-hidden />
                      <span className="flex-1 text-body-md">{agent.name}</span>
                      <span className="text-xs text-[color:var(--text-secondary)] group-aria-selected:hidden">{kete.englishName}</span>
                      <kbd className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--text-secondary)] group-aria-selected:flex">
                        <span>Press</span>
                        <CornerDownLeft className="h-3 w-3" />
                      </kbd>
                    </Command.Item>
                  );
                })}
              </Command.Group>
              <Command.Group heading="Pages">
                {PAGES.map((page) => (
                  <Command.Item
                    key={page.href}
                    value={page.label}
                    onSelect={() => go(page.href)}
                    className="group flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[8px] border-l-4 border-[color:var(--assembl-pounamu)] px-3 py-3 transition-all aria-selected:bg-assembl-pounamu/10 aria-selected:shadow-sm aria-selected:ring-1 aria-selected:ring-[color:var(--assembl-pounamu)]/30"
                  >
                    <FileText className="h-4 w-4 text-[color:var(--text-secondary)]" aria-hidden />
                    <span className="flex-1 text-body-md">{page.label}</span>
                    <kbd className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--text-secondary)] group-aria-selected:flex">
                      <span>Press</span>
                      <CornerDownLeft className="h-3 w-3" />
                    </kbd>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
