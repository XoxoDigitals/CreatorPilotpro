import fs from "fs";
import path from "path";
import type { Platform } from "@/lib/types";
import type { StoredPlatformAuth } from "./platform-tokens";

const DATA_DIR = path.join(process.cwd(), ".data");
const TOKEN_PATH = path.join(DATA_DIR, "platform-tokens.json");

type TokenStore = Partial<Record<Platform, StoredPlatformAuth>>;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore(): TokenStore {
  try {
    ensureDataDir();
    if (!fs.existsSync(TOKEN_PATH)) return {};
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")) as TokenStore;
  } catch {
    return {};
  }
}

function writeStore(store: TokenStore): void {
  ensureDataDir();
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function getServerPlatformAuth(
  platform: Platform
): StoredPlatformAuth | null {
  const auth = readStore()[platform];
  return auth?.accessToken ? auth : null;
}

export function saveServerPlatformAuth(
  platform: Platform,
  auth: StoredPlatformAuth
): void {
  const store = readStore();
  store[platform] = auth;
  writeStore(store);
}

export function clearServerPlatformAuth(platform: Platform): void {
  const store = readStore();
  delete store[platform];
  writeStore(store);
}

export function listServerConnectedPlatforms(): Platform[] {
  const store = readStore();
  return (Object.keys(store) as Platform[]).filter(
    (platform) => Boolean(store[platform]?.accessToken)
  );
}
