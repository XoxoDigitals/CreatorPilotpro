import type { Metadata } from "next";
import { PolicyLayout } from "@/components/shared/PolicyLayout";

export const metadata: Metadata = {
  title: "Data Deletion Instructions",
  description: "How to request deletion of your Creator Pilot Pro data.",
};

export default function DataDeletionPage() {
  return (
    <PolicyLayout
      title="Data Deletion Instructions"
      description="Required for Meta/Facebook app compliance and user data rights."
      lastUpdated="July 1, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold">Delete via dashboard</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>Log in to Creator Pilot Pro</li>
          <li>Go to Settings → Connected Accounts and disconnect each platform</li>
          <li>Go to Settings → Delete Account to remove all stored data</li>
        </ol>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Facebook data deletion callback</h2>
        <p className="mt-2 text-muted-foreground">
          For Facebook Login apps, our data deletion callback URL is:
        </p>
        <code className="mt-2 block rounded-xl border border-border bg-muted p-4 text-xs">
          {process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/facebook/data-deletion
        </code>
        <p className="mt-2 text-muted-foreground">
          When Meta sends a signed deletion request, we remove associated user
          data and OAuth tokens within 30 days.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Email request</h2>
        <p className="mt-2 text-muted-foreground">
          Email privacy@creatorpilotpro.com with subject &quot;Data Deletion
          Request&quot; and the email address tied to your account. We respond
          within 30 days.
        </p>
      </section>
    </PolicyLayout>
  );
}
