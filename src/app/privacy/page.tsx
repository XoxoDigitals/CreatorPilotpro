import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";
import { EXTERNAL_POLICIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Creator Pilot Pro collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      description="This policy describes how Creator Pilot Pro handles personal data when you use our content scheduling platform."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">1. Information we collect</h2>
        <p className="mt-2 text-muted-foreground">
          We collect account information (name, email), connected social platform
          account metadata, scheduled post content you provide, and usage analytics
          to operate the service. When you connect YouTube, TikTok, or Facebook,
          we receive OAuth tokens and profile information permitted by your
          authorization.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">2. How we use data</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Schedule and publish content to platforms you authorize</li>
          <li>Display analytics and publishing status in your dashboard</li>
          <li>Provide customer support and service improvements</li>
          <li>Comply with legal obligations and platform developer policies</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">3. Third-party platforms</h2>
        <p className="mt-2 text-muted-foreground">
          Our service integrates with Google (YouTube), Meta (Facebook), and TikTok.
          Their use of your data is governed by their respective privacy policies:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <a href={EXTERNAL_POLICIES.youtube.privacy} target="_blank" rel="noreferrer" className="text-primary">
              Google Privacy Policy
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.facebook.privacy} target="_blank" rel="noreferrer" className="text-primary">
              Meta Privacy Policy
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.tiktok.privacy} target="_blank" rel="noreferrer" className="text-primary">
              TikTok Privacy Policy
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">4. Data retention &amp; deletion</h2>
        <p className="mt-2 text-muted-foreground">
          We retain data while your account is active. You may request deletion
          via our{" "}
          <a href="/data-deletion" className="text-primary">Data Deletion Policy</a>.
          OAuth tokens are revoked when you disconnect an account.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">5. Contact</h2>
        <p className="mt-2 text-muted-foreground">
          Privacy questions: privacy@creatorpilotpro.com
        </p>
      </section>
    </PolicyLayout>
  );
}
