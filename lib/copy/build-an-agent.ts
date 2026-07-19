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
  intake: {
    eyebrow: 'step two · tell it about your business',
    heading: 'Now give it a business to work on.',
    lede:
      'The parts up top are the shape of the thing. The words below are what makes it yours. One paragraph in your own words — your agent reads it and shows you what a Business Genome looks like for you, live and always up-to-date.',
    textareaLabel: 'What does your business do?',
    textareaPlaceholder:
      'I run a small architecture practice in Auckland. We spend hours qualifying enquiries and preparing weekly updates. Half of my week goes to admin I could hand back…',
    sampleLabel: 'Try one of these',
    samples: [
      { id: 'architect', label: 'architecture practice' },
      { id: 'builder', label: 'residential builder' },
      { id: 'plumber', label: 'plumbing service' },
      { id: 'dog-trainer', label: 'dog trainer' },
      { id: 'customs', label: 'customs broker' },
    ],
    sampleBusinesses: {
      architect:
        'I run a small architecture practice in Auckland. Two of us. Every week I lose hours qualifying new enquiries and preparing updates for clients whose projects are mid-consent. I want more studio time.',
      builder:
        'I run a residential building company in Christchurch, six on the tools plus me. Every Friday night I write up the site update for four clients — photos, progress, variations. It kills my weekend.',
      plumber:
        'I run a plumbing service. Two vans, three of us. Every night I prep tomorrow — jobs, parts, access, site history — and I still forget things because it lives in my head and three different apps.',
      'dog-trainer':
        'I train dogs in Auckland. One-on-one sessions in owners\' homes and small group classes at the park. My admin is enquiry follow-ups, session notes, and a lot of "what\'s your availability" texts.',
      customs:
        'I\'m a customs broker in Auckland. Small team, high-volume shipments. Every entry I chase supplier docs by email before I can classify anything — and Working Tariff changes catch me off guard.',
    },
    submitLabel: 'Show me a version for my business',
    submitBusy: 'reading your words',
    disclaimer:
      'No sign-up. Nothing sends. Kate at assembl reads leads herself and drops you a plain reply if you leave an email.',
    answerHeading: 'What your Business Genome would look like',
    resetLabel: 'try a different business',
    emailPlaceholder: 'your email — optional, we only use it to write back',
    emailSubmit: 'send me a version to keep',
    emailSent: 'Sent. Kate will write back this week.',
    fallbackNote:
      'The live model is offline for a beat — Kate at assembl still gets your note and will write back with a plain plan for the business you described.',
  },
  savings: {
    eyebrow: 'step three · time back',
    heading: 'How many hours could you get back?',
    lede: 'Your own numbers. A plain planning estimate — no form, no phone call, no inflated promise.',
  },
  closing: {
    eyebrow: 'step four · optional',
    heading: 'Want us to build this properly for your business?',
    body:
      'The one you just designed is a taste. If it lit up an idea for your team, drop your email — Kate at assembl reads them herself and comes back with a plain plan and price.',
    email: 'assembl@assembl.co.nz',
    finePrint: 'Draft-only. Nothing sends without a human yes. Made in Aotearoa.',
  },
} as const;
