"use client";

import { getMediaBlob } from "./media-storage";
import type { Platform, ScheduledPost } from "./types";

export interface PlatformPublishResult {
  platform: Platform;
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

export async function publishPostToPlatforms(post: ScheduledPost): Promise<{
  ok: boolean;
  partial: boolean;
  results: PlatformPublishResult[];
  error?: string;
}> {
  const form = new FormData();
  form.append("post", JSON.stringify(post));

  const needsVideo = post.platforms.some((p) => p === "youtube" || p === "tiktok");

  if (needsVideo) {
    if (!post.mediaId) {
      return {
        ok: false,
        partial: false,
        results: [],
        error: "Upload a video before publishing to YouTube or TikTok.",
      };
    }

    const blob = await getMediaBlob(post.mediaId);
    if (!blob) {
      return {
        ok: false,
        partial: false,
        results: [],
        error: "Video file not found. Re-upload your media and try again.",
      };
    }

    form.append(
      "media",
      blob,
      post.mediaFileName ?? (post.mediaType === "video" ? "upload.mp4" : "upload.jpg")
    );
  }

  const res = await fetch("/api/posts/publish", {
    method: "POST",
    body: form,
  });

  const data = (await res.json()) as {
    ok: boolean;
    partial?: boolean;
    results: PlatformPublishResult[];
    error?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      partial: false,
      results: data.results ?? [],
      error: data.error ?? "Publish request failed.",
    };
  }

  return {
    ok: data.ok,
    partial: Boolean(data.partial),
    results: data.results ?? [],
    error: data.error,
  };
}
