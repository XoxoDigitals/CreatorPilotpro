"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { setAuthenticated, saveUserProfile, migrateToCleanStore } from "@/lib/stores/app-store";
import { btnPrimary, cardClass, inputClass, labelClass } from "@/lib/form-styles";

export default function SignupPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    migrateToCleanStore();
    const form = new FormData(e.currentTarget);
    saveUserProfile({
      id: "user-1",
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
    });
    setAuthenticated(true);
    router.push("/dashboard");
  }

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-md px-6 py-12">
        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-primary">Terms</Link> and{" "}
            <Link href="/privacy" className="text-primary">Privacy Policy</Link>.
          </p>
          <div>
            <label htmlFor="name" className={labelClass}>Name</label>
            <input id="name" name="name" required className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
          </div>
          <button type="submit" className={`${btnPrimary} w-full`}>Create account</button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:opacity-90">Log in</Link>
          </p>
        </form>
      </main>
      <MarketingFooter />
    </>
  );
}
