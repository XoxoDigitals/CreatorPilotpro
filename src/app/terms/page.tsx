import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Creator Pilot Pro.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms of Service"
      description="By using Creator Pilot Pro, you agree to these terms."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">1. Service description</h2>
        <p className="mt-2 text-muted-foreground">
          Creator Pilot Pro provides content scheduling and publishing tools for
          YouTube, TikTok, and Facebook. You are responsible for content you
          schedule and must comply with each platform&apos;s terms and community
          guidelines.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">2. Account responsibilities</h2>
        <p className="mt-2 text-muted-foreground">
          You must provide accurate registration information, keep credentials
          secure, and notify us of unauthorized access. You may not use the
          service for spam, illegal content, or activities that violate platform
          policies.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">3. API usage</h2>
        <p className="mt-2 text-muted-foreground">
          When connecting sandbox or production API credentials, you agree to
          comply with Google API Services User Data Policy, Meta Platform Terms,
          and TikTok Developer Terms. Rate limits and quotas imposed by platforms
          apply.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">4. Limitation of liability</h2>
        <p className="mt-2 text-muted-foreground">
          The service is provided &quot;as is.&quot; We are not liable for failed
          publishes caused by platform outages, revoked permissions, or content
          policy violations on third-party networks.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">5. Termination</h2>
        <p className="mt-2 text-muted-foreground">
          You may delete your account at any time. We may suspend accounts that
          violate these terms or platform policies.
        </p>
      </section>
    </PolicyLayout>
  );
}
