export const BUILD_AN_AGENT = {
  meta: {
    title: 'build an agent · assembl',
    description:
      'Pick the parts, drop them in, watch it think. In three minutes you have a working AI agent for your business — one you can share.',
  },
  hero: {
    eyebrow: 'AI, made to fit your business',
    headline: {
      line1: 'Build an AI agent.',
      line2: 'In three minutes.',
    },
    lede: 'Drag the parts into the scene. Give it a job. Test it on a real question from your day. Send it to a colleague, or ask us to make it real.',
    startAction: 'Start building',
    resumeAction: 'Keep building',
  },
  parts: {
    modelCore: {
      label: 'The model',
      helper: 'The brain. Picks its words.',
    },
    memory: {
      label: 'Memory',
      helper: 'What it remembers between chats.',
    },
    tools: {
      label: 'Tools',
      helper: 'What it can go and do.',
    },
    connectors: {
      label: 'Knowledge',
      helper: 'Where it looks things up.',
    },
    prompt: {
      label: 'Voice',
      helper: 'How it speaks and what it cares about.',
    },
    guardrails: {
      label: 'Guardrails',
      helper: 'What it will never do.',
    },
  },
  scene: {
    dragHint: 'Drag the piece. Drop it anywhere.',
    reducedMotionNote: 'Motion reduced — the scene is still, the build still works.',
  },
} as const;
