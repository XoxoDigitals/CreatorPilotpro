"use client";

import {
  readStorage,
  writeStorage,
  removeStorage,
  STORAGE_KEYS,
  DATA_STORE_VERSION,
} from "../storage";
import {
  compactPostForStorage,
  compactPostsForStorage,
  deletePostMedia,
  migrateLegacyPostMedia,
} from "../post-media";
import type {
  ConnectedAccount,
  DashboardStats,
  Platform,
  ScheduleConfig,
  ScheduledPost,
  UserProfile,
} from "../types";

const DEFAULT_SCHEDULE: ScheduleConfig = {
  mode: "fixed",
  postsPerDay: 2,
  postTimes: ["09:00", "18:00"],
  weeklySchedule: {
    monday: ["09:00", "18:00"],
    tuesday: ["09:00", "18:00"],
    wednesday: ["09:00", "18:00"],
    thursday: ["09:00", "18:00"],
    friday: ["09:00", "18:00"],
    saturday: ["10:00"],
    sunday: ["10:00"],
  },
  timezone: "America/New_York",
  enabled: true,
};

const DEFAULT_PROFILE: UserProfile = {
  id: "user-1",
  name: "",
  email: "",
};

const DEMO_PROFILE_EMAIL = "alex@example.com";

/** Clears demo posts, accounts, and the default demo profile from localStorage. */
export function migrateToCleanStore(): void {
  if (typeof window === "undefined") return;

  const version = localStorage.getItem(STORAGE_KEYS.dataVersion);
  if (version === String(DATA_STORE_VERSION)) return;

  removeStorage(STORAGE_KEYS.accounts);
  removeStorage(STORAGE_KEYS.posts);

  const profile = readStorage<UserProfile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  if (profile.email === DEMO_PROFILE_EMAIL && profile.name === "Alex Rivera") {
    removeStorage(STORAGE_KEYS.profile);
  }

  localStorage.setItem(STORAGE_KEYS.dataVersion, String(DATA_STORE_VERSION));
}

export function clearAllAppData(): void {
  removeStorage(STORAGE_KEYS.accounts);
  removeStorage(STORAGE_KEYS.posts);
  removeStorage(STORAGE_KEYS.profile);
  removeStorage(STORAGE_KEYS.schedule);
  removeStorage(STORAGE_KEYS.auth);
  localStorage.setItem(STORAGE_KEYS.dataVersion, String(DATA_STORE_VERSION));
}

export function normalizeAccountHandle(handle: string): string {
  return handle.replace(/^@+/, "").trim().toLowerCase();
}

function dedupeAccounts(accounts: ConnectedAccount[]): ConnectedAccount[] {
  const seen = new Map<string, ConnectedAccount>();
  for (const account of accounts) {
    const key = `${account.platform}:${normalizeAccountHandle(account.handle)}`;
    if (!seen.has(key)) {
      seen.set(key, account);
    }
  }
  return Array.from(seen.values());
}

export function getAccounts(): ConnectedAccount[] {
  const accounts = readStorage<ConnectedAccount[]>(STORAGE_KEYS.accounts, []);
  const deduped = dedupeAccounts(accounts);
  if (deduped.length !== accounts.length) {
    writeStorage(STORAGE_KEYS.accounts, deduped);
  }
  return deduped;
}

export function saveAccounts(accounts: ConnectedAccount[]): void {
  writeStorage(STORAGE_KEYS.accounts, accounts);
}

export function addAccount(account: ConnectedAccount): void {
  upsertAccount(account);
}

/** Add or refresh a connected account without creating duplicates. */
export function upsertAccount(account: ConnectedAccount): void {
  const accounts = getAccounts();
  const handleKey = normalizeAccountHandle(account.handle);
  const existing = accounts.find(
    (a) =>
      a.platform === account.platform &&
      normalizeAccountHandle(a.handle) === handleKey
  );

  if (existing) {
    saveAccounts(
      accounts.map((a) =>
        a.id === existing.id
          ? {
              ...account,
              id: existing.id,
              connectedAt: account.connectedAt || a.connectedAt,
            }
          : a
      )
    );
    return;
  }

  saveAccounts([account, ...accounts]);
}

export function removeAccount(id: string): void {
  saveAccounts(getAccounts().filter((a) => a.id !== id));
}

export function getPosts(): ScheduledPost[] {
  return readStorage<ScheduledPost[]>(STORAGE_KEYS.posts, []);
}

export async function savePosts(posts: ScheduledPost[]): Promise<void> {
  writeStorage(STORAGE_KEYS.posts, await compactPostsForStorage(posts));
}

export async function addPost(post: ScheduledPost): Promise<void> {
  const compact = await compactPostForStorage(post);
  writeStorage(STORAGE_KEYS.posts, [compact, ...getPosts()]);
}

export async function updatePost(id: string, patch: Partial<ScheduledPost>): Promise<void> {
  const posts = getPosts().map((p) => (p.id === id ? { ...p, ...patch } : p));
  await savePosts(posts);
}

export async function deletePost(id: string): Promise<void> {
  const post = getPosts().find((p) => p.id === id);
  await deletePostMedia(post);
  writeStorage(
    STORAGE_KEYS.posts,
    getPosts().filter((p) => p.id !== id)
  );
}

export async function publishPostNow(id: string): Promise<{ ok: boolean; error?: string }> {
  const post = getPosts().find((p) => p.id === id);
  if (!post) return { ok: false, error: "Post not found" };
  if (post.status === "published") return { ok: false, error: "Already published" };
  if (post.status === "publishing") return { ok: false, error: "Already publishing" };

  updatePost(id, { status: "publishing" });

  try {
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", post: getPosts().find((p) => p.id === id) }),
    });
    const now = new Date().toISOString();
    await updatePost(id, {
      status: "published",
      publishedAt: now,
      scheduledAt: now,
    });
    return { ok: true };
  } catch {
    await updatePost(id, { status: "failed" });
    return { ok: false, error: "Publish failed" };
  }
}

export { migrateLegacyPostMedia };

export function getScheduleConfig(): ScheduleConfig {
  return readStorage(STORAGE_KEYS.schedule, DEFAULT_SCHEDULE);
}

export function saveScheduleConfig(config: ScheduleConfig): void {
  writeStorage(STORAGE_KEYS.schedule, config);
}

export function getUserProfile(): UserProfile {
  return readStorage(STORAGE_KEYS.profile, DEFAULT_PROFILE);
}

export function saveUserProfile(profile: UserProfile): void {
  writeStorage(STORAGE_KEYS.profile, profile);
}

export function isAuthenticated(): boolean {
  return readStorage(STORAGE_KEYS.auth, false);
}

export function setAuthenticated(value: boolean): void {
  writeStorage(STORAGE_KEYS.auth, value);
}

export function getDashboardStats(): DashboardStats {
  const posts = getPosts();
  const accounts = getAccounts();
  const platformBreakdown: Record<Platform, number> = {
    youtube: 0,
    tiktok: 0,
    facebook: 0,
  };

  for (const account of accounts) {
    platformBreakdown[account.platform]++;
  }

  return {
    totalPosts: posts.length,
    scheduledPosts: posts.filter((p) => p.status === "scheduled").length,
    publishedPosts: posts.filter((p) => p.status === "published").length,
    draftPosts: posts.filter((p) => p.status === "draft").length,
    connectedAccounts: accounts.length,
    platformBreakdown,
  };
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
