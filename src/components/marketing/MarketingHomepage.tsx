import Link from "next/link";
import {
  Calendar,
  BarChart3,
  Link2,
  Shield,
  Youtube,
  Facebook,
  Music2,
} from "lucide-react";
import { btnPrimary, btnSecondary, cardClass } from "@/lib/form-styles";

const features = [
  {
    icon: Calendar,
    title: "Smart scheduling",
    description:
      "Set fixed daily times or a weekly grid. Queue posts across YouTube, TikTok, and Facebook.",
  },
  {
    icon: Link2,
    title: "Multi-platform accounts",
    description:
      "Connect sandbox or production apps. Manage all destination accounts from one place.",
  },
  {
    icon: BarChart3,
    title: "Publishing analytics",
    description:
      "Track scheduled, published, and failed posts. See platform breakdown at a glance.",
  },
  {
    icon: Shield,
    title: "Policy compliant",
    description:
      "Built with Google, Meta, and TikTok developer policies in mind. Full legal pages included.",
  },
];

export function MarketingHomepage() {
  return (
    <div className="space-y-20 py-16">
      <section className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Content scheduling for creators
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Schedule once. Publish everywhere.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
          Creator Pilot Pro helps you plan, queue, and publish short-form and
          long-form content to YouTube, TikTok, and Facebook — with sandbox-ready
          integrations you can activate when your API keys are ready.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className={btnPrimary}>
            Start scheduling free
          </Link>
          <Link href="/about" className={btnSecondary}>
            Learn more
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Youtube className="h-4 w-4 text-primary" /> YouTube
          </span>
          <span className="inline-flex items-center gap-2">
            <Music2 className="h-4 w-4 text-primary" /> TikTok
          </span>
          <span className="inline-flex items-center gap-2">
            <Facebook className="h-4 w-4 text-primary" /> Facebook
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <h2 className="text-xl font-semibold">Everything you need to stay consistent</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className={cardClass}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className={`${cardClass} text-center`}>
          <h2 className="text-xl font-semibold">Ready to pilot your content?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Connect your sandbox apps today. Add production API keys when you
            are ready — no code changes required.
          </p>
          <Link href="/signup" className={`${btnPrimary} mt-6`}>
            Create your account
          </Link>
        </div>
      </section>
    </div>
  );
}
