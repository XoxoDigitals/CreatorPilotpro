"use client";

import { readStorage, writeStorage, STORAGE_KEYS } from "../storage";
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
  name: "Alex Rivera",
  email: "alex@example.com",
  company: "Creator Studio",
};

const SEED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: "acc-yt-1",
    platform: "youtube",
    name: "Alex Creates",
    handle: "@alexcreates",
    connectedAt: "2026-06-01T10:00:00Z",
    sandbox: true,
  },
  {
    id: "acc-tt-1",
    platform: "tiktok",
    name: "Alex Creates",
    handle: "@alexcreates",
    connectedAt: "2026-06-02T10:00:00Z",
    sandbox: true,
  },
  {
    id: "acc-fb-1",
    platform: "facebook",
    name: "Alex Creates Page",
    handle: "AlexCreatesOfficial",
    connectedAt: "2026-06-03T10:00:00Z",
    sandbox: true,
  },
];

const SEED_POSTS: ScheduledPost[] = [
  {
    id: "post-1",
    title: "5 Tips for Growing on Short-Form Video",
    description: "Quick tips every creator should know this week.",
    platforms: ["youtube", "tiktok", "facebook"],
    accountIds: ["acc-yt-1", "acc-tt-1", "acc-fb-1"],
    scheduledAt: "2026-07-02T09:00:00Z",
    status: "scheduled",
    mediaType: "video",
    tags: ["creator", "growth", "shorts"],
    createdAt: "2026-06-28T14:00:00Z",
    youtube: {
      title: "5 Tips for Growing on Short-Form Video",
      description: "Quick tips every creator should know this week.\n\n#shorts #creator",
      tags: ["creator", "growth", "shorts", "youtube"],
      category: "Education",
      visibility: "public",
      madeForKids: false,
    },
    tiktok: {
      caption: "5 tips every creator needs this week 🚀",
      hashtags: ["creator", "growth", "fyp"],
      allowComments: true,
      allowDuet: true,
      allowStitch: true,
      privacy: "public_to_everyone",
    },
    facebook: {
      title: "5 Tips for Growing on Short-Form Video",
      message: "Quick tips every creator should know this week.",
      description: "Save this for your next content sprint.",
      callToAction: "WATCH_MORE",
    },
  },
  {
    id: "post-2",
    title: "Behind the Scenes: My Editing Workflow",
    description: "How I edit 10 clips per week without burning out.",
    platforms: ["youtube", "tiktok"],
    accountIds: ["acc-yt-1", "acc-tt-1"],
    scheduledAt: "2026-07-03T18:00:00Z",
    status: "scheduled",
    mediaType: "video",
    tags: ["workflow", "editing"],
    createdAt: "2026-06-29T10:00:00Z",
    youtube: {
      title: "Behind the Scenes: My Editing Workflow",
      description: "How I edit 10 clips per week without burning out.",
      tags: ["workflow", "editing", "shorts"],
      category: "Howto & Style",
      visibility: "public",
      madeForKids: false,
    },
    tiktok: {
      caption: "My editing workflow in 60 seconds ✂️",
      hashtags: ["editing", "workflow", "creatortips"],
      allowComments: true,
      allowDuet: false,
      allowStitch: true,
      privacy: "public_to_everyone",
    },
  },
  {
    id: "post-3",
    title: "Weekly Creator Roundup",
    description: "Top trends and what to post next.",
    platforms: ["facebook"],
    accountIds: ["acc-fb-1"],
    scheduledAt: "2026-06-25T12:00:00Z",
    status: "published",
    mediaType: "video",
    tags: ["trends"],
    createdAt: "2026-06-20T08:00:00Z",
    publishedAt: "2026-06-25T12:00:00Z",
    facebook: {
      title: "Weekly Creator Roundup",
      message: "Top trends and what to post next. What niche are you betting on?",
      description: "Weekly trends for creators.",
      callToAction: "LEARN_MORE",
    },
  },
  {
    id: "post-4",
    title: "Draft: Product Launch Teaser",
    description: "Coming soon announcement for new course.",
    platforms: ["youtube"],
    accountIds: ["acc-yt-1"],
    scheduledAt: "2026-07-10T09:00:00Z",
    status: "draft",
    createdAt: "2026-06-30T16:00:00Z",
    youtube: {
      title: "Product Launch Teaser — Coming Soon",
      description: "Something big is coming for creators. Stay tuned.",
      tags: ["launch", "teaser"],
      category: "People & Blogs",
      visibility: "unlisted",
      madeForKids: false,
    },
  },
];

function seedIfEmpty<T>(key: string, seed: T, read: () => T): T {
  const current = read();
  if (Array.isArray(current) && current.length === 0) {
    writeStorage(key, seed);
    return seed;
  }
  return current;
}

export function getAccounts(): ConnectedAccount[] {
  return seedIfEmpty(
    STORAGE_KEYS.accounts,
    SEED_ACCOUNTS,
    () => readStorage<ConnectedAccount[]>(STORAGE_KEYS.accounts, [])
  );
}

export function saveAccounts(accounts: ConnectedAccount[]): void {
  writeStorage(STORAGE_KEYS.accounts, accounts);
}

export function addAccount(account: ConnectedAccount): void {
  const accounts = getAccounts();
  saveAccounts([...accounts.filter((a) => a.id !== account.id), account]);
}

export function removeAccount(id: string): void {
  saveAccounts(getAccounts().filter((a) => a.id !== id));
}

export function getPosts(): ScheduledPost[] {
  return seedIfEmpty(
    STORAGE_KEYS.posts,
    SEED_POSTS,
    () => readStorage<ScheduledPost[]>(STORAGE_KEYS.posts, [])
  );
}

export function savePosts(posts: ScheduledPost[]): void {
  writeStorage(STORAGE_KEYS.posts, posts);
}

export function addPost(post: ScheduledPost): void {
  savePosts([post, ...getPosts()]);
}

export function updatePost(id: string, patch: Partial<ScheduledPost>): void {
  savePosts(getPosts().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function deletePost(id: string): void {
  savePosts(getPosts().filter((p) => p.id !== id));
}

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
