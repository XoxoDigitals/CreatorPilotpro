"use client";

import { useRef, useState } from "react";
import { Film, ImageIcon, Upload, X } from "lucide-react";
import type { MediaType } from "@/lib/types";
import { btnSecondary } from "@/lib/form-styles";
import { generateMediaId, putMedia } from "@/lib/media-storage";

interface MediaUploadProps {
  mediaType?: MediaType;
  mediaId?: string;
  mediaUrl?: string;
  mediaFileName?: string;
  onChange: (data: {
    mediaType?: MediaType;
    mediaId?: string;
    mediaUrl?: string;
    mediaFileName?: string;
  }) => void;
}

/** IndexedDB handles large files; keep a sensible browser upload cap. */
const MAX_MB = 200;

export function MediaUpload({
  mediaType,
  mediaId,
  mediaUrl,
  mediaFileName,
  onChange,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`File is too large. Max ${MAX_MB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const type: MediaType = file.type.startsWith("video/") ? "video" : "image";
      const id = generateMediaId("media");
      await putMedia(id, file);
      onChange({
        mediaType: type,
        mediaId: id,
        mediaUrl: URL.createObjectURL(file),
        mediaFileName: file.name,
      });
    } catch {
      alert("Could not store this file. Try a smaller video or remove old posts.");
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange({
      mediaType: undefined,
      mediaId: undefined,
      mediaUrl: undefined,
      mediaFileName: undefined,
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  const previewUrl = mediaUrl;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {!previewUrl && !mediaId ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 transition hover:border-primary/40 hover:bg-muted/50 disabled:opacity-60"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </span>
          <div className="text-center">
            <p className="text-sm font-semibold">
              {uploading ? "Saving file…" : "Upload video or image"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              MP4, MOV, JPG, PNG — up to {MAX_MB}MB (stored in browser, not localStorage)
            </p>
          </div>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          {previewUrl && mediaType === "video" ? (
            <video src={previewUrl} controls className="aspect-video w-full object-cover" />
          ) : previewUrl ? (
            <img src={previewUrl} alt="Upload preview" className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-muted/30 text-sm text-muted-foreground">
              Loading preview…
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {mediaType === "video" ? (
                <Film className="h-4 w-4 text-primary" />
              ) : (
                <ImageIcon className="h-4 w-4 text-primary" />
              )}
              {mediaFileName ?? "Uploaded file"}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className={btnSecondary}>
                Replace
              </button>
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-destructive hover:bg-destructive/5"
                aria-label="Remove media"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
