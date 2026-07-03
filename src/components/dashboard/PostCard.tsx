"use client";

import { Calendar, Film, Trash2, Send, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import type { ScheduledPost } from "@/lib/types";
import { postDisplayTitle } from "@/lib/platform-post-fields";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { cardClass, btnPrimary } from "@/lib/form-styles";
import { useMediaObjectUrl } from "@/hooks/useMediaObjectUrl";

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
  publishLabel?: string;
  publishing?: boolean;
}

export function PostCard({
  post,
  onDelete,
  onPublish,
  publishLabel = "Post now",
  publishing = false,
}: PostCardProps) {
  const previewUrl = useMediaObjectUrl(post.mediaId, post.mediaUrl);
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
        {previewUrl ? (
          <div className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-border sm:block">
            {post.mediaType === "video" ? (
              <video src={previewUrl} className="h-full w-full object-cover" muted />
            ) : (
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        ) : post.mediaId ? (
          <div className="hidden h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 sm:flex">
            <Film className="h-5 w-5 animate-pulse text-muted-foreground" />
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
          {post.platforms.includes("youtube") && post.youtube && (
            <p className="mt-1 text-xs text-muted-foreground">
              YouTube: {(post.youtube.videoType ?? "short") === "short" ? "Short" : "Long-form"}
            </p>
          )}
          {post.errorMessage && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {post.errorMessage}
            </p>
          )}
          {(post.publishResults ?? [])
            .filter((r) => r.success && r.externalUrl)
            .map((r) => (
              <a
                key={r.platform}
                href={r.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-90"
              >
                View on {r.platform} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          {post.tiktok?.hashtags && post.tiktok.hashtags.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              TT: {post.tiktok.hashtags.map((h) => `#${h}`).join(" ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {(post.status === "scheduled" || post.status === "draft") && onPublish && (
          <button
            type="button"
            onClick={() => onPublish(post.id)}
            disabled={publishing}
            className={btnPrimary}
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {publishing ? "Publishing…" : publishLabel}
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
