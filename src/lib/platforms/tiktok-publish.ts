import type { TikTokPostContent } from "@/lib/types";

export interface TikTokPublishInput {
  accessToken: string;
  videoBytes: Buffer;
  mimeType: string;
  content: TikTokPostContent;
}

export interface TikTokPublishResult {
  publishId: string;
  url?: string;
}

function buildCaption(content: TikTokPostContent): string {
  const tags = content.hashtags
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");
  const caption = content.caption.trim();
  if (!tags) return caption.slice(0, 2200);
  return `${caption} ${tags}`.trim().slice(0, 2200);
}

function mapPrivacy(
  privacy: TikTokPostContent["privacy"]
): "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY" {
  switch (privacy) {
    case "mutual_follow_friends":
      return "MUTUAL_FOLLOW_FRIENDS";
    case "self_only":
      return "SELF_ONLY";
    default:
      return "PUBLIC_TO_EVERYONE";
  }
}

async function tiktokApi<T>(
  accessToken: string,
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`https://open.tiktokapis.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    data?: T;
    error?: { code?: string; message?: string; log_id?: string };
  };

  if (!res.ok || (json.error?.code && json.error.code !== "ok")) {
    const msg = json.error?.message ?? `TikTok API error (${res.status})`;
    throw new Error(msg);
  }

  if (!json.data) {
    throw new Error("TikTok API returned an empty response.");
  }

  return json.data;
}

async function uploadVideoChunk(
  uploadUrl: string,
  videoBytes: Buffer,
  mimeType: string
): Promise<void> {
  const size = videoBytes.length;
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(size),
      "Content-Range": `bytes 0-${size - 1}/${size}`,
    },
    body: new Uint8Array(videoBytes),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TikTok video transfer failed: ${err.slice(0, 300)}`);
  }
}

async function waitForTikTokPublish(
  accessToken: string,
  publishId: string
): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const status = await tiktokApi<{
      status?: string;
      fail_reason?: string;
    }>(accessToken, "/v2/post/publish/status/fetch/", { publish_id: publishId });

    const state = status.status ?? "";

    if (state === "PUBLISH_COMPLETE") {
      return;
    }

    if (state === "FAILED") {
      throw new Error(status.fail_reason ?? "TikTok publish failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("TikTok publish timed out while processing.");
}

export async function publishVideoToTikTok(
  input: TikTokPublishInput
): Promise<TikTokPublishResult> {
  const { accessToken, videoBytes, mimeType, content } = input;
  const videoSize = videoBytes.length;

  if (!content.caption.trim()) {
    throw new Error("TikTok caption is required.");
  }

  if (videoSize === 0) {
    throw new Error("Video file is empty.");
  }

  const init = await tiktokApi<{
    publish_id: string;
    upload_url: string;
  }>(accessToken, "/v2/post/publish/video/init/", {
    post_info: {
      title: buildCaption(content),
      privacy_level: mapPrivacy(content.privacy),
      disable_duet: !content.allowDuet,
      disable_comment: !content.allowComments,
      disable_stitch: !content.allowStitch,
    },
    source_info: {
      source: "FILE_UPLOAD",
      video_size: videoSize,
      chunk_size: videoSize,
      total_chunk_count: 1,
    },
  });

  await uploadVideoChunk(init.upload_url, videoBytes, mimeType);
  await waitForTikTokPublish(accessToken, init.publish_id);

  return {
    publishId: init.publish_id,
  };
}
