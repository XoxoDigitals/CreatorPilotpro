import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Rules for using Creator Pilot Pro responsibly.",
};

export default function AcceptableUsePage() {
  return (
    <PolicyLayout
      title="Acceptable Use Policy"
      description="You must follow these rules and all connected platform policies."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">Prohibited content</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Illegal, harassing, or hateful content</li>
          <li>Copyright-infringing material without rights</li>
          <li>Spam, misleading metadata, or engagement manipulation</li>
          <li>Content violating YouTube, TikTok, or Facebook community standards</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Prohibited technical use</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Reverse engineering or circumventing API rate limits</li>
          <li>Sharing API credentials or OAuth tokens</li>
          <li>Automated abuse, credential stuffing, or unauthorized access</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Enforcement</h2>
        <p className="mt-2 text-muted-foreground">
          Violations may result in account suspension and reporting to platform
          providers where required by law or developer agreements.
        </p>
      </section>
    </PolicyLayout>
  );
}
