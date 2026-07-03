import type { Platform } from "./types";

export interface SetupStep {
  title: string;
  body: string;
  link?: { label: string; href: string };
}

export interface PlatformSetupGuide {
  platform: Platform;
  title: string;
  intro: string;
  redirectUri: string;
  steps: SetupStep[];
  envKeys: { label: string; key: string }[];
}

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const API_SETUP_GUIDES: PlatformSetupGuide[] = [
  {
    platform: "youtube",
    title: "YouTube / Google Cloud setup",
    intro:
      "Create a Google Cloud project, enable YouTube Data API v3, and configure OAuth consent for upload access.",
    redirectUri: `${base}/api/auth/youtube/callback`,
    envKeys: [
      { label: "Client ID", key: "GOOGLE_CLIENT_ID" },
      { label: "Client Secret", key: "GOOGLE_CLIENT_SECRET" },
    ],
    steps: [
      {
        title: "Create a Google Cloud project",
        body: "Go to Google Cloud Console and create a new project (or select an existing one).",
        link: {
          label: "Open Google Cloud Console",
          href: "https://console.cloud.google.com/projectcreate",
        },
      },
      {
        title: "Enable YouTube Data API v3",
        body: "In APIs & Services → Library, search for “YouTube Data API v3” and click Enable.",
        link: {
          label: "YouTube Data API v3",
          href: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
        },
      },
      {
        title: "Configure OAuth consent screen",
        body: "Set app name, support email, and add scopes: youtube.upload and youtube.readonly. Add your Google account as a test user while in Testing mode.",
        link: {
          label: "OAuth consent screen",
          href: "https://console.cloud.google.com/apis/credentials/consent",
        },
      },
      {
        title: "Create OAuth 2.0 credentials",
        body: "Create credentials → OAuth client ID → Web application. Add the redirect URI shown below.",
        link: {
          label: "Create credentials",
          href: "https://console.cloud.google.com/apis/credentials",
        },
      },
      {
        title: "Paste keys in Settings",
        body: "Copy the Client ID and Client Secret into Settings → API keys, then connect your channel on the Channels page.",
      },
    ],
  },
  {
    platform: "tiktok",
    title: "TikTok Developer setup",
    intro:
      "Register a TikTok developer app with Content Posting API access. Use sandbox mode first, then apply for production scopes.",
    redirectUri: `${base}/api/auth/tiktok/callback`,
    envKeys: [
      { label: "Client Key", key: "TIKTOK_CLIENT_KEY" },
      { label: "Client Secret", key: "TIKTOK_CLIENT_SECRET" },
    ],
    steps: [
      {
        title: "Join TikTok for Developers",
        body: "Sign in with your TikTok account and accept the developer terms.",
        link: {
          label: "TikTok Developers portal",
          href: "https://developers.tiktok.com/",
        },
      },
      {
        title: "Create an app",
        body: "Click Manage apps → Create app. Choose a name and category that matches content publishing.",
        link: {
          label: "Manage apps",
          href: "https://developers.tiktok.com/apps/",
        },
      },
      {
        title: "Add Content Posting API product",
        body: "In your app, add the Content Posting API. Request scopes: user.info.basic, video.upload, and video.publish.",
        link: {
          label: "Content Posting API docs",
          href: "https://developers.tiktok.com/doc/content-posting-api-get-started",
        },
      },
      {
        title: "Set redirect URI",
        body: "Under Login Kit / OAuth settings, add the redirect URI shown below exactly as written.",
      },
      {
        title: "Use sandbox for testing",
        body: "Sandbox lets you test posting without app review. Add sandbox test users in the developer portal, then paste Client Key and Secret in Settings.",
      },
      {
        title: "Paste keys in Settings",
        body: "Save your Client Key and Client Secret in Settings → API keys, then connect TikTok on the Channels page.",
      },
    ],
  },
  {
    platform: "facebook",
    title: "Meta / Facebook App setup",
    intro:
      "Create a Meta developer app with Facebook Login and Pages permissions for scheduling posts to your Facebook Page.",
    redirectUri: `${base}/api/auth/facebook/callback`,
    envKeys: [
      { label: "App ID", key: "FACEBOOK_APP_ID" },
      { label: "App Secret", key: "FACEBOOK_APP_SECRET" },
    ],
    steps: [
      {
        title: "Create a Meta developer account",
        body: "Register at Meta for Developers and verify your account if prompted.",
        link: {
          label: "Meta for Developers",
          href: "https://developers.facebook.com/",
        },
      },
      {
        title: "Create a new app",
        body: "Choose app type “Business” or “Other”. Add Facebook Login and Pages products to your app.",
        link: {
          label: "Create app",
          href: "https://developers.facebook.com/apps/creation/",
        },
      },
      {
        title: "Configure Facebook Login",
        body: "Under Facebook Login → Settings, add the OAuth redirect URI shown below. Enable both localhost and your production domain.",
        link: {
          label: "Facebook Login settings",
          href: "https://developers.facebook.com/docs/facebook-login/web",
        },
      },
      {
        title: "Request Page permissions",
        body: "Your app needs pages_manage_posts, pages_read_engagement, pages_show_list, and publish_video for video scheduling.",
      },
      {
        title: "Add data deletion callback",
        body: "In App Settings → Advanced, set Data Deletion Callback URL to your app's /api/facebook/data-deletion endpoint (required for app review).",
      },
      {
        title: "Paste keys in Settings",
        body: "Copy App ID and App Secret from Settings → Basic into Settings → API keys, then connect your Page on Channels.",
      },
    ],
  },
];

export function getGuideForPlatform(platform: Platform): PlatformSetupGuide {
  return API_SETUP_GUIDES.find((g) => g.platform === platform)!;
}
