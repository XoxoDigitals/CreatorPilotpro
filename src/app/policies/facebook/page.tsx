import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";
import { EXTERNAL_POLICIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Facebook & Meta Policies",
  description: "How Creator Pilot Pro complies with Meta Platform policies.",
};

export default function FacebookPoliciesPage() {
  return (
    <PolicyLayout
      title="Facebook & Meta Platform Compliance"
      description="Our obligations when integrating with Meta Graph API and Facebook Login."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">Applicable policies</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <a href={EXTERNAL_POLICIES.facebook.terms} target="_blank" rel="noreferrer" className="text-primary">
              Meta Terms of Service
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.facebook.platform} target="_blank" rel="noreferrer" className="text-primary">
              Meta Platform Terms
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.facebook.community} target="_blank" rel="noreferrer" className="text-primary">
              Meta Community Standards
            </a>
          </li>
          <li>
            <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noreferrer" className="text-primary">
              Meta Developer Policies
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Our commitments</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Only publish to Pages the user explicitly authorizes</li>
          <li>Provide data deletion callback URL for Facebook Login apps</li>
          <li>Do not combine Facebook data with unrelated datasets without consent</li>
          <li>Respect app review requirements before production Page publishing</li>
          <li>Use sandbox/test apps during development as Meta recommends</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Data use</h2>
        <p className="mt-2 text-muted-foreground">
          Page access tokens are stored securely and used solely to schedule and
          publish content on behalf of the authenticated user. Tokens are deleted
          when the user disconnects their Facebook account.
        </p>
      </section>
    </PolicyLayout>
  );
}
