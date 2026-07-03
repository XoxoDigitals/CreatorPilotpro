import type { Platform, PlatformAnalytics, ScheduledPost } from "./types";

export function getPlatformAnalytics(posts: ScheduledPost[]): PlatformAnalytics[] {
  const platforms: Platform[] = ["youtube", "tiktok", "facebook"];

  return platforms.map((platform) => {
    const platformPosts = posts.filter((p) => p.platforms.includes(platform));
    const liveOnPlatform = platformPosts.filter(
      (p) =>
        p.status === "published" &&
        p.publishResults?.some((r) => r.platform === platform && r.success && r.externalUrl)
    ).length;

    return {
      platform,
      postsPublished: platformPosts.filter((p) => p.status === "published").length,
      postsScheduled: platformPosts.filter((p) => p.status === "scheduled").length,
      postsFailed: platformPosts.filter((p) => p.status === "failed").length,
      postsDraft: platformPosts.filter((p) => p.status === "draft").length,
      liveOnPlatform,
    };
  });
}

export function getTotalActivity(metrics: PlatformAnalytics[]) {
  return metrics.reduce(
    (acc, m) => ({
      published: acc.published + m.postsPublished,
      scheduled: acc.scheduled + m.postsScheduled,
      failed: acc.failed + m.postsFailed,
      draft: acc.draft + m.postsDraft,
      live: acc.live + m.liveOnPlatform,
    }),
    { published: 0, scheduled: 0, failed: 0, draft: 0, live: 0 }
  );
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
