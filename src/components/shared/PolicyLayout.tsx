import type { ReactNode } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

interface PolicyLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
}

export function PolicyLayout({
  title,
  description,
  lastUpdated,
  children,
}: PolicyLayoutProps) {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        <header>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>
        <article className="prose-policy space-y-6 text-sm leading-relaxed text-foreground">
          {children}
        </article>
      </main>
      <MarketingFooter />
    </>
  );
}
