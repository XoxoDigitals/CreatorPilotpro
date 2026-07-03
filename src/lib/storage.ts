"use client";

const isBrowser = typeof window !== "undefined";

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22)
    ) {
      throw new Error(
        "Storage is full. Large media files are saved separately — try refreshing the page or removing old posts."
      );
    }
    throw error;
  }
}

export function removeStorage(key: string): void {
  if (!isBrowser) return;
  localStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  accounts: "creator-pilot-accounts",
  posts: "creator-pilot-posts",
  schedule: "creator-pilot-schedule",
  profile: "creator-pilot-profile",
  auth: "creator-pilot-auth",
  apiCredentials: "creator-pilot-api-credentials",
  dataVersion: "creator-pilot-data-version",
} as const;

/** Bump when demo/seed data should be cleared for all users. */
export const DATA_STORE_VERSION = 2;
