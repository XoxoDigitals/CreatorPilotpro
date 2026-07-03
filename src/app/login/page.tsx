"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { setAuthenticated } from "@/lib/stores/app-store";
import { btnPrimary, cardClass, inputClass, labelClass } from "@/lib/form-styles";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthenticated(true);
    router.push("/dashboard");
  }

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-md px-6 py-12">
        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
          <h1 className="text-xl font-semibold">Log in</h1>
          <p className="text-sm text-muted-foreground">
            Demo login — any credentials work. Connect API keys in Settings later.
          </p>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" defaultValue="alex@example.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input id="password" type="password" defaultValue="demo1234" className={inputClass} />
          </div>
          <button type="submit" className={`${btnPrimary} w-full`}>Log in</button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-primary hover:opacity-90">Sign up</Link>
          </p>
        </form>
      </main>
      <MarketingFooter />
    </>
  );
}
