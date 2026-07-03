"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Unplug } from "lucide-react";
import {
  generateId,
  getAccounts,
  removeAccount,
  upsertAccount,
  normalizeAccountHandle,
} from "@/lib/stores/app-store";
import {
  fetchCredentialStatus,
  getApiCredentials,
  syncApiCredentialsToServer,
} from "@/lib/stores/api-credentials-store";
import { getPlatformConfigs } from "@/lib/platforms/config";
import { btnPrimary, cardClass } from "@/lib/form-styles";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import type { ConnectedAccount, Platform } from "@/lib/types";

interface ServerConnectedAccount {
  platform: Platform;
  name: string;
  handle: string;
  connectedAt?: string;
}

interface PlatformDiagnostics {
  apiKeysConfigured: boolean;
  profileCookie: boolean;
  tokenInFile: boolean;
  tokenAvailable: boolean;
  name: string | null;
  handle: string | null;
}

interface DiagnosticsPayload {
  timestamp: string;
  platforms: Record<Platform, PlatformDiagnostics>;
  oauthLog: string[];
  helpTextUrl: string;
}

function readUrlOAuthParams(): {
  connected: Platform | null;
  name: string | null;
  handle: string | null;
  sandbox: boolean;
  error: string | null;
  errorDetail: string | null;
} {
  if (typeof window === "undefined") {
    return {
      connected: null,
      name: null,
      handle: null,
      sandbox: true,
      error: null,
      errorDetail: null,
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    connected: params.get("connected") as Platform | null,
    name: params.get("name"),
    handle: params.get("handle"),
    sandbox: params.get("sandbox") !== "false",
    error: params.get("error"),
    errorDetail: params.get("detail"),
  };
}

function formatHandle(handle: string): string {
  const clean = handle.replace(/^@+/, "").trim();
  return clean ? `@${clean}` : handle;
}

const ERROR_MESSAGES: Record<string, string> = {
  tiktok_not_configured:
    "TikTok API keys are missing. Open Setup, paste your Client Key and Secret, click Save API keys, then try Connect again.",
  youtube_not_configured:
    "YouTube API keys are missing. Save your Google Client ID and Secret in Setup first.",
  facebook_not_configured:
    "Facebook API keys are missing. Save your App ID and Secret in Setup first.",
  tiktok_auth_failed:
    "TikTok authorization failed (session expired or redirect URI mismatch). In the TikTok developer portal, add Login Kit and register this redirect URI exactly: https://creatorpilotpro.com/api/auth/tiktok/callback",
  tiktok_token_failed:
    "TikTok could not exchange the auth code for a token. Check that your Client Key/Secret match the app and the redirect URI is registered under Login Kit.",
  tiktok_denied:
    "TikTok login was cancelled or denied. Add your TikTok account as a sandbox test user if the app is still in sandbox mode.",
  tiktok_auth_error:
    "Something went wrong during TikTok login. Try again in a few minutes.",
};

function resolveErrorMessage(error: string, detail: string | null): string {
  const base =
    ERROR_MESSAGES[error] ??
    `Connection failed (${error.replace(/_/g, " ")}). Save API keys in Setup, then try again.`;
  if (detail) {
    try {
      const decoded = decodeURIComponent(detail);
      if (decoded === "state_mismatch") {
        return `${base} (OAuth session cookie was lost — try Connect again in the same browser tab.)`;
      }
      return `${base} Details: ${decoded}`;
    } catch {
      return `${base} Details: ${detail}`;
    }
  }
  return base;
}

function persistConnectedAccount(
  platform: Platform,
  name: string,
  handle: string,
  sandbox: boolean
): void {
  upsertAccount({
    id: generateId(`acc-${platform}`),
    platform,
    name,
    handle,
    connectedAt: new Date().toISOString(),
    sandbox,
  });
}

async function syncAccountsFromServer(): Promise<ConnectedAccount[]> {
  try {
    const res = await fetch("/api/auth/connected-accounts");
    if (!res.ok) return getAccounts();
    const data = (await res.json()) as { accounts?: ServerConnectedAccount[] };
    for (const account of data.accounts ?? []) {
      persistConnectedAccount(account.platform, account.name, account.handle, false);
    }
  } catch {
    /* offline or server unavailable */
  }
  return getAccounts();
}

export default function AccountsClient() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [connecting, setConnecting] = useState<Platform | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsPayload | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const searchParams = useSearchParams();
  const platforms = getPlatformConfigs();
  const urlParams = readUrlOAuthParams();
  const error = searchParams.get("error") ?? urlParams.error;
  const errorDetail = searchParams.get("detail") ?? urlParams.errorDetail;
  const oauthHandled = useRef(false);

  const loadDiagnostics = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/diagnostics");
      if (res.ok) {
        setDiagnostics(await res.json());
      }
    } catch {
      /* ignore */
    }
  }, []);

  const refreshAccounts = useCallback(async () => {
    const next = await syncAccountsFromServer();
    setAccounts(next);
    await loadDiagnostics();
  }, [loadDiagnostics]);

  useEffect(() => {
    const fromWindow = readUrlOAuthParams();
    const connected =
      (searchParams.get("connected") as Platform | null) ?? fromWindow.connected;
    const name = searchParams.get("name") ?? fromWindow.name;
    const handleParam = searchParams.get("handle") ?? fromWindow.handle;
    const sandboxParam = searchParams.get("sandbox");
    const sandbox =
      sandboxParam !== null ? sandboxParam !== "false" : fromWindow.sandbox;

    async function handleOAuthReturn() {
      if (connected && name && !oauthHandled.current) {
        oauthHandled.current = true;
        const handle =
          handleParam?.trim() || `@${normalizeAccountHandle(name)}`;
        persistConnectedAccount(connected, name, handle, sandbox);
        setSuccessMessage(`${name} connected successfully.`);
        window.history.replaceState({}, "", "/dashboard/accounts");
      }

      await refreshAccounts();
    }

    void handleOAuthReturn();
  }, [searchParams, refreshAccounts]);

  async function disconnect(id: string, platform: Platform) {
    removeAccount(id);
    try {
      await fetch("/api/auth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
    } catch {
      /* local disconnect still applies */
    }
    setAccounts(getAccounts());
  }

  async function connectPlatform(platform: Platform, authPath: string) {
    setConnecting(platform);
    setSuccessMessage(null);
    try {
      let status = await fetchCredentialStatus();
      if (!status[platform]) {
        await syncApiCredentialsToServer(getApiCredentials());
        status = await fetchCredentialStatus();
      }
      if (!status[platform]) {
        window.location.href = `/dashboard/settings?connect=${platform}`;
        return;
      }
      window.location.href = authPath;
    } finally {
      setConnecting(null);
    }
  }

  return (
    <>
      <DashboardTopBar
        title="Channels"
        subtitle="Connect YouTube, TikTok, and Facebook"
      />
      <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">

        {successMessage && (
          <p className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {resolveErrorMessage(error, errorDetail)}
            {!error.includes("not_configured") && (
              <>
                {" "}
                <a href="/dashboard/settings" className="font-medium underline">
                  Setup guide
                </a>
              </>
            )}
          </p>
        )}

      <div className="grid gap-4 lg:grid-cols-3">
        {platforms.map((platform) => {
          const connected = accounts.filter((a) => a.platform === platform.id);
          const isConnecting = connecting === platform.id;
          return (
            <section key={platform.id} className={cardClass}>
              <PlatformIcon platform={platform.id} />
              <p className="mt-4 text-xs text-muted-foreground">{platform.sandboxNote}</p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => connectPlatform(platform.id, platform.authPath)}
                  disabled={isConnecting}
                  className={btnPrimary}
                >
                  <ExternalLink className="h-4 w-4" />
                  {isConnecting ? "Preparing..." : "Connect with OAuth"}
                </button>
              </div>
              {connected.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-border pt-4">
                  {connected.map((acc) => (
                    <li
                      key={acc.id}
                      className="flex items-center justify-between rounded-xl border border-border p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {formatHandle(acc.handle)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {acc.name}
                          {acc.sandbox ? " · Sandbox" : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => disconnect(acc.id, acc.platform)}
                        className="shrink-0 text-destructive hover:opacity-80"
                        aria-label="Disconnect"
                      >
                        <Unplug className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <section className={`${cardClass} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Connection diagnostics</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowDiagnostics((v) => !v);
                void loadDiagnostics();
              }}
              className="text-xs font-medium text-primary underline"
            >
              {showDiagnostics ? "Hide" : "Show"} status
            </button>
            <a
              href="/TIKTOK-OAUTH-DEBUG.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary underline"
            >
              Troubleshooting guide (txt)
            </a>
          </div>
        </div>
        {showDiagnostics && (
          <div className="space-y-3 text-xs text-muted-foreground">
            {!diagnostics && <p>Loading diagnostics...</p>}
            {diagnostics && (
              <>
                <p>Checked at: {diagnostics.timestamp}</p>
                {(["tiktok", "youtube", "facebook"] as Platform[]).map((p) => {
                  const d = diagnostics.platforms[p];
                  if (!d) return null;
                  return (
                    <div key={p} className="rounded-lg border border-border p-3">
                      <p className="font-semibold capitalize text-foreground">{p}</p>
                      <ul className="mt-1 space-y-0.5">
                        <li>API keys saved: {d.apiKeysConfigured ? "yes" : "no"}</li>
                        <li>Profile cookie: {d.profileCookie ? "yes" : "no"}</li>
                        <li>Token on server: {d.tokenInFile ? "yes" : "no"}</li>
                        <li>Ready to publish: {d.tokenAvailable ? "yes" : "no"}</li>
                        {d.handle && <li>Handle: {d.handle}</li>}
                      </ul>
                    </div>
                  );
                })}
                {diagnostics.oauthLog.length > 0 && (
                  <div>
                    <p className="mb-1 font-medium text-foreground">Recent OAuth log</p>
                    <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-2 text-[10px] leading-relaxed">
                      {diagnostics.oauthLog.join("\n")}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
      </div>
    </>
  );
}
