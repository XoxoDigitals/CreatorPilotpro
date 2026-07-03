import Link from "next/link";
import { APP_NAME, MARKETING_NAV, POLICY_NAV } from "@/lib/constants";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold">{APP_NAME}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Schedule and publish content to YouTube, TikTok, and Facebook from
              one dashboard. Built for creators who need reliable cross-platform
              publishing.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="mt-3 space-y-2">
              {MARKETING_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Legal &amp; policies
            </p>
            <ul className="mt-3 space-y-2">
              {POLICY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. We are not affiliated with
          Google, Meta, or TikTok. Platform APIs are used in accordance with
          their developer terms.
        </p>
      </div>
    </footer>
  );
}
