"use client";

import { useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { btnPrimary, cardClass, inputClass, labelClass } from "@/lib/form-styles";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setMessage("Thanks! We received your message and will respond within 2 business days.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please email support@creatorpilotpro.com directly.");
    }
  }

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-xl space-y-8 px-6 py-12">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Questions about scheduling, API setup, or policies? Send us a message.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
          <div>
            <label htmlFor="name" className={labelClass}>Name</label>
            <input id="name" name="name" required className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="subject" className={labelClass}>Subject</label>
            <input id="subject" name="subject" required className={inputClass} placeholder="How can we help?" />
          </div>
          <div>
            <label htmlFor="body" className={labelClass}>Message</label>
            <textarea
              id="body"
              name="body"
              required
              rows={5}
              className={`${inputClass} h-auto py-3`}
              placeholder="Tell us about your question..."
            />
          </div>
          <button type="submit" disabled={status === "loading"} className={btnPrimary}>
            {status === "loading" ? "Sending..." : "Send message"}
          </button>

          {status === "success" && (
            <p className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </p>
          )}
          {status === "error" && (
            <p className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </p>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground">
          For data deletion requests, see our{" "}
          <a href="/data-deletion" className="text-primary hover:opacity-90">
            Data Deletion Policy
          </a>
          .
        </p>
      </main>
      <MarketingFooter />
    </>
  );
}
