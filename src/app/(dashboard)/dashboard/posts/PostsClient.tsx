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
  updatePost,
} from "@/lib/stores/app-store";
import type { ScheduledPost } from "@/lib/types";

export default function PostsClient() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [filter, setFilter] = useState<"all" | "scheduled" | "draft" | "published">("all");

  useEffect(() => {
    setPosts(getPosts());
    if (searchParams.get("create") === "1") setShowComposer(true);
  }, [searchParams]);

  function refresh() {
    setPosts(getPosts());
  }

  function handleSave(post: ScheduledPost) {
    const existing = getPosts().find((p) => p.id === post.id);
    if (existing) {
      updatePost(post.id, post);
    } else {
      addPost(post);
    }
    setShowComposer(false);
    refresh();
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
                    onDelete={(id) => {
                      if (confirm("Delete this post?")) {
                        deletePost(id);
                        refresh();
                      }
                    }}
                    onPublish={(id) => {
                      updatePost(id, {
                        status: "published",
                        publishedAt: new Date().toISOString(),
                      });
                      refresh();
                    }}
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
