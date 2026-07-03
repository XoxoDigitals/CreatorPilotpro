"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { getUserProfile } from "@/lib/stores/app-store";
import { btnPrimary } from "@/lib/form-styles";
import { useDashboardLayout } from "@/components/layout/DashboardShell";

interface DashboardTopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showCreate?: boolean;
}

export function DashboardTopBar({
  title,
  subtitle,
  onMenuClick,
  showCreate = false,
}: DashboardTopBarProps) {
  const profile = getUserProfile();
  const { openMenu } = useDashboardLayout();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick ?? openMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showCreate && (
            <Link href="/dashboard/posts?create=1" className={btnPrimary}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New post</span>
            </Link>
          )}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{profile.name || "Your account"}</p>
            {profile.email && (
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            )}
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
          </span>
        </div>
      </div>
    </header>
  );
}
