"use client";

import { useEffect, useState } from "react";
import { Eye, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { cardClass } from "@/lib/form-styles";
import { getPosts } from "@/lib/stores/app-store";
import {
  formatCompact,
  getPlatformAnalytics,
  getTotalAnalytics,
  getViewsTrend,
} from "@/lib/analytics-data";
import type { PlatformAnalytics } from "@/lib/types";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<PlatformAnalytics[]>([]);
  const [trend, setTrend] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    const posts = getPosts();
    setMetrics(getPlatformAnalytics(posts));
    setTrend(getViewsTrend(posts));
  }, []);

  const totals = getTotalAnalytics(metrics);
  const maxTrend = Math.max(...trend.map((t) => t.value), 1);

  return (
    <>
      <DashboardTopBar
        title="Insights"
        subtitle="Performance across your connected platforms"
      />
      <div className="mx-auto max-w-6xl space-y-8 p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total views" value={formatCompact(totals.views)} icon={Eye} />
          <StatCard label="Likes" value={formatCompact(totals.likes)} icon={Heart} />
          <StatCard label="Comments" value={formatCompact(totals.comments)} icon={MessageCircle} />
          <StatCard label="Shares" value={formatCompact(totals.shares)} icon={Share2} />
        </div>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold">Views this week</h2>
          <div className="mt-6 flex items-end justify-between gap-2" style={{ height: 160 }}>
            {trend.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-[48px] rounded-t-lg bg-primary/80 transition-all"
                  style={{ height: `${(point.value / maxTrend) * 120}px` }}
                  title={`${point.value.toLocaleString()} views`}
                />
                <span className="text-[10px] text-muted-foreground">{point.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div>
          <h2 className="mb-4 text-sm font-semibold">By platform</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {metrics.map((m) => (
              <article key={m.platform} className={cardClass}>
                <div className="flex items-center justify-between">
                  <PlatformIcon platform={m.platform} />
                  <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-success)]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{m.viewsChangePct}%
                  </span>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Views</dt>
                    <dd className="font-semibold">{formatCompact(m.views)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Engagement</dt>
                    <dd className="font-semibold">{m.engagementRate}%</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Published</dt>
                    <dd className="font-semibold">{m.postsPublished}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Scheduled</dt>
                    <dd className="font-semibold">{m.postsScheduled}</dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Likes</span>
                    <span className="font-medium text-foreground">{formatCompact(m.likes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comments</span>
                    <span className="font-medium text-foreground">{formatCompact(m.comments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shares</span>
                    <span className="font-medium text-foreground">{formatCompact(m.shares)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Metrics appear after you publish posts. Connect live APIs for real-time platform data.
        </p>
      </div>
    </>
  );
}
