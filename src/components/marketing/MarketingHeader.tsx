import Link from "next/link";
import { Rocket } from "lucide-react";
import { APP_NAME, MARKETING_NAV } from "@/lib/constants";
import { btnPrimary, btnGhost } from "@/lib/form-styles";

export function MarketingHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" />
          </span>
          {APP_NAME}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={btnGhost}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={btnGhost}>
            Log in
          </Link>
          <Link href="/signup" className={btnPrimary}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
