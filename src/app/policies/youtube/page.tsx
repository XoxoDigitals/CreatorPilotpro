import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";
import { EXTERNAL_POLICIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "YouTube & Google Policies",
  description: "How Creator Pilot Pro complies with YouTube and Google API policies.",
};

export default function YouTubePoliciesPage() {
  return (
    <PolicyLayout
      title="YouTube & Google API Compliance"
      description="Our obligations when integrating with YouTube Data API and Google OAuth."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">Applicable policies</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <a href={EXTERNAL_POLICIES.youtube.terms} target="_blank" rel="noreferrer" className="text-primary">
              YouTube Terms of Service
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.youtube.community} target="_blank" rel="noreferrer" className="text-primary">
              YouTube Community Guidelines
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.youtube.api} target="_blank" rel="noreferrer" className="text-primary">
              YouTube API Services Terms of Service
            </a>
          </li>
          <li>
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-primary">
              Google API Services User Data Policy
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Our commitments</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Request minimum OAuth scopes needed for upload and read operations</li>
          <li>Do not sell Google user data or use it for unauthorized advertising</li>
          <li>Allow users to disconnect YouTube and revoke tokens at any time</li>
          <li>Display Google OAuth consent screen before accessing YouTube data</li>
          <li>Honor user deletion requests within stated timeframes</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Limited use disclosure</h2>
        <p className="mt-2 text-muted-foreground">
          YouTube data accessed through Creator Pilot Pro is used only to provide
          scheduling, publishing, and analytics features you explicitly request.
          We do not use this data to train generalized AI models or for unrelated
          marketing.
        </p>
      </section>
    </PolicyLayout>
  );
}
