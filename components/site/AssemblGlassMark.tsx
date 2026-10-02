import { GlassIdentity } from '@/components/brand/GlassIdentity';

/** The locked glass artwork is the primary identity, including company headers. */
export function AssemblGlassMark({ size = 32 }: { size?: number }) {
  return <GlassIdentity kind="assembl" size={size} />;
}
