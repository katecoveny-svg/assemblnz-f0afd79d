export const BUILD_AN_AGENT = {
  meta: {
    title: 'build an agent · assembl',
    description:
      'Pick the parts, drop them in, watch it think. In three minutes you have a working AI agent for your business — one you can share.',
  },
  hero: {
    // Kate's hero direction, 2026-07-20 — strings verbatim.
    eyebrow: 'Your business, intelligently assembled.',
    headline: {
      line1: 'build intelligence',
      line2: 'you can understand.',
    },
    lede: 'See what your AI knows, what it can do, and where you stay in control.',
    startAction: 'assemble your business',
    secondaryAction: 'see how it works',
    secondaryHref: '/how-it-works',
    chips: ['knowledge', 'abilities', 'connected apps', 'boundaries', 'approvals', 'tests'],
    resumeAction: 'Keep building',
  },
  parts: {
    // Labels follow the canonical vocabulary (2026-07-20): model → intelligence,
    // tools → abilities, guardrails → boundaries.
    modelCore: {
      label: 'Intelligence',
      helper: 'The brain. Picks its words.',
    },
    memory: {
      label: 'Memory',
      helper: 'What it remembers between chats.',
    },
    tools: {
      label: 'Abilities',
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
      label: 'Boundaries',
      helper: 'What it will never do.',
    },
  },
  scene: {
    dragHint: 'Drag a piece to the core to connect it.',
    connectedLabel: 'of 4 connected',
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
    nameLabel: 'Name your agent',
    namePlaceholder: 'e.g. Awhi · the front desk · Scout',
    resetLabel: 'try a different business',
    emailPlaceholder: 'your email — optional, we only use it to write back',
    emailSubmit: 'send me a version to keep',
    emailSent: 'Sent. Kate will write back this week.',
    fallbackNote:
      'The live model is offline for a beat — Kate at assembl still gets your note and will write back with a plain plan for the business you described.',
  },
  configure: {
    eyebrow: 'step three · configure the parts',
    heading: 'Choose what your agent gets to do.',
    lede:
      'Every chip below is a piece of the agent you can already see on the canvas above. Pick what fits your business — nothing sends without you.',
    nameLabel: 'What are you calling it?',
    namePlaceholder: 'e.g. Awhi · the practice agent · Southline Scout',
    voiceLabel: 'How you want it to speak',
    voicePlaceholder:
      "e.g. Warm, plain-spoken, method-first — never shouty. Always writes like a person, not a form. Never invents prices.",
  },
  ask: {
    eyebrow: 'step four · ask it something',
    heading: 'Now ask your agent something from your day.',
    lede:
      'A real answer, streaming from the model core. The parts you placed shape the reply — the model tier, the memory, the tools, the knowledge sources, the guardrails, your voice brief.',
    questionLabel: 'Your question',
    questionPlaceholder: 'Something small and real from your week.',
    starter:
      "It's Monday morning. My biggest customer just emailed asking if we can pull tomorrow's install forward to today. What would you draft me?",
    suggestionsLabel: 'Try one of these',
    suggestions: [
      "Draft a reply to a customer asking for a price we don't publish.",
      'Write me a short email to the team about tomorrow.',
      'Summarise this week for me in three lines.',
    ],
    submitLabel: 'Ask it',
    stopLabel: 'Stop',
    draftNote: 'Draft only. A person always confirms. Nothing sends.',
    defaultName: 'your agent',
    idleLabel: 'ready when you are',
    idleBody:
      "I'm here. Ask me something small from your week and I'll draft a reply, an update, or a summary. Nothing goes anywhere — it's a preview.",
    streamingLabel: 'writing',
    streamingBody: "reading your question, pulling the parts together",
    readyLabel: 'draft ready · a person confirms',
    shareCta: 'Keep it or share it',
  },
  whatYouGet: {
    eyebrow: 'the whole platform · what you get',
    heading: 'The agent is one part. Here is the operating system.',
    lede: 'assembl runs the surfaces a business actually needs — all reading one source of truth, all kept current by your agents, everything waiting for your yes.',
    cards: [
      {
        id: 'living-site',
        title: 'Living site',
        body: 'A website that reads your business facts live. Change a price once — the site, the FAQs and the booking flow follow.',
        href: '/living-site/fred',
        cta: 'see a live one',
      },
      {
        id: 'crm',
        title: 'CRM',
        body: 'Every enquiry lands with its source, next action and history attached. Your agents keep it current so you never re-type a customer.',
        href: '/genome',
        cta: 'see the install',
      },
      {
        id: 'marketing-studio',
        title: 'Marketing studio',
        body: 'On-brand images, ads and social pieces generated from your own look — the same studio that makes the art on this page.',
        href: '/creative-playground',
        cta: 'open the studio',
      },
      {
        id: 'knowledge',
        title: 'Knowledge',
        body: 'Your prices, policies and answers in one place your agents can cite. Ask where a fact came from and it shows you.',
        href: '/living-site',
        cta: 'watch a fact ripple',
      },
      {
        id: 'agents',
        title: 'Agents',
        body: 'Specialists for the repeat work — enquiries, follow-ups, briefs, invoices. Each one built from the same parts you just placed.',
        href: '/agents',
        cta: 'meet the roster',
      },
      {
        id: 'approvals',
        title: 'Approvals',
        body: 'Nothing sends, spends or changes a record without a person saying yes. Important actions queue for you, with the draft ready.',
        href: null,
        cta: null,
      },
      {
        id: 'activity',
        title: 'Activity',
        body: 'Every action an agent takes is on the record — what it did, what it used, what it cost. No hidden behaviour, ever.',
        href: null,
        cta: null,
      },
    ],
    unlinkedNote: 'part of every pilot workspace',
  },
  share: {
    eyebrow: 'step five · keep it or share it',
    heading: 'Save the agent you just built.',
    lede:
      "Send it to a colleague, tuck it in your notes, or drop your email — I'll hold it for you. Every shared link opens the exact agent, in the exact shape, so someone else can see what you saw.",
    previewAlt: 'Preview card for {name}',
    previewCaption: 'The card that appears when the link is pasted somewhere.',
    linkLabel: 'Your shareable link',
    linkCopy: 'Copy',
    linkCopied: 'Copied',
    saveImage: 'Save as image',
    manualCopyPrompt: 'Copy your share link',
    defaultName: 'your agent',
    saveLabel: 'Keep it for me',
    savePlaceholder: 'your email — optional, only used to write back',
    saveSubmit: 'Send this to my inbox',
    saveSending: 'sending',
    saveSent: 'Sent — Kate has it',
    saveErrorGeneric: 'The mailer hiccuped — try once more or drop it in the hand-off card below.',
    emailInvalid: 'That looks off — check the address and try again.',
    footnote: 'Draft only. Nothing sends without a human yes. Made in Aotearoa.',
  },
  savings: {
    eyebrow: 'step six · time back',
    heading: 'How many hours could you get back?',
    lede: 'Your own numbers. A plain planning estimate — no form, no phone call, no inflated promise.',
  },
  closing: {
    eyebrow: 'step seven · optional',
    heading: 'Want us to build this properly for your business?',
    body:
      'The one you just designed is a taste. If it lit up an idea for your team, drop your email — Kate at assembl reads them herself and comes back with a plain plan and price.',
    email: 'assembl@assembl.co.nz',
    finePrint: 'Draft-only. Nothing sends without a human yes. Made in Aotearoa.',
  },
} as const;
