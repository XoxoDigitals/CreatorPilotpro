import { NextRequest, NextResponse } from "next/server";
import type { Platform, ScheduledPost } from "@/lib/types";
import {
  getFacebookPageAuth,
  getTikTokAccessToken,
  getYouTubeAccessToken,
} from "@/lib/platforms/platform-tokens";
import { publishVideoToFacebook } from "@/lib/platforms/facebook-publish";
import { publishVideoToTikTok } from "@/lib/platforms/tiktok-publish";
import { publishVideoToYouTube } from "@/lib/platforms/youtube-publish";

export const maxDuration = 300;

export interface PlatformPublishResult {
  platform: Platform;
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

async function loadVideoMedia(media: FormDataEntryValue | null) {
  if (!media || typeof media === "string") {
    return { ok: false as const, error: "A video file is required." };
  }

  const blob = media as Blob;
  const arrayBuffer = await blob.arrayBuffer();
  const videoBytes = Buffer.from(arrayBuffer);
  const mimeType = blob.type || "video/mp4";

  if (videoBytes.length === 0) {
    return { ok: false as const, error: "Video file is empty." };
  }

  return { ok: true as const, videoBytes, mimeType };
}

type LoadedVideo = Awaited<ReturnType<typeof loadVideoMedia>>;

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const postRaw = form.get("post");
    const media = form.get("media");

    if (typeof postRaw !== "string") {
      return NextResponse.json({ ok: false, error: "Missing post data." }, { status: 400 });
    }

    const post = JSON.parse(postRaw) as ScheduledPost;
    const video = await loadVideoMedia(media);

    if (!video.ok) {
      return NextResponse.json({ ok: false, error: video.error, results: [] }, { status: 400 });
    }

    const results: PlatformPublishResult[] = [];

    for (const platform of post.platforms) {
      if (platform === "youtube") {
        results.push(await publishYouTube(request, post, video));
      } else if (platform === "tiktok") {
        results.push(await publishTikTok(request, post, video));
      } else if (platform === "facebook") {
        results.push(await publishFacebook(request, post, video));
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
  video: Extract<LoadedVideo, { ok: true }>
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

  try {
    const result = await publishVideoToYouTube({
      accessToken: auth.token,
      videoBytes: video.videoBytes,
      mimeType: video.mimeType,
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

async function publishTikTok(
  request: NextRequest,
  post: ScheduledPost,
  video: Extract<LoadedVideo, { ok: true }>
): Promise<PlatformPublishResult> {
  const auth = await getTikTokAccessToken(request);
  if (!auth) {
    return {
      platform: "tiktok",
      success: false,
      error: "TikTok is not connected. Go to Channels and connect with OAuth again.",
    };
  }

  if (!post.tiktok?.caption?.trim()) {
    return {
      platform: "tiktok",
      success: false,
      error: "TikTok caption is required.",
    };
  }

  try {
    const result = await publishVideoToTikTok({
      accessToken: auth.token,
      videoBytes: video.videoBytes,
      mimeType: video.mimeType,
      content: post.tiktok,
    });

    return {
      platform: "tiktok",
      success: true,
      externalId: result.publishId,
      externalUrl: result.url,
    };
  } catch (error) {
    return {
      platform: "tiktok",
      success: false,
      error: error instanceof Error ? error.message : "TikTok upload failed.",
    };
  }
}

async function publishFacebook(
  request: NextRequest,
  post: ScheduledPost,
  video: Extract<LoadedVideo, { ok: true }>
): Promise<PlatformPublishResult> {
  const auth = await getFacebookPageAuth(request);
  if (!auth) {
    return {
      platform: "facebook",
      success: false,
      error:
        "Facebook Page is not connected. Reconnect OAuth and make sure you admin at least one Facebook Page.",
    };
  }

  if (!post.facebook) {
    return {
      platform: "facebook",
      success: false,
      error: "Facebook post content is required.",
    };
  }

  try {
    const result = await publishVideoToFacebook({
      pageId: auth.pageId,
      pageAccessToken: auth.pageAccessToken,
      videoBytes: video.videoBytes,
      mimeType: video.mimeType,
      content: post.facebook,
    });

    return {
      platform: "facebook",
      success: true,
      externalId: result.videoId,
      externalUrl: result.url,
    };
  } catch (error) {
    return {
      platform: "facebook",
      success: false,
      error: error instanceof Error ? error.message : "Facebook upload failed.",
    };
  }
}
