import type { FacebookPostContent } from "@/lib/types";

export interface FacebookPublishInput {
  pageId: string;
  pageAccessToken: string;
  videoBytes: Buffer;
  mimeType: string;
  content: FacebookPostContent;
}

export interface FacebookPublishResult {
  videoId: string;
  url: string;
}

export async function publishVideoToFacebook(
  input: FacebookPublishInput
): Promise<FacebookPublishResult> {
  const { pageId, pageAccessToken, videoBytes, mimeType, content } = input;

  if (!content.message.trim() && !content.title.trim()) {
    throw new Error("Facebook post message or title is required.");
  }

  if (videoBytes.length === 0) {
    throw new Error("Video file is empty.");
  }

  const form = new FormData();
  form.append(
    "source",
    new Blob([new Uint8Array(videoBytes)], { type: mimeType }),
    "video.mp4"
  );
  form.append("title", content.title || content.message.slice(0, 100));
  form.append("description", content.description || content.message);

  const url = new URL(`https://graph.facebook.com/v21.0/${pageId}/videos`);
  url.searchParams.set("access_token", pageAccessToken);

  const res = await fetch(url.toString(), {
    method: "POST",
    body: form,
  });

  const json = (await res.json()) as { id?: string; error?: { message?: string } };

  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Facebook upload failed (${res.status})`);
  }

  if (!json.id) {
    throw new Error("Facebook upload completed but no video ID was returned.");
  }

  return {
    videoId: json.id,
    url: `https://www.facebook.com/watch/?v=${json.id}`,
  };
}
