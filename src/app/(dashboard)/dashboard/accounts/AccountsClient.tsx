"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Unplug } from "lucide-react";
import {
  addAccount,
  generateId,
  getAccounts,
  removeAccount,
} from "@/lib/stores/app-store";
import { getPlatformConfigs } from "@/lib/platforms/config";
import { btnPrimary, btnSecondary, cardClass } from "@/lib/form-styles";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import type { ConnectedAccount, Platform } from "@/lib/types";

export default function AccountsClient() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const searchParams = useSearchParams();
  const platforms = getPlatformConfigs();
  const error = searchParams.get("error");

  useEffect(() => {
    const connected = searchParams.get("connected") as Platform | null;
    const name = searchParams.get("name");
    const sandbox = searchParams.get("sandbox") !== "false";

    if (connected && name) {
      addAccount({
        id: generateId(`acc-${connected}`),
        platform: connected,
        name,
        handle: name.replace(/\s+/g, "").toLowerCase(),
        connectedAt: new Date().toISOString(),
        sandbox,
      });
      window.history.replaceState({}, "", "/dashboard/accounts");
    }

    setAccounts(getAccounts());
  }, [searchParams]);

  function refresh() {
    setAccounts(getAccounts());
  }

  function connectSandbox(platform: ConnectedAccount["platform"]) {
    const demo: ConnectedAccount = {
      id: generateId(`acc-${platform}`),
      platform,
      name: `Sandbox ${platform}`,
      handle: `@sandbox_${platform}`,
      connectedAt: new Date().toISOString(),
      sandbox: true,
    };
    addAccount(demo);
    refresh();
  }

  function disconnect(id: string) {
    removeAccount(id);
    refresh();
  }

  return (
    <>
      <DashboardTopBar
        title="Channels"
        subtitle="Connect YouTube, TikTok, and Facebook"
      />
      <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Connection failed: {error.replace(/_/g, " ")}. Paste API keys in{" "}
            <a href="/dashboard/settings" className="font-medium underline">
              Setup
            </a>{" "}
            or use sandbox demo.
          </p>
        )}

      <div className="grid gap-4 lg:grid-cols-3">
        {platforms.map((platform) => {
          const connected = accounts.filter((a) => a.platform === platform.id);
          return (
            <section key={platform.id} className={cardClass}>
              <PlatformIcon platform={platform.id} />
              <p className="mt-4 text-xs text-muted-foreground">{platform.sandboxNote}</p>
              <div className="mt-4 flex flex-col gap-2">
                <a href={platform.authPath} className={btnPrimary}>
                  <ExternalLink className="h-4 w-4" />
                  Connect with OAuth
                </a>
                <button
                  type="button"
                  onClick={() => connectSandbox(platform.id)}
                  className={btnSecondary}
                >
                  Add sandbox demo
                </button>
              </div>
              {connected.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-border pt-4">
                  {connected.map((acc) => (
                    <li
                      key={acc.id}
                      className="flex items-center justify-between rounded-xl border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {acc.handle} {acc.sandbox && "· Sandbox"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => disconnect(acc.id)}
                        className="text-destructive hover:opacity-80"
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
      </div>
    </>
  );
}
