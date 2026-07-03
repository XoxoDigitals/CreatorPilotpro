"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileVideo,
  Link2,
  BarChart3,
  Settings,
  Rocket,
  LogOut,
  X,
} from "lucide-react";
import { APP_NAME, DASHBOARD_NAV } from "@/lib/constants";
import { btnGhost } from "@/lib/form-styles";
import { isAuthenticated, setAuthenticated } from "@/lib/stores/app-store";
import { useEffect } from "react";

const iconMap = {
  LayoutDashboard,
  Calendar,
  FileVideo,
  Link2,
  BarChart3,
  Settings,
};

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ mobileOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  function signOut() {
    setAuthenticated(false);
    router.push("/");
  }

  const panel = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">{APP_NAME}</p>
            <p className="text-[10px] text-muted-foreground">Creator dashboard</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {DASHBOARD_NAV.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[11px] opacity-70">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button type="button" onClick={signOut} className={`${btnGhost} w-full justify-start`}>
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {panel}
      </aside>
    </>
  );
}
