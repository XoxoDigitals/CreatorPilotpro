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
  localStorage.setItem(key, JSON.stringify(value));
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
} as const;
