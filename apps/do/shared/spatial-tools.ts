export type SpatialTool = {
  id: string;
  label: string;
  role: 'runtime' | 'editor' | 'generation';
  status: 'production' | 'candidate' | 'research_only';
  license: string;
  useFor: string[];
  note: string;
  url: string;
};

/**
 * Spatial tools Creative/Office DOs may consider. A catalogue entry is not an
 * install or endorsement: candidate tools must pass license, security,
 * performance and maintenance review before becoming a runtime dependency.
 */
export const SPATIAL_TOOLS: readonly SpatialTool[] = [
  {
    id: 'three-r3f',
    label: 'Three.js + React Three Fiber',
    role: 'runtime',
    status: 'production',
    license: 'MIT',
    useFor: ['DO Office', 'interactive product scenes', 'client demos', 'mesh-based web 3D'],
    note: 'Existing Assembl web-3D runtime. Reuse before adding another scene engine.',
    url: 'https://r3f.docs.pmnd.rs/',
  },
  {
    id: 'spark',
    label: 'Spark by World Labs',
    role: 'runtime',
    status: 'candidate',
    license: 'MIT',
    useFor: ['Gaussian splats', 'captured spaces', 'mesh + splat mixed scenes', 'spatial walkthroughs'],
    note: 'Three.js-compatible splat renderer. Evaluate as an optional spatial asset layer rather than replacing R3F.',
    url: 'https://github.com/sparkjsdev/spark',
  },
  {
    id: 'supersplat',
    label: 'SuperSplat',
    role: 'editor',
    status: 'candidate',
    license: 'MIT',
    useFor: ['clean splat captures', 'optimize scenes', 'camera paths', 'publish/embed spatial scenes'],
    note: 'Browser-based editor; useful creator-side companion to a Spark/Three runtime.',
    url: 'https://github.com/playcanvas/supersplat',
  },
  {
    id: 'spatialgen',
    label: 'SpatialGen',
    role: 'generation',
    status: 'research_only',
    license: 'mixed research/non-commercial dependencies',
    useFor: ['layout-guided indoor scene research', 'text/reference-to-scene experiments'],
    note: 'GPU-heavy research pipeline; do not ship as a commercial DO dependency until the full license/data path is cleared.',
    url: 'https://github.com/manycore-research/SpatialGen',
  },
] as const;
