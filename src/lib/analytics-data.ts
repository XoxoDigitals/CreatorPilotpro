import type { Platform, PlatformAnalytics, ScheduledPost } from "./types";

const PLATFORM_MULTIPLIERS: Record<Platform, number> = {
  youtube: 1.4,
  tiktok: 1.8,
  facebook: 1.1,
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function metric(base: number, seed: string, spread = 0.3): number {
  const h = hashString(seed) % 1000;
  return Math.round(base * (1 + (h / 1000) * spread));
}

export function getPlatformAnalytics(posts: ScheduledPost[]): PlatformAnalytics[] {
  const platforms: Platform[] = ["youtube", "tiktok", "facebook"];

  return platforms.map((platform) => {
    const platformPosts = posts.filter((p) => p.platforms.includes(platform));
    const published = platformPosts.filter((p) => p.status === "published");
    const scheduled = platformPosts.filter((p) => p.status === "scheduled");
    const failed = platformPosts.filter((p) => p.status === "failed");
    const mult = PLATFORM_MULTIPLIERS[platform];

    const views = published.reduce(
      (sum, p) => sum + metric(2400, p.id, 2.5) * mult,
      0
    );
    const likes = Math.round(views * 0.062);
    const comments = Math.round(views * 0.008);
    const shares = Math.round(views * 0.014);
    const engagementRate =
      views > 0 ? ((likes + comments + shares) / views) * 100 : 0;

    return {
      platform,
      views,
      likes,
      comments,
      shares,
      engagementRate: Math.round(engagementRate * 10) / 10,
      postsPublished: published.length,
      postsScheduled: scheduled.length,
      postsFailed: failed.length,
      viewsChangePct: metric(12, platform, 1.5) - 3,
    };
  });
}

export function getTotalAnalytics(metrics: PlatformAnalytics[]) {
  return metrics.reduce(
    (acc, m) => ({
      views: acc.views + m.views,
      likes: acc.likes + m.likes,
      comments: acc.comments + m.comments,
      shares: acc.shares + m.shares,
      published: acc.published + m.postsPublished,
      scheduled: acc.scheduled + m.postsScheduled,
    }),
    { views: 0, likes: 0, comments: 0, shares: 0, published: 0, scheduled: 0 }
  );
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function getViewsTrend(posts: ScheduledPost[]): { label: string; value: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const published = posts.filter((p) => p.status === "published");

  if (published.length === 0) {
    return days.map((label) => ({ label, value: 0 }));
  }

  const totalViews = published.reduce(
    (sum, p) => sum + metric(2400, p.id, 2.5),
    0
  );
  const perDay = Math.round(totalViews / 7);

  return days.map((label, i) => ({
    label,
    value: Math.round(perDay * (0.7 + (i % 3) * 0.15)),
  }));
}
