"use client";

import { useEffect, useState } from "react";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { cardClass, inputClass, labelClass, btnPrimary } from "@/lib/form-styles";
import {
  getScheduleConfig,
  saveScheduleConfig,
} from "@/lib/stores/app-store";
import type { ScheduleConfig, ScheduleMode } from "@/lib/types";
import { WEEKDAYS } from "@/lib/types";

export default function SchedulePage() {
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getScheduleConfig());
  }, []);

  if (!config) return null;

  function update(patch: Partial<ScheduleConfig>) {
    setConfig((c) => (c ? { ...c, ...patch } : c));
    setSaved(false);
  }

  function handleSave() {
    if (config) {
      saveScheduleConfig(config);
      setSaved(true);
    }
  }

  function updateTime(index: number, value: string) {
    const postTimes = [...config!.postTimes];
    postTimes[index] = value;
    update({ postTimes });
  }

  return (
    <>
      <DashboardTopBar
        title="Schedule"
        subtitle="Set default publishing times for your content"
      />
      <div className="mx-auto max-w-2xl p-4 lg:p-8">
      <div className={`${cardClass} space-y-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Auto-publishing</p>
            <p className="text-xs text-muted-foreground">Enable scheduled publishing</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.enabled}
            onClick={() => update({ enabled: !config.enabled })}
            className={`relative h-7 w-12 rounded-full transition ${config.enabled ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${config.enabled ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>

        <div>
          <label className={labelClass}>Schedule mode</label>
          <div className="mt-2 flex gap-2">
            {(["fixed", "weekly"] as ScheduleMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => update({ mode })}
                className={`rounded-full border px-4 py-2 text-xs font-medium capitalize ${
                  config.mode === mode
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="postsPerDay" className={labelClass}>Posts per day</label>
          <input
            id="postsPerDay"
            type="number"
            min={1}
            max={20}
            value={config.postsPerDay}
            onChange={(e) => update({ postsPerDay: Number(e.target.value) })}
            className={`${inputClass} max-w-xs`}
          />
        </div>

        {config.mode === "fixed" ? (
          <div>
            <label className={labelClass}>Daily post times</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {config.postTimes.map((time, i) => (
                <input
                  key={i}
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(i, e.target.value)}
                  className={`${inputClass} max-w-[140px]`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {WEEKDAYS.map((day) => (
              <div key={day} className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold capitalize">{day}</p>
                <input
                  type="text"
                  placeholder="09:00, 18:00"
                  value={(config.weeklySchedule[day] ?? []).join(", ")}
                  onChange={(e) =>
                    update({
                      weeklySchedule: {
                        ...config.weeklySchedule,
                        [day]: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                      },
                    })
                  }
                  className={`${inputClass} mt-2`}
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <label htmlFor="timezone" className={labelClass}>Timezone</label>
          <input
            id="timezone"
            value={config.timezone}
            onChange={(e) => update({ timezone: e.target.value })}
            className={`${inputClass} max-w-md`}
          />
        </div>

        <button type="button" onClick={handleSave} className={btnPrimary}>
          Save schedule
        </button>
        {saved && (
          <p className="text-sm text-[var(--color-success)]">Schedule saved successfully.</p>
        )}
      </div>
      </div>
    </>
  );
}
