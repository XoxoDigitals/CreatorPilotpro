"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  FileVideo,
  Link2,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { cardClass, btnPrimary } from "@/lib/form-styles";
import { getDashboardStats, getPosts, getUserProfile } from "@/lib/stores/app-store";
import { postDisplayTitle } from "@/lib/platform-post-fields";
import type { DashboardStats, ScheduledPost } from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<ScheduledPost[]>([]);
  const profile = getUserProfile();

  useEffect(() => {
    setStats(getDashboardStats());
    setUpcoming(
      getPosts()
        .filter((p) => p.status === "scheduled" || p.status === "draft")
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 4)
    );
  }, []);

  return (
    <>
      <DashboardTopBar
        title={`Hello, ${profile.name.split(" ")[0]}`}
        subtitle="Here's what's happening with your content"
        showCreate
      />
      <div className="mx-auto max-w-6xl space-y-8 p-4 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Schedule once, publish to YouTube, TikTok, and Facebook.
          </p>
          <Link href="/dashboard/posts?create=1" className={btnPrimary}>
            <Plus className="h-4 w-4" />
            Create post
          </Link>
        </div>

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Scheduled" value={stats.scheduledPosts} icon={Calendar} hint="Ready to publish" />
            <StatCard label="Published" value={stats.publishedPosts} icon={TrendingUp} hint="Live on platforms" trend={{ value: 8, label: "this week" }} />
            <StatCard label="Drafts" value={stats.draftPosts} icon={FileVideo} hint="Work in progress" />
            <StatCard label="Channels" value={stats.connectedAccounts} icon={Link2} hint="Connected accounts" />
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-5">
          <section className={`${cardClass} lg:col-span-3`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Up next</h2>
              <Link href="/dashboard/posts" className="flex items-center gap-1 text-xs text-primary hover:opacity-90">
                All posts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border py-10 text-center">
                <p className="text-sm text-muted-foreground">No upcoming posts yet.</p>
                <Link href="/dashboard/posts?create=1" className="mt-3 inline-block text-sm font-medium text-primary">
                  Create your first post →
                </Link>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcoming.map((post) => (
                  <li key={post.id} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {postDisplayTitle(post.platforms, post.youtube, post.tiktok, post.facebook, post.title)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(post.scheduledAt).toLocaleString()} · {post.status}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {post.platforms.map((p) => (
                        <PlatformIcon key={p} platform={p} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`${cardClass} lg:col-span-2`}>
            <h2 className="text-sm font-semibold">Quick links</h2>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/dashboard/posts?create=1", label: "Create a new post", desc: "Upload media & set platform details" },
                { href: "/dashboard/accounts", label: "Connect channels", desc: "YouTube, TikTok, Facebook" },
                { href: "/dashboard/settings", label: "Add API keys", desc: "Step-by-step setup guides" },
                { href: "/dashboard/analytics", label: "View insights", desc: "See how posts perform" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-xl border border-border p-3 transition hover:border-primary/40 hover:bg-muted/30">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
