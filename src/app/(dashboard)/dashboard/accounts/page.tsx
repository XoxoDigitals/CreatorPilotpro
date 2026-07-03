import { Suspense } from "react";
import AccountsClient from "./AccountsClient";

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading accounts...</div>}>
      <AccountsClient />
    </Suspense>
  );
}
