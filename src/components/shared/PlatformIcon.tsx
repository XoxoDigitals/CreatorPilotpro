import type { Platform } from "@/lib/types";
import { Youtube, Facebook, Music2 } from "lucide-react";
import { PLATFORM_LABELS } from "@/lib/constants";

const icons = {
  youtube: Youtube,
  tiktok: Music2,
  facebook: Facebook,
};

interface PlatformIconProps {
  platform: Platform;
  className?: string;
}

export function PlatformIcon({ platform, className = "h-4 w-4" }: PlatformIconProps) {
  const Icon = icons[platform];
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className={`${className} text-primary`} />
      <span className="text-xs font-medium">{PLATFORM_LABELS[platform]}</span>
    </span>
  );
}
