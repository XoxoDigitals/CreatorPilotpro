"use client";

import { Calendar, Film, Trash2, CheckCircle2 } from "lucide-react";
import type { ScheduledPost } from "@/lib/types";
import { postDisplayTitle } from "@/lib/platform-post-fields";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { cardClass, btnSecondary } from "@/lib/form-styles";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/10 text-primary",
  published: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  failed: "bg-destructive/10 text-destructive",
  publishing: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
};

interface PostCardProps {
  post: ScheduledPost;
  onDelete: (id: string) => void;
  onPublish?: (id: string) => void;
}

export function PostCard({ post, onDelete, onPublish }: PostCardProps) {
  const title = postDisplayTitle(
    post.platforms,
    post.youtube,
    post.tiktok,
    post.facebook,
    post.title
  );

  return (
    <article className={cardClass}>
      <div className="flex gap-4">
        {post.mediaUrl ? (
          <div className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-border sm:block">
            {post.mediaType === "video" ? (
              <video src={post.mediaUrl} className="h-full w-full object-cover" muted />
            ) : (
              <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        ) : (
          <div className="hidden h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 sm:flex">
            <Film className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.scheduledAt).toLocaleString()}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[post.status] ?? STATUS_STYLES.draft}`}>
              {post.status}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {post.platforms.map((p) => (
              <PlatformIcon key={p} platform={p} />
            ))}
          </div>

          {post.youtube?.tags && post.youtube.tags.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              YT tags: {post.youtube.tags.join(", ")}
            </p>
          )}
          {post.tiktok?.hashtags && post.tiktok.hashtags.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              TT: {post.tiktok.hashtags.map((h) => `#${h}`).join(" ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {post.status === "scheduled" && onPublish && (
          <button type="button" onClick={() => onPublish(post.id)} className={btnSecondary}>
            <CheckCircle2 className="h-4 w-4" />
            Mark published
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(post.id)}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm text-destructive hover:bg-destructive/5"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </article>
  );
}
