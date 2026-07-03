import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { btnPrimary, cardClass } from "@/lib/form-styles";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for Creator Pilot Pro content scheduling.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 3 connected accounts",
      "10 scheduled posts per month",
      "Basic analytics",
      "Sandbox API support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: [
      "Unlimited connected accounts",
      "Unlimited scheduled posts",
      "Advanced analytics",
      "Production API keys",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared content calendar",
      "Role-based access",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Simple pricing</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            Start free with sandbox integrations. Upgrade when you are ready for
            production publishing at scale.
          </p>
        </header>
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`${cardClass} ${plan.highlighted ? "border-primary/40 ring-2 ring-primary/10" : ""}`}
            >
              <h2 className="text-sm font-semibold">{plan.name}</h2>
              <p className="mt-2">
                <span className="text-2xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>
              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground">• {f}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="text-center">
          <Link href="/signup" className={btnPrimary}>
            Get started free
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
