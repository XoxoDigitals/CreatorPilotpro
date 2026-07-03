"use client";

import { useEffect, useState } from "react";
import { resolveMediaObjectUrl } from "@/lib/media-storage";

export function useMediaObjectUrl(mediaId?: string, legacyUrl?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(
    legacyUrl && !legacyUrl.startsWith("data:") ? legacyUrl : undefined
  );

  useEffect(() => {
    if (legacyUrl?.startsWith("data:") || legacyUrl?.startsWith("blob:")) {
      setUrl(legacyUrl);
      return;
    }

    if (!mediaId) {
      setUrl(undefined);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    resolveMediaObjectUrl(mediaId).then((resolved) => {
      if (cancelled || !resolved) return;
      objectUrl = resolved;
      setUrl(resolved);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId, legacyUrl]);

  return url;
}
