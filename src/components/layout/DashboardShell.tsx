"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { migrateToCleanStore } from "@/lib/stores/app-store";

interface DashboardLayoutContextValue {
  openMenu: () => void;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextValue>({
  openMenu: () => {},
});

export function useDashboardLayout() {
  return useContext(DashboardLayoutContext);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    migrateToCleanStore();
  }, []);

  return (
    <DashboardLayoutContext.Provider value={{ openMenu: () => setMobileOpen(true) }}>
      <div className="min-h-screen bg-[var(--surface)]">
        <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="lg:pl-72">{children}</div>
      </div>
    </DashboardLayoutContext.Provider>
  );
}
