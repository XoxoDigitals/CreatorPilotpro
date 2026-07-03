"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { PostComposer } from "@/components/dashboard/PostComposer";
import { PostCard } from "@/components/dashboard/PostCard";
import {
  addPost,
  deletePost,
  getPosts,
  savePosts,
  publishPostNow,
} from "@/lib/stores/app-store";
import type { ScheduledPost } from "@/lib/types";

export default function PostsClient() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [filter, setFilter] = useState<"all" | "scheduled" | "draft" | "published">("all");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    setPosts(getPosts());
    if (searchParams.get("create") === "1") setShowComposer(true);
  }, [searchParams]);

  function refresh() {
    setPosts(getPosts());
  }

  async function handleSave(post: ScheduledPost, postNow?: boolean) {
    try {
      const existing = getPosts().find((p) => p.id === post.id);
      if (existing) {
        await savePosts(getPosts().map((p) => (p.id === post.id ? post : p)));
      } else {
        await addPost(post);
      }
    if (postNow) {
      setPublishingId(post.id);
      const result = await publishPostNow(post.id);
      setPublishingId(null);
      if (!result.ok) {
        alert(result.error ?? "Publish failed. Check Channels OAuth and upload a video file.");
      }
    }
      setShowComposer(false);
      refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Could not save this post. Try a smaller file or remove old posts."
      );
    }
  }

  async function handlePostNow(id: string) {
    setPublishingId(id);
    const result = await publishPostNow(id);
    setPublishingId(null);
    refresh();
    if (!result.ok) {
      alert(result.error ?? "Publish failed.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(id);
      refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not delete post.");
    }
  }

  const filtered = posts.filter((p) => filter === "all" || p.status === filter);

  return (
    <>
      <DashboardTopBar
        title="Posts"
        subtitle="Create content with platform-specific fields"
        showCreate={!showComposer}
      />
      <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-8">
        {showComposer ? (
          <PostComposer
            onSave={handleSave}
            onCancel={() => setShowComposer(false)}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {(["all", "scheduled", "draft", "published"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                <p className="text-sm text-muted-foreground">No posts in this view.</p>
                <button
                  type="button"
                  onClick={() => setShowComposer(true)}
                  className="mt-3 text-sm font-medium text-primary hover:opacity-90"
                >
                  Create a post →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handleDelete}
                    onPublish={handlePostNow}
                    publishing={publishingId === post.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
