"use client";

import { useRef } from "react";
import { Film, ImageIcon, Upload, X } from "lucide-react";
import type { MediaType } from "@/lib/types";
import { btnSecondary } from "@/lib/form-styles";

interface MediaUploadProps {
  mediaType?: MediaType;
  mediaUrl?: string;
  mediaFileName?: string;
  onChange: (data: {
    mediaType?: MediaType;
    mediaUrl?: string;
    mediaFileName?: string;
  }) => void;
}

const MAX_MB = 50;

export function MediaUpload({ mediaType, mediaUrl, mediaFileName, onChange }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`File is too large. Max ${MAX_MB}MB for demo storage.`);
      return;
    }

    const type: MediaType = file.type.startsWith("video/") ? "video" : "image";
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        mediaType: type,
        mediaUrl: reader.result as string,
        mediaFileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  function clear() {
    onChange({ mediaType: undefined, mediaUrl: undefined, mediaFileName: undefined });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {!mediaUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 transition hover:border-primary/40 hover:bg-muted/50"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </span>
          <div className="text-center">
            <p className="text-sm font-semibold">Upload video or image</p>
            <p className="mt-1 text-xs text-muted-foreground">
              MP4, MOV, JPG, PNG — up to {MAX_MB}MB
            </p>
          </div>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          {mediaType === "video" ? (
            <video src={mediaUrl} controls className="aspect-video w-full object-cover" />
          ) : (
            <img src={mediaUrl} alt="Upload preview" className="aspect-video w-full object-cover" />
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
