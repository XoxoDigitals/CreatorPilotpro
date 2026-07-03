"use client";

import { useRef } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { btnSecondary } from "@/lib/form-styles";

interface ThumbnailUploadProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
}

export function ThumbnailUpload({ label, value, onChange }: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Thumbnail" className="h-24 w-40 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
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
          className="flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground hover:border-primary/40"
        >
          <ImageIcon className="h-4 w-4 text-primary" />
          Upload
        </button>
      )}
      <button type="button" onClick={() => inputRef.current?.click()} className={`${btnSecondary} mt-2`}>
        <Upload className="h-4 w-4" />
        {value ? "Change thumbnail" : "Add thumbnail"}
      </button>
    </div>
  );
}
