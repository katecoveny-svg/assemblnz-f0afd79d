'use client';

import { useEffect, useState } from 'react';
import { StudioTopBar } from '@/components/studio/StudioTopBar';
import { ComponentLibrary } from '@/components/studio/ComponentLibrary';
import { PropertiesPanel } from '@/components/studio/PropertiesPanel';
import { ActivityPanel } from '@/components/studio/ActivityPanel';
import { AgentScene } from '@/components/studio/AgentScene';
import { XRayView } from '@/components/studio/XRayView';
import { ActivityView } from '@/components/studio/ActivityView';
import { MobileEditor } from '@/components/studio/MobileEditor';
import { useStudioStore } from '@/lib/studio/store';

export function StudioClient() {
  const viewMode = useStudioStore((s) => s.viewMode);
  const setReducedMotion = useStudioStore((s) => s.setReducedMotion);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Respect the OS motion preference — every animated part of the studio
    // reads this store flag.
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [setReducedMotion]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <StudioTopBar />
      {isMobile ? (
        <div className="flex-1 overflow-y-auto">
          <MobileEditor />
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(260px,340px)] overflow-hidden">
          <ComponentLibrary />
          <main className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              {viewMode === 'build' ? <AgentScene /> : viewMode === 'x-ray' ? <XRayView /> : <ActivityView />}
            </div>
            <ActivityPanel />
          </main>
          <PropertiesPanel />
        </div>
      )}
    </div>
  );
}
