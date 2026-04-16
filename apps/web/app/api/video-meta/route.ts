import { NextRequest, NextResponse } from "next/server";

// ─── Platform detection ───────────────────────────────────────────────────────

type Platform =
  | "youtube"
  | "vimeo"
  | "tiktok"
  | "twitter"
  | "dailymotion"
  | "trusted_social"
  | "direct";

const OEMBED_PLATFORMS: Record<string, Platform> = {
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "vimeo.com": "vimeo",
  "tiktok.com": "tiktok",
  "dailymotion.com": "dailymotion",
};

const TRUSTED_SOCIAL_DOMAINS = [
  // Twitter/X — oEmbed is unreliable; handled via syndication API separately
  "twitter.com",
  "x.com",
  "t.co",
  "instagram.com",
  "facebook.com",
  "fb.watch",
  "fb.com",
  "twitch.tv",
  "clips.twitch.tv",
  "reddit.com",
  "streamable.com",
  "medal.tv",
];

function detectPlatform(url: string): Platform {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    for (const [domain, platform] of Object.entries(OEMBED_PLATFORMS)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) return platform;
    }
    for (const domain of TRUSTED_SOCIAL_DOMAINS) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) return "trusted_social";
    }
  } catch { /* invalid URL — handled upstream */ }
  return "direct";
}

// ─── YouTube — scrape lengthSeconds from watch page (no API key needed) ──────

async function getYoutubeMeta(url: string): Promise<{ duration: number | null; title: string | null; exists: boolean }> {
  try {
    // Verify via oEmbed first (fast, confirms video is public)
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { headers: { "User-Agent": "trrim.it/1.0" }, next: { revalidate: 300 } },
    );
    if (!oembedRes.ok) return { duration: null, title: null, exists: false };

    const oembedJson = await oembedRes.json() as { title?: string };
    const title = oembedJson.title ?? null;

    // Fetch watch page to extract duration
    const videoId = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (!videoId) return { duration: null, title, exists: true };

    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!watchRes.ok) return { duration: null, title, exists: true };

    const html = await watchRes.text();
    const match = html.match(/"lengthSeconds":"(\d+)"/);
    const duration = match ? parseInt(match[1], 10) : null;

    return { duration, title, exists: true };
  } catch {
    return { duration: null, title: null, exists: false };
  }
}

// ─── Twitter/X — syndication API (no auth needed for public tweets) ──────────

/** Recursively walk any JSON value and return the first `duration_millis` found. */
function findDurationMillis(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) {
    for (const item of val) {
      const found = findDurationMillis(item);
      if (found !== null) return found;
    }
    return null;
  }
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj.duration_millis === "number") return obj.duration_millis;
    for (const child of Object.values(obj)) {
      const found = findDurationMillis(child);
      if (found !== null) return found;
    }
  }
  return null;
}

async function getTwitterMeta(url: string): Promise<{ duration: number | null; exists: boolean }> {
  try {
    const tweetId = url.match(/(?:twitter\.com|x\.com)\/\w+\/status(?:es)?\/(\d+)/)?.[1];
    if (!tweetId) return { duration: null, exists: true };

    const res = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) {
      console.warn(`[video-meta] Twitter syndication ${res.status} for tweet ${tweetId}`);
      return { duration: null, exists: res.status !== 404 };
    }

    const json: unknown = await res.json();
    const ms = findDurationMillis(json);
    console.log(`[video-meta] Twitter tweet ${tweetId} — duration_millis:`, ms);

    return { duration: ms !== null ? Math.round(ms / 1000) : null, exists: true };
  } catch (err) {
    console.error("[video-meta] Twitter fetch error:", err);
    return { duration: null, exists: true };
  }
}

// ─── Generic oEmbed helper ────────────────────────────────────────────────────

async function fetchOembed(oembedUrl: string) {
  const res = await fetch(oembedUrl, {
    headers: { "User-Agent": "trrim.it/1.0" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<Record<string, unknown>>;
}

// ─── GET /api/video-meta?url=… ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url")?.trim();
  if (!raw) {
    return NextResponse.json({ data: null, error: "url query param is required." }, { status: 400 });
  }

  const platform = detectPlatform(raw);
  const encoded = encodeURIComponent(raw);

  try {
    switch (platform) {

      case "youtube": {
        const { duration, title, exists } = await getYoutubeMeta(raw);
        if (!exists) return notFound();
        return ok({ platform, duration, title });
      }

      case "vimeo": {
        const json = await fetchOembed(`https://vimeo.com/api/oembed.json?url=${encoded}`);
        if (!json) return notFound();
        return ok({
          platform,
          duration: typeof json.duration === "number" ? json.duration : null,
          title: (json.title as string) ?? null,
        });
      }

      case "tiktok": {
        const json = await fetchOembed(`https://www.tiktok.com/oembed?url=${encoded}`);
        if (!json) return notFound();
        return ok({ platform, duration: null, title: (json.title as string) ?? null });
      }

      case "dailymotion": {
        const json = await fetchOembed(`https://www.dailymotion.com/services/oembed?url=${encoded}&format=json`);
        if (!json) return notFound();
        return ok({
          platform,
          duration: typeof json.duration === "number" ? json.duration : null,
          title: (json.title as string) ?? null,
        });
      }

      case "trusted_social": {
        // Twitter/X — try syndication API for duration
        const isTwitter = /(?:twitter\.com|x\.com|t\.co)/.test(raw);
        if (isTwitter) {
          const { duration, exists } = await getTwitterMeta(raw);
          if (!exists) return notFound();
          return ok({ platform: "twitter", duration, title: null });
        }
        return ok({ platform, duration: null, title: null });
      }

      // Direct video files handled client-side via <video>
      case "direct":
        return ok({ platform: "direct", duration: null, title: null });
    }
  } catch {
    return NextResponse.json({ data: null, error: "Failed to fetch video metadata." }, { status: 500 });
  }
}

function ok(data: { platform: string; duration: number | null; title: string | null }) {
  return NextResponse.json({ data, error: null });
}

function notFound() {
  return NextResponse.json({ data: null, error: "No video found at that URL." }, { status: 404 });
}
