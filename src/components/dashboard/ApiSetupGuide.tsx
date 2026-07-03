"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { PlatformSetupGuide } from "@/lib/api-setup-guides";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { cardClass } from "@/lib/form-styles";

interface ApiSetupGuideProps {
  guide: PlatformSetupGuide;
}

export function ApiSetupGuide({ guide }: ApiSetupGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className={`${cardClass} overflow-hidden p-0`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <PlatformIcon platform={guide.platform} />
          <div>
            <p className="text-sm font-semibold">{guide.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{guide.intro}</p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-5 border-t border-border px-5 pb-5 pt-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              OAuth redirect URI
            </p>
            <code className="mt-2 block break-all text-xs">{guide.redirectUri}</code>
          </div>

          <ol className="space-y-4">
            {guide.steps.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                  {step.link && (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-90"
                    >
                      {step.link.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Keys to paste above
            </p>
            <ul className="mt-2 space-y-1">
              {guide.envKeys.map((k) => (
                <li key={k.key} className="text-sm">
                  <span className="text-muted-foreground">{k.label}:</span>{" "}
                  <code className="rounded bg-card px-1 text-xs">{k.key}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}
