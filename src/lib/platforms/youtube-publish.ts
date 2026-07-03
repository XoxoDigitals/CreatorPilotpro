import type { YouTubePostContent } from "@/lib/types";

const YOUTUBE_CATEGORY_IDS: Record<string, string> = {
  Education: "27",
  Entertainment: "24",
  "Howto & Style": "26",
  "People & Blogs": "22",
  "Science & Technology": "28",
  Gaming: "20",
};

export interface YouTubePublishInput {
  accessToken: string;
  videoBytes: Buffer;
  mimeType: string;
  content: YouTubePostContent;
}

export interface YouTubePublishResult {
  videoId: string;
  url: string;
}

export async function publishVideoToYouTube(
  input: YouTubePublishInput
): Promise<YouTubePublishResult> {
  const { accessToken, videoBytes, mimeType, content } = input;

  let description = content.description;
  if (content.videoType === "short" && !description.toLowerCase().includes("#shorts")) {
    description = `${description}\n\n#Shorts`.trim();
  }

  const categoryId = YOUTUBE_CATEGORY_IDS[content.category] ?? "22";

  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(videoBytes.length),
      },
      body: JSON.stringify({
        snippet: {
          title: content.title,
          description,
          tags: content.tags,
          categoryId,
        },
        status: {
          privacyStatus: content.visibility,
          selfDeclaredMadeForKids: content.madeForKids,
        },
      }),
    }
  );

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`YouTube upload init failed: ${err.slice(0, 300)}`);
  }

  const uploadUrl = initRes.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("YouTube did not return an upload URL.");
  }

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(videoBytes.length),
    },
    body: new Uint8Array(videoBytes),
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`YouTube video upload failed: ${err.slice(0, 300)}`);
  }

  const video = (await uploadRes.json()) as { id?: string };
  if (!video.id) {
    throw new Error("YouTube upload completed but no video ID was returned.");
  }

  return {
    videoId: video.id,
    url: `https://www.youtube.com/watch?v=${video.id}`,
  };
}
