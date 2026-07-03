"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Send, Plus, Save } from "lucide-react";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { PostCard } from "@/components/dashboard/PostCard";
import { cardClass, inputClass, labelClass, btnPrimary, btnSecondary } from "@/lib/form-styles";
import {
  getScheduleConfig,
  getPosts,
  saveScheduleConfig,
  publishPostNow,
  deletePost,
} from "@/lib/stores/app-store";
import type { ScheduleConfig, ScheduleMode } from "@/lib/types";
import { WEEKDAYS } from "@/lib/types";

export default function SchedulePage() {
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [saved, setSaved] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const refreshQueue = useCallback(() => {
    return getPosts()
      .filter((p) => p.status === "scheduled" || p.status === "draft")
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, []);

  const [queue, setQueue] = useState(refreshQueue);

  useEffect(() => {
    setConfig(getScheduleConfig());
    setQueue(refreshQueue());
  }, [refreshQueue]);

  if (!config) return null;

  function update(patch: Partial<ScheduleConfig>) {
    setConfig((c) => (c ? { ...c, ...patch } : c));
    setSaved(false);
  }

  function handleSave() {
    if (config) {
      saveScheduleConfig(config);
      setSaved(true);
    }
  }

  function updateTime(index: number, value: string) {
    const postTimes = [...config!.postTimes];
    postTimes[index] = value;
    update({ postTimes });
  }

  async function handlePostNow(id: string) {
    setPublishingId(id);
    setPublishMessage(null);
    const result = await publishPostNow(id);
    setPublishingId(null);
    setQueue(refreshQueue());
    if (result.ok) {
      setPublishMessage("Post published successfully.");
    } else {
      setPublishMessage(result.error ?? "Could not publish post.");
    }
  }

  return (
    <>
      <DashboardTopBar
        title="Schedule"
        subtitle="Publish now or set default publishing times"
      />
      <div className="mx-auto max-w-4xl space-y-8 p-4 lg:p-8">
        <section className={`${cardClass} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Ready to publish</h2>
              <p className="text-xs text-muted-foreground">
                Skip the wait — send scheduled or draft posts immediately.
              </p>
            </div>
            <Link href="/dashboard/posts?create=1" className={btnSecondary}>
              <Plus className="h-4 w-4" />
              New post
            </Link>
          </div>

          {publishMessage && (
            <p
              className={`text-sm ${
                publishMessage.includes("success")
                  ? "text-[var(--color-success)]"
                  : "text-destructive"
              }`}
            >
              {publishMessage}
            </p>
          )}

          {queue.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">No scheduled or draft posts.</p>
              <Link href="/dashboard/posts?create=1" className="mt-3 inline-block text-sm font-medium text-primary">
                Create a post →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((post) => (
                <div key={post.id} className="relative">
                  <PostCard
                    post={post}
                    onDelete={async (id) => {
                      if (!confirm("Delete this post?")) return;
                      try {
                        await deletePost(id);
                        setQueue(refreshQueue());
                      } catch (error) {
                        alert(error instanceof Error ? error.message : "Could not delete post.");
                      }
                    }}
                    onPublish={handlePostNow}
                    publishLabel="Post now"
                    publishing={publishingId === post.id}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={`${cardClass} space-y-6`}>
          <div>
            <h2 className="text-sm font-semibold">Default schedule</h2>
            <p className="text-xs text-muted-foreground">
              Times used when you schedule posts for later.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Auto-publishing</p>
              <p className="text-xs text-muted-foreground">Enable scheduled publishing</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.enabled}
              onClick={() => update({ enabled: !config.enabled })}
              className={`relative h-7 w-12 rounded-full transition ${config.enabled ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${config.enabled ? "left-5" : "left-0.5"}`}
              />
            </button>
          </div>

          <div>
            <label className={labelClass}>Schedule mode</label>
            <div className="mt-2 flex gap-2">
              {(["fixed", "weekly"] as ScheduleMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update({ mode })}
                  className={`rounded-full border px-4 py-2 text-xs font-medium capitalize ${
                    config.mode === mode
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="postsPerDay" className={labelClass}>Posts per day</label>
            <input
              id="postsPerDay"
              type="number"
              min={1}
              max={20}
              value={config.postsPerDay}
              onChange={(e) => update({ postsPerDay: Number(e.target.value) })}
              className={`${inputClass} max-w-xs`}
            />
          </div>

          {config.mode === "fixed" ? (
            <div>
              <label className={labelClass}>Daily post times</label>
              <div className="mt-2 flex flex-wrap gap-3">
                {config.postTimes.map((time, i) => (
                  <input
                    key={i}
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className={`${inputClass} max-w-[140px]`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {WEEKDAYS.map((day) => (
                <div key={day} className="rounded-xl border border-border p-4">
                  <p className="text-sm font-semibold capitalize">{day}</p>
                  <input
                    type="text"
                    placeholder="09:00, 18:00"
                    value={(config.weeklySchedule[day] ?? []).join(", ")}
                    onChange={(e) =>
                      update({
                        weeklySchedule: {
                          ...config.weeklySchedule,
                          [day]: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        },
                      })
                    }
                    className={`${inputClass} mt-2`}
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="timezone" className={labelClass}>Timezone</label>
            <input
              id="timezone"
              value={config.timezone}
              onChange={(e) => update({ timezone: e.target.value })}
              className={`${inputClass} max-w-md`}
            />
          </div>

          <button type="button" onClick={handleSave} className={btnPrimary}>
            <Save className="h-4 w-4" />
            Save schedule
          </button>
          {saved && (
            <p className="text-sm text-[var(--color-success)]">Schedule saved successfully.</p>
          )}
        </section>
      </div>
    </>
  );
}
