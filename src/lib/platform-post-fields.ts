import type {
  FacebookPostContent,
  Platform,
  TikTokPostContent,
  YouTubePostContent,
} from "./types";

export const YOUTUBE_CATEGORIES = [
  "Education",
  "Entertainment",
  "Howto & Style",
  "People & Blogs",
  "Science & Technology",
  "Gaming",
] as const;

export const FACEBOOK_CTA_OPTIONS = [
  { value: "NONE", label: "No button" },
  { value: "LEARN_MORE", label: "Learn more" },
  { value: "SHOP_NOW", label: "Shop now" },
  { value: "SIGN_UP", label: "Sign up" },
  { value: "WATCH_MORE", label: "Watch more" },
] as const;

export function defaultYouTubeContent(): YouTubePostContent {
  return {
    title: "",
    description: "",
    tags: [],
    category: "People & Blogs",
    visibility: "public",
    madeForKids: false,
  };
}

export function defaultTikTokContent(): TikTokPostContent {
  return {
    caption: "",
    hashtags: [],
    allowComments: true,
    allowDuet: true,
    allowStitch: true,
    privacy: "public_to_everyone",
  };
}

export function defaultFacebookContent(): FacebookPostContent {
  return {
    title: "",
    message: "",
    description: "",
    callToAction: "NONE",
  };
}

export function parseTags(raw: string): string[] {
  return raw
    .split(/[,#]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function postDisplayTitle(
  platforms: Platform[],
  youtube?: YouTubePostContent,
  tiktok?: TikTokPostContent,
  facebook?: FacebookPostContent,
  fallback = "Untitled post"
): string {
  if (platforms.includes("youtube") && youtube?.title) return youtube.title;
  if (platforms.includes("facebook") && facebook?.title) return facebook.title;
  if (platforms.includes("tiktok") && tiktok?.caption) {
    return tiktok.caption.slice(0, 80);
  }
  return fallback;
}

export const PLATFORM_FIELD_HINTS: Record<Platform, string> = {
  youtube: "Title, description, tags, thumbnail, and visibility for YouTube.",
  tiktok: "Caption, hashtags, and privacy settings for TikTok.",
  facebook: "Post message, video title, description, and call-to-action for Facebook.",
};
