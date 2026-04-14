// ─────────────────────────────────────────────────────────────
//  trrim.it — Landing Page Copy
//  Single source of truth. Import from here to enable A/B testing.
// ─────────────────────────────────────────────────────────────

export const HERO = {
  eyebrow: "Rust-powered · Cloud-native · Zero-latency",
  headline_1: "Trim anything.",
  headline_2: "Make it viral.",
  subheadline:
    "Cloud-native video trimming with AI-powered highlights — paste a URL and your clip is ready in seconds.",
  input_placeholder: "Paste any video link to start trimming...",
  cta_primary: "Trim It",
  cta_ai_label: "AI Reels",
  cta_ai_badge: "Get Early Access",
  trust: [
    "Direct URL fetching",
    "No local upload required",
    "No sign-up to preview",
  ],
  platforms: ["YouTube", "Instagram", "TikTok", "Twitter / X", "Vimeo", "Twitch"],
} as const;

export const TRIM = {
  label: "PRECISION TRIMMING",
  headline_1: "Your clip.",
  headline_2: "In seconds.",
  subheadline: "Server-side cutting. Nothing touches your disk.",
  features: [
    {
      title: "Cloud-native. Zero downloads.",
      body: "We fetch directly from the source — your bandwidth is completely untouched.",
    },
    {
      title: "Frame-perfect timestamps.",
      body: "Drag to millisecond precision. No guesswork, no re-encoding overhead.",
    },
    {
      title: "Instant delivery.",
      body: "Rust + FFmpeg pipeline. Your clip ships before the page stops loading.",
    },
  ],
} as const;

export const AI_REELS = {
  label: "AI REELS",
  badge: "COMING SOON",
  headline_1: "Your best moments,",
  headline_2: "found automatically.",
  subheadline:
    "Stop hunting for the good part. Our AI watches, detects, and packages the clips worth sharing.",
  features: [
    {
      title: "Auto viral moment detection.",
      body: "AI identifies energy spikes, reactions, and quotable lines — no manual scrubbing.",
    },
    {
      title: "Vertical-ready for every platform.",
      body: "Auto-cropped for TikTok, Reels, and Shorts. One source clip, every format.",
    },
    {
      title: "Captions, burned in.",
      body: "Styled subtitles auto-generated and composited — no third-party tool needed.",
    },
  ],
  cta: "Get Early Access",
  cta_sub: "Be first when it ships.",
} as const;

export const HOW_IT_WORKS = {
  label: "HOW IT WORKS",
  headline: "Three steps.",
  headline_accent: "No friction.",
  subheadline: "Works on any device. No account needed to start.",
  steps: [
    {
      step: "01",
      title: "Paste your URL.",
      body: "Any platform, any link. We handle the fetch.",
    },
    {
      step: "02",
      title: "Trim or let AI decide.",
      body: "Set exact timestamps manually, or let AI surface the moment worth sharing.",
    },
    {
      step: "03",
      title: "Download your clip.",
      body: "Server-side processing. You only receive — and pay for — what you asked for.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────
//  Pricing
// ─────────────────────────────────────────────────────────────

export interface PricingTier {
  id: string;
  label: string;
  price: string | "COMING_SOON";
  annualPrice?: string; // Pro tier only — shown when billing toggle is annual
  priceSub: string;
  isComingSoon?: boolean;
  badge?: string;
  badgePulse?: boolean;
  features: string[];
  ctaLabel: string;
  ctaVariant: "outline" | "solid" | "gradient";
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    priceSub: "No credit card required",
    badge: undefined,
    features: [
      "10 min clipping quota / month",
      "Up to 5 videos",
      "Watermarked export",
      "Standard processing",
    ],
    ctaLabel: "Start Free",
    ctaVariant: "outline",
  },
  {
    id: "payg",
    label: "Pay As You Go",
    price: "$0.10 / min",
    priceSub: "Per minute of output clip. No subscription.",
    badge: "Most Flexible",
    features: [
      "No monthly commitment",
      "Buy credits anytime",
      "No watermark",
      "Standard processing",
      "Credits never expire",
    ],
    ctaLabel: "Buy Credits",
    ctaVariant: "solid",
  },
  {
    id: "pro",
    label: "Pro",
    price: "$12 / mo",
    annualPrice: "$9 / mo, billed annually",
    priceSub: "300 minutes included. Overage at $0.05/min.",
    badge: "Most Popular",
    features: [
      "300 min clipping quota / month",
      "Overage at $0.05 per extra minute",
      "No watermark",
      "Priority cloud processing",
      "Original quality export",
      "Usage dashboard",
    ],
    ctaLabel: "Get Pro",
    ctaVariant: "solid",
  },
  {
    id: "ai-reels",
    label: "AI Reels",
    price: "COMING_SOON",
    priceSub: "Pricing revealed at launch for waitlist members",
    isComingSoon: true,
    badge: "AI Powered",
    badgePulse: true,
    features: [
      "Auto viral moment detection",
      "Vertical export — TikTok / Reels / Shorts",
      "AI-generated captions",
      "Batch processing",
      "Founding member pricing locked in",
    ],
    ctaLabel: "Join Waitlist",
    ctaVariant: "gradient",
  },
];

export const PRICING_META = {
  label: "PRICING",
  headline_1: "Simple,",
  headline_2: "transparent pricing.",
  subheadline: "Start free. Scale when you're ready.",
  trust: ["Visa", "Mastercard", "Google Pay", "Polar"],
} as const;

export const CREDITS_EXPLAINER = {
  headline: "How credits work",
  items: [
    {
      title: "Charged per output minute",
      body: "You're billed for the length of your trimmed clip — not the source video.",
    },
    {
      title: "1 credit = 1 minute",
      body: "Simple unit. No conversion math. 10 credits = 10 minutes of exported video.",
    },
    {
      title: "Credits never expire",
      body: "Pre-purchase a pack and use it at your own pace — no monthly reset.",
    },
  ],
} as const;

export const FOOTER = {
  tagline: "Trim with precision. Go viral with intelligence.",
  copyright: "© 2026 trrim.it — All rights reserved.",
  status: "Rust-powered. Zero-latency.",
  nav: [
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
  ],
} as const;
