"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CheckCircle2, FileVideo, AlertCircle, ExternalLink } from "lucide-react";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { cardClass } from "@/lib/form-styles";
import { getPosts } from "@/lib/stores/app-store";
import { getPlatformAnalytics, getTotalActivity } from "@/lib/analytics-data";
import type { PlatformAnalytics } from "@/lib/types";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<PlatformAnalytics[]>([]);

  useEffect(() => {
    setMetrics(getPlatformAnalytics(getPosts()));
  }, []);

  const totals = getTotalActivity(metrics);
  const postsWithLinks = getPosts().flatMap((post) =>
    (post.publishResults ?? [])
      .filter((r) => r.success && r.externalUrl)
      .map((r) => ({
        postTitle: post.title,
        platform: r.platform,
        url: r.externalUrl!,
      }))
  );

  return (
    <>
      <DashboardTopBar
        title="Insights"
        subtitle="Real publishing activity from your dashboard"
      />
      <div className="mx-auto max-w-6xl space-y-8 p-4 lg:p-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            View counts, likes, and comments are not available yet
          </p>
          <p className="mt-1 text-muted-foreground">
            This page shows only what Creator Pilot Pro actually did — scheduled posts, failed uploads,
            and confirmed live links on YouTube/TikTok/Facebook. Platform analytics APIs will be added next.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Live on platforms" value={totals.live} icon={CheckCircle2} hint="Confirmed upload links" />
          <StatCard label="Marked published" value={totals.published} icon={FileVideo} hint="In your dashboard" />
          <StatCard label="Scheduled" value={totals.scheduled} icon={Calendar} hint="Waiting to publish" />
          <StatCard label="Failed" value={totals.failed} icon={AlertCircle} hint="Upload errors" />
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold">By platform</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {metrics.map((m) => (
              <article key={m.platform} className={cardClass}>
                <PlatformIcon platform={m.platform} />
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Live links</dt>
                    <dd className="font-semibold">{m.liveOnPlatform}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Published</dt>
                    <dd className="font-semibold">{m.postsPublished}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Scheduled</dt>
                    <dd className="font-semibold">{m.postsScheduled}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Failed</dt>
                    <dd className="font-semibold">{m.postsFailed}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold">Confirmed live posts</h2>
          {postsWithLinks.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No confirmed platform links yet. Use <strong>Post now</strong> with a connected YouTube account and a video file.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {postsWithLinks.map((item, i) => (
                <li key={`${item.url}-${i}`} className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.postTitle}</p>
                    <p className="text-xs capitalize text-muted-foreground">{item.platform}</p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:opacity-90"
                  >
                    View <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Need YouTube views and engagement?{" "}
          <Link href="/dashboard/settings" className="text-primary underline">
            Ensure API keys and OAuth are connected
          </Link>
          , then publish a video with Post now.
        </p>
      </div>
    </>
  );
}
