'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { CornerDownLeft, FileText, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const PUBLIC_COMMAND_PAGES = [
  { label: 'Home', href: '/' },
  { label: 'Pursuit', href: '/pursuit' },
  { label: 'DO', href: '/do' },
  { label: 'Studio', href: '/creative-studio' },
  { label: 'Contact assembl', href: '/contact' },
] as const;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const focusSession = useRef<{ element: HTMLElement | null; path: string } | null>(null);
  const isOpen = useRef(false);

  useEffect(() => {
    const show = () => {
      if (isOpen.current) return;
      const element = document.activeElement;
      const path = window.location.pathname + window.location.search;
      const previous = focusSession.current;
      const insideClosingDialog = element instanceof HTMLElement && element.closest('[role="dialog"]');
      const target = insideClosingDialog
        ? previous?.path === path ? previous.element : null
        : element instanceof HTMLElement && element.matches('a[href],button,input,select,textarea,[tabindex],[contenteditable="true"]') ? element : null;
      // Each opening gets its own identity, including close/reopen interruptions.
      focusSession.current = { element: target, path };
      isOpen.current = true;
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isOpen.current) { isOpen.current = false; setOpen(false); }
        else show();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const onOpen = show;
    window.addEventListener('assembl:open-command', onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('assembl:open-command', onOpen);
    };
  }, []);

  const renderedFocusSession = focusSession.current;
  const go = (href: string) => {
    focusSession.current = null;
    isOpen.current = false;
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => { isOpen.current = value; setOpen(value); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(35,33,31,0.24)] backdrop-blur-sm" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            // Radix defers this callback: it must only consume its own session.
            if (isOpen.current || focusSession.current !== renderedFocusSession) return;
            const previous = renderedFocusSession;
            focusSession.current = null;
            if (!previous?.element || previous.path !== window.location.pathname + window.location.search) return;
            const active = document.activeElement;
            if (active !== document.body && active !== document.documentElement && active !== previous.element) return;
            const target = previous.element;
            if (!target.isConnected || target.matches(':disabled,[aria-disabled="true"]') || target.closest('[hidden],[inert],[aria-hidden="true"]') || !target.getClientRects().length || getComputedStyle(target).visibility === 'hidden') return;
            target.focus({ preventScroll: true });
          }}
          className="fixed left-0 top-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[color:var(--assembl-paper)] shadow-[0_32px_90px_rgba(35,33,31,0.24)] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 md:left-1/2 md:top-[12vh] md:h-auto md:w-[min(calc(100vw-2rem),720px)] md:-translate-x-1/2 md:rounded-[8px] md:border md:border-[rgba(35,33,31,0.14)]"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <Dialog.Title className="sr-only">Search assembl</Dialog.Title>
          <Command label="Search assembl" className="flex flex-1 flex-col [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-[color:var(--text-secondary)]">
            <div className="flex items-center gap-3 border-b border-[rgba(35,33,31,0.10)] px-4 py-3">
              <Search className="h-4 w-4 text-[color:var(--text-secondary)]" aria-hidden />
              <Command.Input
                autoFocus
                placeholder="Find Pursuit, DO, Studio, or contact..."
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
              <Command.Group heading="Pages">
                {PUBLIC_COMMAND_PAGES.map((page) => (
                  <Command.Item
                    key={page.href}
                    value={page.label}
                    onSelect={() => go(page.href)}
                    className="group flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[8px] border-l-4 border-[#916A70] px-3 py-3 transition-all aria-selected:bg-[#916A70]/10 aria-selected:shadow-card aria-selected:outline aria-selected:outline-1 aria-selected:outline-ring/30 aria-selected:-translate-y-0.5 aria-selected:scale-[1.01]"
                  >
                    <FileText className="h-4 w-4 text-[color:var(--text-secondary)]" aria-hidden />
                    <span className="flex-1 text-body-md">{page.label}</span>
                    <kbd className="hidden items-center gap-1 font-mono text-[12px] uppercase tracking-wider text-[color:var(--text-secondary)] group-aria-selected:flex">
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
