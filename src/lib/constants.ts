import type { Platform } from "./types";

export const APP_NAME = "Creator Pilot Pro";

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: "text-destructive",
  tiktok: "text-foreground",
  facebook: "text-primary",
};

export const MARKETING_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const POLICY_NAV = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/data-deletion", label: "Data Deletion" },
  { href: "/acceptable-use", label: "Acceptable Use" },
  { href: "/community-guidelines", label: "Community Guidelines" },
  { href: "/policies/youtube", label: "YouTube Policies" },
  { href: "/policies/facebook", label: "Facebook Policies" },
  { href: "/policies/tiktok", label: "TikTok Policies" },
] as const;

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Home", icon: "LayoutDashboard", description: "Your overview" },
  { href: "/dashboard/posts", label: "Posts", icon: "FileVideo", description: "Create & manage" },
  { href: "/dashboard/schedule", label: "Schedule", icon: "Calendar", description: "Publishing times" },
  { href: "/dashboard/accounts", label: "Channels", icon: "Link2", description: "Connect platforms" },
  { href: "/dashboard/analytics", label: "Insights", icon: "BarChart3", description: "Performance" },
  { href: "/dashboard/settings", label: "Setup", icon: "Settings", description: "API keys & profile" },
] as const;

export const EXTERNAL_POLICIES = {
  youtube: {
    terms: "https://www.youtube.com/t/terms",
    community: "https://www.youtube.com/howyoutubeworks/policies/community-guidelines/",
    api: "https://developers.google.com/youtube/terms/api-services-terms-of-service",
    privacy: "https://policies.google.com/privacy",
  },
  facebook: {
    terms: "https://www.facebook.com/terms.php",
    community: "https://transparency.meta.com/policies/community-standards/",
    platform: "https://developers.facebook.com/terms/",
    privacy: "https://www.facebook.com/privacy/policy/",
  },
  tiktok: {
    terms: "https://www.tiktok.com/legal/terms-of-service",
    community: "https://www.tiktok.com/community-guidelines",
    developer: "https://developers.tiktok.com/doc/terms-and-conditions",
    privacy: "https://www.tiktok.com/legal/privacy-policy",
  },
} as const;
