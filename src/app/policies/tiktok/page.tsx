import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";
import { EXTERNAL_POLICIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "TikTok Policies",
  description: "How Creator Pilot Pro complies with TikTok Developer policies.",
};

export default function TikTokPoliciesPage() {
  return (
    <PolicyLayout
      title="TikTok Developer & Content Compliance"
      description="Our obligations when integrating with TikTok Content Posting API."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">Applicable policies</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <a href={EXTERNAL_POLICIES.tiktok.terms} target="_blank" rel="noreferrer" className="text-primary">
              TikTok Terms of Service
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.tiktok.community} target="_blank" rel="noreferrer" className="text-primary">
              TikTok Community Guidelines
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.tiktok.developer} target="_blank" rel="noreferrer" className="text-primary">
              TikTok Developer Terms
            </a>
          </li>
          <li>
            <a href="https://developers.tiktok.com/doc/content-posting-api-get-started" target="_blank" rel="noreferrer" className="text-primary">
              TikTok Content Posting API Documentation
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Sandbox &amp; production</h2>
        <p className="mt-2 text-muted-foreground">
          Creator Pilot Pro supports TikTok sandbox apps for development and testing.
          Production publishing requires TikTok app review and approved scopes
          (video.upload, video.publish). Users must own or have rights to all
          uploaded content.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Our commitments</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Publish only on behalf of authenticated TikTok creators</li>
          <li>Do not store TikTok credentials longer than necessary</li>
          <li>Respect TikTok rate limits and content moderation requirements</li>
          <li>Allow users to disconnect TikTok and delete associated data</li>
        </ul>
      </section>
    </PolicyLayout>
  );
}
