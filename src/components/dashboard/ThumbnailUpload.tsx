"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { btnSecondary } from "@/lib/form-styles";
import { generateMediaId, putMedia } from "@/lib/media-storage";

interface ThumbnailUploadProps {
  label: string;
  value?: string;
  mediaId?: string;
  onChange: (data: { url?: string; mediaId?: string }) => void;
}

const MAX_MB = 5;

export function ThumbnailUpload({ label, value, mediaId, onChange }: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Thumbnail is too large. Max ${MAX_MB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const id = generateMediaId("thumb");
      await putMedia(id, file);
      onChange({ url: URL.createObjectURL(file), mediaId: id });
    } catch {
      alert("Could not save thumbnail.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Thumbnail" className="h-24 w-40 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => onChange({ url: undefined, mediaId: undefined })}
            className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-destructive shadow-sm"
            aria-label="Remove thumbnail"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground hover:border-primary/40 disabled:opacity-60"
        >
          <ImageIcon className="h-4 w-4 text-primary" />
          {uploading ? "Saving…" : "Upload"}
        </button>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`${btnSecondary} mt-2`}
      >
        <Upload className="h-4 w-4" />
        {value ? "Change thumbnail" : "Add thumbnail"}
      </button>
      {mediaId && !value && (
        <p className="mt-1 text-xs text-muted-foreground">Thumbnail saved</p>
      )}
    </div>
  );
}
