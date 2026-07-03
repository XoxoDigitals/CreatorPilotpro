"use client";

import type { ScheduledPost } from "./types";
import {
  dataUrlToBlob,
  deleteMediaIds,
  generateMediaId,
  putMedia,
} from "./media-storage";
import { readStorage, writeStorage, STORAGE_KEYS } from "./storage";

function isDataUrl(value?: string): value is string {
  return typeof value === "string" && value.startsWith("data:");
}

export function collectPostMediaIds(post: ScheduledPost): string[] {
  const ids: string[] = [];
  if (post.mediaId) ids.push(post.mediaId);
  if (post.youtube?.thumbnailMediaId) ids.push(post.youtube.thumbnailMediaId);
  if (post.facebook?.thumbnailMediaId) ids.push(post.facebook.thumbnailMediaId);
  return ids;
}

export async function compactPostForStorage(post: ScheduledPost): Promise<ScheduledPost> {
  let next: ScheduledPost = { ...post };

  if (isDataUrl(next.mediaUrl)) {
    const id = next.mediaId ?? generateMediaId(`media-${next.id}`);
    await putMedia(id, dataUrlToBlob(next.mediaUrl));
    next = { ...next, mediaId: id, mediaUrl: undefined };
  }

  if (next.youtube && isDataUrl(next.youtube.thumbnailUrl)) {
    const id = next.youtube.thumbnailMediaId ?? generateMediaId(`thumb-yt-${next.id}`);
    await putMedia(id, dataUrlToBlob(next.youtube.thumbnailUrl));
    next = {
      ...next,
      youtube: {
        ...next.youtube,
        thumbnailMediaId: id,
        thumbnailUrl: undefined,
      },
    };
  }

  if (next.facebook && isDataUrl(next.facebook.thumbnailUrl)) {
    const id = next.facebook.thumbnailMediaId ?? generateMediaId(`thumb-fb-${next.id}`);
    await putMedia(id, dataUrlToBlob(next.facebook.thumbnailUrl));
    next = {
      ...next,
      facebook: {
        ...next.facebook,
        thumbnailMediaId: id,
        thumbnailUrl: undefined,
      },
    };
  }

  next = {
    ...next,
    mediaUrl: undefined,
    youtube: next.youtube ? { ...next.youtube, thumbnailUrl: undefined } : undefined,
    facebook: next.facebook ? { ...next.facebook, thumbnailUrl: undefined } : undefined,
  };

  return next;
}

export async function compactPostsForStorage(posts: ScheduledPost[]): Promise<ScheduledPost[]> {
  const compact: ScheduledPost[] = [];
  for (const post of posts) {
    compact.push(await compactPostForStorage(post));
  }
  return compact;
}

export async function deletePostMedia(post: ScheduledPost | undefined): Promise<void> {
  if (!post) return;
  await deleteMediaIds(collectPostMediaIds(post));
}

export async function migrateLegacyPostMedia(): Promise<void> {
  const raw = readStorage<ScheduledPost[]>(STORAGE_KEYS.posts, []);
  const needsMigration = raw.some(
    (post) =>
      isDataUrl(post.mediaUrl) ||
      isDataUrl(post.youtube?.thumbnailUrl) ||
      isDataUrl(post.facebook?.thumbnailUrl)
  );
  if (!needsMigration) return;

  const compact = await compactPostsForStorage(raw);
  writeStorage(STORAGE_KEYS.posts, compact);
}
