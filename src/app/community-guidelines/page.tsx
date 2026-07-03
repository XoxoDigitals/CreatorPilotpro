import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";
import { EXTERNAL_POLICIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "Creator Pilot Pro community and content standards.",
};

export default function CommunityGuidelinesPage() {
  return (
    <PolicyLayout
      title="Community Guidelines"
      description="Standards for creators using our scheduling platform."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">Our standards</h2>
        <p className="mt-2 text-muted-foreground">
          Creator Pilot Pro is built for authentic creators. Schedule content
          that adds value, respects audiences, and follows platform rules.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Platform community rules</h2>
        <p className="mt-2 text-muted-foreground">
          Published content must comply with each destination network:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <a href={EXTERNAL_POLICIES.youtube.community} target="_blank" rel="noreferrer" className="text-primary">
              YouTube Community Guidelines
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.tiktok.community} target="_blank" rel="noreferrer" className="text-primary">
              TikTok Community Guidelines
            </a>
          </li>
          <li>
            <a href={EXTERNAL_POLICIES.facebook.community} target="_blank" rel="noreferrer" className="text-primary">
              Meta Community Standards
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Reporting</h2>
        <p className="mt-2 text-muted-foreground">
          Report abuse to support@creatorpilotpro.com. We review reports and
          cooperate with platform safety teams when necessary.
        </p>
      </section>
    </PolicyLayout>
  );
}
