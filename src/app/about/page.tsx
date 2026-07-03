import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { cardClass } from "@/lib/form-styles";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${APP_NAME} — cross-platform content scheduling for creators.`,
};

export default function AboutPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">About {APP_NAME}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            We built Creator Pilot Pro for creators who publish on multiple
            platforms and need a single place to schedule, track, and manage
            their content pipeline.
          </p>
        </header>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold">Our mission</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Consistency drives growth. Creator Pilot Pro removes the friction of
            logging into three separate apps to queue the same clip. Plan your
            week once, publish everywhere, and focus on creating.
          </p>
        </section>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold">Platform integrations</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We integrate with official sandbox and production APIs from Google
            (YouTube), Meta (Facebook Pages), and TikTok (Content Posting API).
            Add your developer credentials when ready — the app works in demo
            mode until then.
          </p>
        </section>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold">Compliance first</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Every integration follows platform developer policies. We provide
            transparent privacy, data deletion, and acceptable use documentation
            aligned with Google, Meta, and TikTok requirements.
          </p>
          <Link
            href="/privacy"
            className="mt-4 inline-block text-sm font-medium text-primary hover:opacity-90"
          >
            Read our policies →
          </Link>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
