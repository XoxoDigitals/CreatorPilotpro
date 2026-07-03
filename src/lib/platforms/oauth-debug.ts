import fs from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), ".data", "oauth-debug.log");

function ensureDataDir(): void {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function appendOAuthLog(message: string): void {
  try {
    ensureDataDir();
    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(LOG_PATH, line, "utf8");
  } catch {
    /* ignore logging failures */
  }
}

export function readOAuthLogTail(maxLines = 40): string[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(LOG_PATH)) return [];
    const content = fs.readFileSync(LOG_PATH, "utf8");
    return content.trim().split("\n").slice(-maxLines);
  } catch {
    return [];
  }
}

export function getOAuthLogPath(): string {
  return LOG_PATH;
}
