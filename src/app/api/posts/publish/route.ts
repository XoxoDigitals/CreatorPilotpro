import { NextRequest, NextResponse } from "next/server";
import type { Platform, ScheduledPost } from "@/lib/types";
import { getYouTubeAccessToken } from "@/lib/platforms/platform-tokens";
import { publishVideoToYouTube } from "@/lib/platforms/youtube-publish";

export const maxDuration = 300;

export interface PlatformPublishResult {
  platform: Platform;
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const postRaw = form.get("post");
    const media = form.get("media");

    if (typeof postRaw !== "string") {
      return NextResponse.json({ ok: false, error: "Missing post data." }, { status: 400 });
    }

    const post = JSON.parse(postRaw) as ScheduledPost;
    const results: PlatformPublishResult[] = [];

    for (const platform of post.platforms) {
      if (platform === "youtube") {
        results.push(await publishYouTube(request, post, media));
      } else if (platform === "tiktok") {
        results.push({
          platform: "tiktok",
          success: false,
          error:
            "TikTok video upload API is not wired yet. Reconnect after TikTok app review, or publish to YouTube first.",
        });
      } else if (platform === "facebook") {
        results.push({
          platform: "facebook",
          success: false,
          error:
            "Facebook Reels/Page video upload API is not wired yet. Publish to YouTube first.",
        });
      }
    }

    const ok = results.length > 0 && results.every((r) => r.success);
    const partial = results.some((r) => r.success) && !ok;

    return NextResponse.json({
      ok,
      partial,
      results,
      error: ok
        ? undefined
        : results.map((r) => r.error).filter(Boolean).join(" ") ||
          "Publish failed on all platforms.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Publish failed.",
        results: [],
      },
      { status: 500 }
    );
  }
}

async function publishYouTube(
  request: NextRequest,
  post: ScheduledPost,
  media: FormDataEntryValue | null
): Promise<PlatformPublishResult> {
  const auth = await getYouTubeAccessToken(request);
  if (!auth) {
    return {
      platform: "youtube",
      success: false,
      error: "YouTube is not connected. Go to Channels and connect with OAuth again.",
    };
  }

  if (!post.youtube?.title?.trim()) {
    return {
      platform: "youtube",
      success: false,
      error: "YouTube title is required.",
    };
  }

  if (!media || typeof media === "string") {
    return {
      platform: "youtube",
      success: false,
      error: "A video file is required for YouTube upload.",
    };
  }

  const blob = media as Blob;
  const arrayBuffer = await blob.arrayBuffer();
  const videoBytes = Buffer.from(arrayBuffer);
  const mimeType = blob.type || "video/mp4";

  if (videoBytes.length === 0) {
    return {
      platform: "youtube",
      success: false,
      error: "Video file is empty.",
    };
  }

  try {
    const result = await publishVideoToYouTube({
      accessToken: auth.token,
      videoBytes,
      mimeType,
      content: post.youtube,
    });

    return {
      platform: "youtube",
      success: true,
      externalId: result.videoId,
      externalUrl: result.url,
    };
  } catch (error) {
    return {
      platform: "youtube",
      success: false,
      error: error instanceof Error ? error.message : "YouTube upload failed.",
    };
  }
}
