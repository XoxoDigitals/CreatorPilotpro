import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Creator Pilot Pro uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <PolicyLayout
      title="Cookie Policy"
      description="We use cookies to keep you signed in and improve the product."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">Essential cookies</h2>
        <p className="mt-2 text-muted-foreground">
          Required for authentication, session management, and security. These
          cannot be disabled while using the dashboard.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Functional storage</h2>
        <p className="mt-2 text-muted-foreground">
          We use browser localStorage to persist your scheduled posts, connected
          accounts, and preferences locally in demo mode. In production, critical
          data is stored on our servers.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Analytics</h2>
        <p className="mt-2 text-muted-foreground">
          We may use privacy-respecting analytics to understand feature usage.
          No advertising cookies are used.
        </p>
      </section>
    </PolicyLayout>
  );
}
