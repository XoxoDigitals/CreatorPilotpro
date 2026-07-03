"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { getUserProfile, saveUserProfile } from "@/lib/stores/app-store";
import {
  clearApiCredentials,
  clearApiCredentialsOnServer,
  fetchCredentialStatus,
  getApiCredentials,
  saveApiCredentials,
  syncApiCredentialsToServer,
  type StoredApiCredentials,
} from "@/lib/stores/api-credentials-store";
import { API_SETUP_GUIDES } from "@/lib/api-setup-guides";
import { ApiSetupGuide } from "@/components/dashboard/ApiSetupGuide";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { cardClass, inputClass, labelClass, btnPrimary, btnSecondary } from "@/lib/form-styles";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import type { Platform } from "@/lib/types";

function StatusBadge({ configured }: { configured: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        configured
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {configured ? "Configured" : "Not set"}
    </span>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = useState(getUserProfile());
  const [profileSaved, setProfileSaved] = useState(false);
  const [credentials, setCredentials] = useState<StoredApiCredentials>(getApiCredentials());
  const [keysSaved, setKeysSaved] = useState(false);
  const [keysError, setKeysError] = useState("");
  const [savingKeys, setSavingKeys] = useState(false);
  const [configured, setConfigured] = useState<Record<Platform, boolean>>({
    youtube: false,
    tiktok: false,
    facebook: false,
  });
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    fetchCredentialStatus().then(async (status) => {
      const next = {
        youtube: Boolean(status.youtube),
        tiktok: Boolean(status.tiktok),
        facebook: Boolean(status.facebook),
      };
      setConfigured(next);

      const stored = getApiCredentials();
      const hasStored = Object.values(stored).some((v) => v.trim());
      const hasServer = Object.values(next).some(Boolean);
      if (hasStored && !hasServer) {
        try {
          const result = await syncApiCredentialsToServer(stored);
          setConfigured({
            youtube: Boolean(result.configured.youtube),
            tiktok: Boolean(result.configured.tiktok),
            facebook: Boolean(result.configured.facebook),
          });
        } catch {
          /* ignore sync failure on load */
        }
      }
    });
  }, []);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    saveUserProfile(profile);
    setProfileSaved(true);
  }

  async function handleKeysSave(e: React.FormEvent) {
    e.preventDefault();
    setKeysError("");
    setSavingKeys(true);
    try {
      saveApiCredentials(credentials);
      const result = await syncApiCredentialsToServer(credentials);
      setConfigured({
        youtube: Boolean(result.configured.youtube),
        tiktok: Boolean(result.configured.tiktok),
        facebook: Boolean(result.configured.facebook),
      });
      setKeysSaved(true);
    } catch {
      setKeysError("Could not save API keys. Please try again.");
    } finally {
      setSavingKeys(false);
    }
  }

  async function handleClearKeys() {
    clearApiCredentials();
    setCredentials(getApiCredentials());
    await clearApiCredentialsOnServer();
    setConfigured({ youtube: false, tiktok: false, facebook: false });
    setKeysSaved(false);
  }

  function updateCredential<K extends keyof StoredApiCredentials>(
    key: K,
    value: StoredApiCredentials[K]
  ) {
    setCredentials((prev) => ({ ...prev, [key]: value }));
    setKeysSaved(false);
  }

  const secretInputType = showSecrets ? "text" : "password";

  return (
    <>
      <DashboardTopBar
        title="Setup"
        subtitle="API keys, setup guides, and your profile"
      />
      <div className="mx-auto max-w-3xl space-y-8 p-4 lg:p-8">

      <form onSubmit={handleProfileSave} className={`${cardClass} space-y-4`}>
        <h2 className="text-sm font-semibold">Profile</h2>
        <div>
          <label htmlFor="name" className={labelClass}>Name</label>
          <input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="company" className={labelClass}>Company (optional)</label>
          <input
            id="company"
            value={profile.company ?? ""}
            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            className={inputClass}
          />
        </div>
        <button type="submit" className={btnPrimary}>Save profile</button>
        {profileSaved && (
          <p className="text-sm text-[var(--color-success)]">Profile saved.</p>
        )}
      </form>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">How to get API keys</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow the step-by-step guide for each platform, then paste your keys below.
          </p>
        </div>
        {API_SETUP_GUIDES.map((guide) => (
          <ApiSetupGuide key={guide.platform} guide={guide} />
        ))}
      </section>

      <form onSubmit={handleKeysSave} className={`${cardClass} space-y-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">API keys</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste your sandbox or production keys here. They are stored in your
              browser and synced securely for OAuth — no server restart needed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSecrets(!showSecrets)}
            className={btnSecondary}
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSecrets ? "Hide secrets" : "Show secrets"}
          </button>
        </div>

        <section className="space-y-4 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <PlatformIcon platform="youtube" />
            <StatusBadge configured={configured.youtube} />
          </div>
          <div>
            <label htmlFor="googleClientId" className={labelClass}>Google Client ID</label>
            <input
              id="googleClientId"
              type="text"
              value={credentials.googleClientId}
              onChange={(e) => updateCredential("googleClientId", e.target.value)}
              className={inputClass}
              placeholder="123456789.apps.googleusercontent.com"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="googleClientSecret" className={labelClass}>Google Client Secret</label>
            <input
              id="googleClientSecret"
              type={secretInputType}
              value={credentials.googleClientSecret}
              onChange={(e) => updateCredential("googleClientSecret", e.target.value)}
              className={inputClass}
              placeholder="GOCSPX-..."
              autoComplete="off"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <PlatformIcon platform="tiktok" />
            <StatusBadge configured={configured.tiktok} />
          </div>
          <div>
            <label htmlFor="tiktokClientKey" className={labelClass}>TikTok Client Key</label>
            <input
              id="tiktokClientKey"
              type="text"
              value={credentials.tiktokClientKey}
              onChange={(e) => updateCredential("tiktokClientKey", e.target.value)}
              className={inputClass}
              placeholder="aw..."
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="tiktokClientSecret" className={labelClass}>TikTok Client Secret</label>
            <input
              id="tiktokClientSecret"
              type={secretInputType}
              value={credentials.tiktokClientSecret}
              onChange={(e) => updateCredential("tiktokClientSecret", e.target.value)}
              className={inputClass}
              placeholder="..."
              autoComplete="off"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <PlatformIcon platform="facebook" />
            <StatusBadge configured={configured.facebook} />
          </div>
          <div>
            <label htmlFor="facebookAppId" className={labelClass}>Facebook App ID</label>
            <input
              id="facebookAppId"
              type="text"
              value={credentials.facebookAppId}
              onChange={(e) => updateCredential("facebookAppId", e.target.value)}
              className={inputClass}
              placeholder="123456789012345"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="facebookAppSecret" className={labelClass}>Facebook App Secret</label>
            <input
              id="facebookAppSecret"
              type={secretInputType}
              value={credentials.facebookAppSecret}
              onChange={(e) => updateCredential("facebookAppSecret", e.target.value)}
              className={inputClass}
              placeholder="..."
              autoComplete="off"
            />
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          OAuth redirect URIs:{" "}
          <code className="rounded bg-muted px-1">/api/auth/youtube/callback</code>,{" "}
          <code className="rounded bg-muted px-1">/api/auth/tiktok/callback</code>,{" "}
          <code className="rounded bg-muted px-1">/api/auth/facebook/callback</code>
        </p>

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={savingKeys} className={btnPrimary}>
            {savingKeys ? "Saving..." : "Save API keys"}
          </button>
          <button type="button" onClick={handleClearKeys} className={btnSecondary}>
            Clear all keys
          </button>
        </div>

        {keysSaved && (
          <p className="flex items-center gap-2 text-sm text-[var(--color-success)]">
            <CheckCircle2 className="h-4 w-4" />
            API keys saved. You can now connect accounts via OAuth.
          </p>
        )}
        {keysError && (
          <p className="text-sm text-destructive">{keysError}</p>
        )}
      </form>

      <section className={`${cardClass} space-y-2`}>
        <h2 className="text-sm font-semibold">Legal</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/privacy" className="text-primary hover:opacity-90">Privacy</Link>
          <Link href="/terms" className="text-primary hover:opacity-90">Terms</Link>
          <Link href="/data-deletion" className="text-primary hover:opacity-90">Data deletion</Link>
          <Link href="/policies/youtube" className="text-primary hover:opacity-90">YouTube</Link>
          <Link href="/policies/facebook" className="text-primary hover:opacity-90">Facebook</Link>
          <Link href="/policies/tiktok" className="text-primary hover:opacity-90">TikTok</Link>
        </div>
      </section>
      </div>
    </>
  );
}
