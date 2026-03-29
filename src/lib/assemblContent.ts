export const ASSEMBL_BRAND = {
  name: "Assembl",
  domain: "assembl.co.nz",
  location: "Auckland, Aotearoa New Zealand",
  tagline: "The Operating System for NZ Business",
  secondaryTaglines: [
    "42 agents. One brain.",
    "Built in Aotearoa.",
    "Replace six platforms with one.",
  ],
  voice: [
    "Confident, warm, direct, and authentically Kiwi",
    "Problem-first, solution-second",
    "Grounded in real NZ business workflows",
    "Avoid hype, waffle, and Silicon Valley jargon",
  ],
  palette: {
    background: "#0A0A14",
    text: "#FAFAFA",
    green: "#00FF88",
    cyan: "#00E5FF",
    pink: "#FF2D9B",
    blue: "#5B8CFF",
  },
  typography: {
    display: "General Sans",
    body: "Inter",
    mono: "JetBrains Mono",
  },
};

export interface BrandDnaProfile {
  business_name?: string;
  industry?: string;
  target_audience?: string;
  key_products?: string[];
  usps?: string[];
  visual_identity?: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_preference?: string;
    photography_style?: string;
    visual_aesthetic?: string;
  };
  typography?: {
    heading_style?: string;
    heading_font?: string;
    body_style?: string;
    body_font?: string;
    text_density?: string;
  };
  voice_tone?: {
    formality?: number;
    personality_traits?: string[];
    sentence_style?: string;
    emoji_usage?: string;
    jargon_level?: string;
    cta_style?: string;
  };
  brand_summary?: string;
  brand_score?: number;
}

export interface SavedBrandProfile {
  business_name?: string | null;
  industry?: string | null;
  tone?: string | null;
  audience?: string | null;
  key_message?: string | null;
  brand_dna?: BrandDnaProfile | null;
}

const PLATFORM_GUIDANCE: Record<string, { label: string; objective: string; format: string; ctaStyle: string }> = {
  instagram_post: {
    label: "Instagram Post",
    objective: "Stop the scroll quickly and turn awareness into profile visits",
    format: "Short opening hook, spaced caption, high visual punch, 10-15 relevant hashtags",
    ctaStyle: "Direct readers to comment, save, share, or visit the link in bio",
  },
  instagram_story: {
    label: "Instagram Story",
    objective: "Create urgency and a clean tap-through journey",
    format: "Minimal overlay copy, 1 clear idea, highly visual, sequence-ready",
    ctaStyle: "Use a short action like DM us, reply, or tap through",
  },
  linkedin_post: {
    label: "LinkedIn Post",
    objective: "Build authority with NZ business owners and operators",
    format: "Strong first line, thoughtful body, clean spacing, 3-5 selective hashtags",
    ctaStyle: "Invite a business conversation, comment, or demo enquiry",
  },
  facebook_post: {
    label: "Facebook Post",
    objective: "Drive approachable community engagement",
    format: "Conversational, readable, slightly longer, question-led close",
    ctaStyle: "Ask for opinions, shares, or direct messages",
  },
  tiktok_caption: {
    label: "TikTok Caption",
    objective: "Support punchy short-form video with a sharp angle",
    format: "Brief caption, energetic phrasing, minimal hashtags, creator-style hook",
    ctaStyle: "Encourage follows, comments, or watch-through",
  },
};

const CONTENT_TYPE_GUIDANCE: Record<string, { angle: string; proof: string; visual: string }> = {
  product_launch: {
    angle: "Make the launch feel important, useful, and unmistakably new",
    proof: "Highlight what changed, who it helps, and why it matters now",
    visual: "Hero product graphic with bold typography and one standout message",
  },
  feature_spotlight: {
    angle: "Show one capability clearly and link it to a business pain point",
    proof: "Use a simple before/after or time-saving outcome",
    visual: "UI-led composition or focused feature callout",
  },
  tip_hack: {
    angle: "Teach one practical move NZ businesses can use immediately",
    proof: "Anchor the advice in a common business workflow",
    visual: "Educational card or checklist-led graphic with crisp hierarchy",
  },
  educational: {
    angle: "Lead with insight and make the explanation feel useful, not academic",
    proof: "Use grounded examples and specific operational outcomes",
    visual: "Explainer graphic or polished infographic treatment",
  },
  seasonal: {
    angle: "Tie the moment to a timely business need or campaign opportunity",
    proof: "Reference what NZ businesses are dealing with right now",
    visual: "Seasonal motif integrated into the Assembl neon-dark visual system",
  },
  behind_scenes: {
    angle: "Humanise the business and show the thinking behind the work",
    proof: "Mention people, process, or product craft",
    visual: "Candid team or process-led creative with branded overlay treatment",
  },
};

export function getPlatformGuidance(platform: string) {
  return PLATFORM_GUIDANCE[platform] ?? {
    label: platform,
    objective: "Create branded social content that feels premium and conversion-aware",
    format: "Platform-ready formatting with clear hierarchy",
    ctaStyle: "Close with one specific next step",
  };
}

export function getContentTypeGuidance(contentType: string) {
  return CONTENT_TYPE_GUIDANCE[contentType] ?? {
    angle: "Lead with a clear business angle",
    proof: "Use concrete proof points or believable outcomes",
    visual: "Professional branded marketing creative",
  };
}

export function resolveBrandProfile(profile?: SavedBrandProfile | null) {
  const dna = profile?.brand_dna;
  const primary = dna?.visual_identity?.primary_color || ASSEMBL_BRAND.palette.green;
  const secondary = dna?.visual_identity?.secondary_color || ASSEMBL_BRAND.palette.cyan;
  const accent = dna?.visual_identity?.accent_color || ASSEMBL_BRAND.palette.pink;
  const headingFont = dna?.typography?.heading_font || ASSEMBL_BRAND.typography.display;
  const bodyFont = dna?.typography?.body_font || ASSEMBL_BRAND.typography.body;
  const toneTraits = dna?.voice_tone?.personality_traits?.join(", ");

  return {
    businessName: profile?.business_name || dna?.business_name || ASSEMBL_BRAND.name,
    industry: profile?.industry || dna?.industry || "New Zealand business technology",
    audience: profile?.audience || dna?.target_audience || "NZ business owners, operators, and founders",
    tone: profile?.tone || toneTraits || ASSEMBL_BRAND.voice.join(", "),
    keyMessage: profile?.key_message || dna?.usps?.join(". ") || ASSEMBL_BRAND.tagline,
    palette: {
      background: dna?.visual_identity?.background_preference === "light" ? "#F7F7FA" : ASSEMBL_BRAND.palette.background,
      primary,
      secondary,
      accent,
      text: ASSEMBL_BRAND.palette.text,
    },
    typography: {
      display: headingFont,
      body: bodyFont,
      mono: ASSEMBL_BRAND.typography.mono,
    },
    summary: dna?.brand_summary || "",
    photographyStyle: dna?.visual_identity?.photography_style || "professional",
    aesthetic: dna?.visual_identity?.visual_aesthetic || "bold",
    ctaStyle: dna?.voice_tone?.cta_style || "direct",
    source: dna ? "brand_dna" : "assembl_default",
  };
}

export function buildAssemblContentPrompt(input: {
  platform: string;
  contentType: string;
  topic?: string;
  agentContext?: string;
  brandProfile?: SavedBrandProfile | null;
}) {
  const platform = getPlatformGuidance(input.platform);
  const contentType = getContentTypeGuidance(input.contentType);
  const brand = resolveBrandProfile(input.brandProfile);
  const topicLine = input.topic?.trim()
    ? `Campaign/topic focus: ${input.topic.trim()}.`
    : `Campaign/topic focus: Choose the strongest commercially relevant angle for ${brand.businessName}.`;

  return `You are PRISM, a world-class content engine for ${brand.businessName}.

Brand you are writing for:
- Business: ${brand.businessName}
- Core message: ${brand.keyMessage}
- Industry: ${brand.industry}
- Audience: ${brand.audience}
- Tone: ${brand.tone}
- Visual system: background ${brand.palette.background}, primary ${brand.palette.primary}, secondary ${brand.palette.secondary}, accent ${brand.palette.accent}, text ${brand.palette.text}
- Typography references: ${brand.typography.display} for display, ${brand.typography.body} for body, ${brand.typography.mono} for mono accents
${brand.summary ? `- Brand summary: ${brand.summary}` : ""}
${brand.businessName === ASSEMBL_BRAND.name ? `- Assembl tagline bank: ${ASSEMBL_BRAND.tagline} | ${ASSEMBL_BRAND.secondaryTaglines.join(" | ")}` : ""}

Content brief:
- Platform: ${platform.label}
- Platform objective: ${platform.objective}
- Platform format requirements: ${platform.format}
- CTA style: ${platform.ctaStyle}
- Content type angle: ${contentType.angle}
- Proof guidance: ${contentType.proof}
- Visual direction baseline: ${contentType.visual}
${input.agentContext ? `- Sector context: ${input.agentContext}` : ""}
- ${topicLine}

Requirements:
- Use NZ English only.
- Make every section feel unmistakably branded for this business.
- Speak to NZ founders, operators, and business owners like a sharp local strategist.
- Mention the business naturally where appropriate.
- Prefer credible business outcomes over generic inspiration.
- Do not sound cheesy, salesy, or AI-generated.

Return exactly this structure:

## Brand Angle
[One sentence on the strategic angle]

## Scroll-Stopping Hook
[One line]

## Full Caption
[Final platform-ready caption]

## CTA
[Specific call to action]

## Hashtags
[Platform-appropriate hashtag block]

## Creative Direction
[Art direction for the visual]

## Brand Checks
- Tagline used or intentionally omitted: [explain briefly]
- NZ relevance: [brief note]
- Palette/Typography cues: [brief note]

## Image Prompt
[A production-ready prompt for an image model that bakes in the brand's layout, palette, mood, and typography references]`;
}

export function buildWeeklyContentPrompt(input: {
  topic?: string;
  selectedPlatforms: string[];
  contentMix: string[];
  agentContext?: string;
  brandProfile?: SavedBrandProfile | null;
}) {
  const brand = resolveBrandProfile(input.brandProfile);
  const platforms = input.selectedPlatforms.map((platform) => getPlatformGuidance(platform).label).join(", ");
  const contentMix = input.contentMix.map((type) => getContentTypeGuidance(type).angle).join(" | ");
  const theme = input.topic?.trim()
    ? input.topic.trim()
    : `The strongest 7-day growth narrative for ${brand.businessName}`;

  return `You are PRISM, a senior social strategist building a world-class 7-day content plan.

Brand:
- Business: ${brand.businessName}
- Industry: ${brand.industry}
- Audience: ${brand.audience}
- Tone: ${brand.tone}
- Key message: ${brand.keyMessage}
- Palette: ${brand.palette.background}, ${brand.palette.primary}, ${brand.palette.secondary}, ${brand.palette.accent}
- Typography: ${brand.typography.display}, ${brand.typography.body}
${brand.summary ? `- Brand summary: ${brand.summary}` : ""}

Campaign frame:
- Theme: ${theme}
- Platforms to cover: ${platforms}
- Desired content mix: ${contentMix}
${input.agentContext ? `- Sector context: ${input.agentContext}` : ""}

Requirements:
- Use NZ English.
- Make the week feel cohesive but not repetitive.
- Include a healthy mix of authority, education, proof, and conversion.
- Every day must include a visual concept that a designer or image model could execute.
- Optimise for real business growth, not fluff.

Return exactly this structure:

# Weekly Content Calendar
[One paragraph overview]

## Day 1
- Goal:
- Platform:
- Content Type:
- Hook:
- Caption:
- CTA:
- Hashtags:
- Visual Direction:
- Image Prompt:

## Day 2
- Goal:
- Platform:
- Content Type:
- Hook:
- Caption:
- CTA:
- Hashtags:
- Visual Direction:
- Image Prompt:

## Day 3
- Goal:
- Platform:
- Content Type:
- Hook:
- Caption:
- CTA:
- Hashtags:
- Visual Direction:
- Image Prompt:

## Day 4
- Goal:
- Platform:
- Content Type:
- Hook:
- Caption:
- CTA:
- Hashtags:
- Visual Direction:
- Image Prompt:

## Day 5
- Goal:
- Platform:
- Content Type:
- Hook:
- Caption:
- CTA:
- Hashtags:
- Visual Direction:
- Image Prompt:

## Day 6
- Goal:
- Platform:
- Content Type:
- Hook:
- Caption:
- CTA:
- Hashtags:
- Visual Direction:
- Image Prompt:

## Day 7
- Goal:
- Platform:
- Content Type:
- Hook:
- Caption:
- CTA:
- Hashtags:
- Visual Direction:
- Image Prompt:

## Weekly Notes
- Best posting rhythm:
- Reuse opportunities:
- Conversion focus:
- Brand consistency checks:`;
}

export function buildAssemblImagePrompt(input: {
  prompt: string;
  platform?: string;
  contentType?: string;
  topic?: string;
  agentContext?: string;
}) {
  const platform = input.platform ? getPlatformGuidance(input.platform) : undefined;
  const contentType = input.contentType ? getContentTypeGuidance(input.contentType) : undefined;

  return [
    "Create a premium commercial marketing visual for Assembl.",
    `Brand anchor: ${ASSEMBL_BRAND.tagline}.`,
    `Use a dark-first composition on ${ASSEMBL_BRAND.palette.background} with controlled accents of ${ASSEMBL_BRAND.palette.green}, ${ASSEMBL_BRAND.palette.cyan}, and ${ASSEMBL_BRAND.palette.pink}.`,
    `Typography style reference: ${ASSEMBL_BRAND.typography.display} display with ${ASSEMBL_BRAND.typography.body} support. If text appears in-image, keep it minimal, crisp, and legible.`,
    platform ? `Platform: ${platform.label}. Objective: ${platform.objective}.` : null,
    contentType ? `Content style: ${contentType.angle}. Visual baseline: ${contentType.visual}.` : null,
    input.topic?.trim() ? `Topic: ${input.topic.trim()}.` : null,
    input.agentContext?.trim() ? `Sector context: ${input.agentContext.trim()}` : null,
    `Creative direction: ${input.prompt.trim()}`,
    "Composition should feel agency-grade, bold, minimal, and unmistakably Assembl-branded.",
    "Avoid generic stock-photo aesthetics, washed-out colours, and cluttered layouts.",
  ].filter(Boolean).join(" ");
}

export function createAssemblImageFallback(input: {
  platform: string;
  contentType: string;
  topic?: string;
  imagePrompt: string;
  brandProfile?: SavedBrandProfile | null;
}) {
  const platform = getPlatformGuidance(input.platform);
  const contentType = getContentTypeGuidance(input.contentType);
  const brand = resolveBrandProfile(input.brandProfile);
  const headline = input.topic?.trim()
    ? input.topic.trim()
    : `${brand.keyMessage} | ${platform.label}`;

  return {
    headline,
    subheadline: contentType.angle,
    palette: [
      brand.palette.background,
      brand.palette.primary,
      brand.palette.secondary,
      brand.palette.accent,
      brand.palette.text,
    ],
    typography: `${brand.typography.display} / ${brand.typography.body} / ${brand.typography.mono}`,
    layout: `Strong headline, one hero visual zone, clear brand mark treatment, platform-safe margins for ${platform.label}, and ${brand.aesthetic} styling cues.`,
    productionNotes: input.imagePrompt.trim(),
  };
}
