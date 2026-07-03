export type Platform = "youtube" | "tiktok" | "facebook";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

export type ScheduleMode = "fixed" | "weekly";

export type MediaType = "video" | "image";

export interface YouTubePostContent {
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string;
  thumbnailMediaId?: string;
  category: string;
  visibility: "public" | "unlisted" | "private";
  madeForKids: boolean;
}

export interface TikTokPostContent {
  caption: string;
  hashtags: string[];
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  privacy: "public_to_everyone" | "mutual_follow_friends" | "self_only";
}

export interface FacebookPostContent {
  title: string;
  message: string;
  description: string;
  thumbnailUrl?: string;
  thumbnailMediaId?: string;
  callToAction: "NONE" | "LEARN_MORE" | "SHOP_NOW" | "SIGN_UP" | "WATCH_MORE";
}

export interface ConnectedAccount {
  id: string;
  platform: Platform;
  name: string;
  handle: string;
  avatarUrl?: string;
  connectedAt: string;
  sandbox: boolean;
}

export interface ScheduledPost {
  id: string;
  title: string;
  description: string;
  platforms: Platform[];
  accountIds: string[];
  scheduledAt: string;
  status: PostStatus;
  mediaType?: MediaType;
  mediaId?: string;
  mediaUrl?: string;
  mediaFileName?: string;
  tags?: string[];
  youtube?: YouTubePostContent;
  tiktok?: TikTokPostContent;
  facebook?: FacebookPostContent;
  createdAt: string;
  publishedAt?: string;
  errorMessage?: string;
}

export interface ScheduleConfig {
  mode: ScheduleMode;
  postsPerDay: number;
  postTimes: string[];
  weeklySchedule: Record<string, string[]>;
  timezone: string;
  enabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
}

export interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  draftPosts: number;
  connectedAccounts: number;
  platformBreakdown: Record<Platform, number>;
}

export interface PlatformAnalytics {
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  postsPublished: number;
  postsScheduled: number;
  postsFailed: number;
  viewsChangePct: number;
}

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];
