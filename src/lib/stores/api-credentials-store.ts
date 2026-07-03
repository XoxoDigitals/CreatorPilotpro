"use client";

import { readStorage, writeStorage, STORAGE_KEYS } from "../storage";

export interface StoredApiCredentials {
  googleClientId: string;
  googleClientSecret: string;
  tiktokClientKey: string;
  tiktokClientSecret: string;
  facebookAppId: string;
  facebookAppSecret: string;
}

export const EMPTY_API_CREDENTIALS: StoredApiCredentials = {
  googleClientId: "",
  googleClientSecret: "",
  tiktokClientKey: "",
  tiktokClientSecret: "",
  facebookAppId: "",
  facebookAppSecret: "",
};

export function getApiCredentials(): StoredApiCredentials {
  return readStorage(STORAGE_KEYS.apiCredentials, EMPTY_API_CREDENTIALS);
}

export function saveApiCredentials(credentials: StoredApiCredentials): void {
  writeStorage(STORAGE_KEYS.apiCredentials, credentials);
}

export function clearApiCredentials(): void {
  writeStorage(STORAGE_KEYS.apiCredentials, EMPTY_API_CREDENTIALS);
}

export async function syncApiCredentialsToServer(
  credentials: StoredApiCredentials
): Promise<{ ok: boolean; configured: Record<string, boolean> }> {
  const res = await fetch("/api/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Failed to save credentials");
  return res.json();
}

export async function fetchCredentialStatus(): Promise<Record<string, boolean>> {
  const res = await fetch("/api/credentials");
  if (!res.ok) return { youtube: false, tiktok: false, facebook: false };
  const data = await res.json();
  return data.configured ?? {};
}

export async function clearApiCredentialsOnServer(): Promise<void> {
  await fetch("/api/credentials", { method: "DELETE" });
}
