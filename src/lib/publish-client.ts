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

async function parsePublishResponse(res: Response): Promise<{
  ok: boolean;
  partial?: boolean;
  results: PlatformPublishResult[];
  error?: string;
}> {
  const text = await res.text();

  try {
    return JSON.parse(text) as {
      ok: boolean;
      partial?: boolean;
      results: PlatformPublishResult[];
      error?: string;
    };
  } catch {
    if (res.status === 413 || text.toLowerCase().includes("too large")) {
      return {
        ok: false,
        results: [],
        error:
          "Video file is too large for the server upload limit. Ask your host to set nginx client_max_body_size to 250M, then redeploy.",
      };
    }

    if (res.status === 502 || res.status === 504) {
      return {
        ok: false,
        results: [],
        error:
          "Server timed out while uploading the video. Try a smaller file or increase nginx proxy_read_timeout on the server.",
      };
    }

    if (res.status === 404) {
      return {
        ok: false,
        results: [],
        error:
          "Publish API not found on the server. Run git pull, npm run build, and pm2 restart on the server.",
      };
    }

    return {
      ok: false,
      results: [],
      error: `Server returned an invalid response (HTTP ${res.status}). The video upload may be blocked by nginx — update client_max_body_size to 250M on the server.`,
    };
  }
}

export async function publishPostToPlatforms(post: ScheduledPost): Promise<{
  ok: boolean;
  partial: boolean;
  results: PlatformPublishResult[];
  error?: string;
}> {
  const form = new FormData();
  form.append("post", JSON.stringify(post));

  const needsVideo = post.platforms.some(
    (p) => p === "youtube" || p === "tiktok" || p === "facebook"
  );

  if (needsVideo) {
    if (!post.mediaId) {
      return {
        ok: false,
        partial: false,
        results: [],
        error: "Upload a video before publishing.",
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

  let res: Response;
  try {
    res = await fetch("/api/posts/publish", {
      method: "POST",
      body: form,
    });
  } catch {
    return {
      ok: false,
      partial: false,
      results: [],
      error: "Network error while publishing. Check your connection and try again.",
    };
  }

  const data = await parsePublishResponse(res);

  if (!res.ok) {
    return {
      ok: false,
      partial: Boolean(data.partial),
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
