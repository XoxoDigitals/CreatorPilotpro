"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Save,
  Send,
} from "lucide-react";
import type {
  FacebookPostContent,
  Platform,
  PostStatus,
  ScheduledPost,
  TikTokPostContent,
  YouTubePostContent,
} from "@/lib/types";
import {
  defaultFacebookContent,
  defaultTikTokContent,
  defaultYouTubeContent,
  FACEBOOK_CTA_OPTIONS,
  parseTags,
  PLATFORM_FIELD_HINTS,
  postDisplayTitle,
  YOUTUBE_CATEGORIES,
} from "@/lib/platform-post-fields";
import Link from "next/link";
import { getAccounts, generateId } from "@/lib/stores/app-store";
import { resolveMediaObjectUrl } from "@/lib/media-storage";
import { MediaUpload } from "@/components/dashboard/MediaUpload";
import { ThumbnailUpload } from "@/components/dashboard/ThumbnailUpload";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from "@/lib/form-styles";

interface PostComposerProps {
  onSave: (post: ScheduledPost, postNow?: boolean) => void;
  onCancel: () => void;
  initial?: ScheduledPost;
}

const PLATFORMS: Platform[] = ["youtube", "tiktok", "facebook"];

function formatHandle(handle: string): string {
  const clean = handle.replace(/^@+/, "").trim();
  return clean ? `@${clean}` : handle;
}

function syncAccountSelection(
  platforms: Platform[],
  selected: string[],
  allAccounts: ReturnType<typeof getAccounts>
): string[] {
  let next = selected.filter((id) => {
    const acc = allAccounts.find((a) => a.id === id);
    return acc && platforms.includes(acc.platform);
  });

  for (const platform of platforms) {
    const hasPlatform = next.some(
      (id) => allAccounts.find((a) => a.id === id)?.platform === platform
    );
    if (!hasPlatform) {
      const first = allAccounts.find((a) => a.platform === platform);
      if (first) next = [...next, first.id];
    }
  }

  return next;
}

export function PostComposer({ onSave, onCancel, initial }: PostComposerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [platforms, setPlatforms] = useState<Platform[]>(initial?.platforms ?? ["youtube"]);
  const [activeTab, setActiveTab] = useState<Platform>(platforms[0] ?? "youtube");
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt
      ? new Date(initial.scheduledAt).toISOString().slice(0, 16)
      : ""
  );
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? "scheduled");
  const [publishTiming, setPublishTiming] = useState<"schedule" | "now">("schedule");
  const [mediaType, setMediaType] = useState(initial?.mediaType);
  const [mediaId, setMediaId] = useState(initial?.mediaId);
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(initial?.mediaUrl);
  const [mediaFileName, setMediaFileName] = useState(initial?.mediaFileName);
  const [youtube, setYoutube] = useState<YouTubePostContent>(
    initial?.youtube ?? defaultYouTubeContent()
  );
  const [tiktok, setTiktok] = useState<TikTokPostContent>(
    initial?.tiktok ?? defaultTikTokContent()
  );
  const [facebook, setFacebook] = useState<FacebookPostContent>(
    initial?.facebook ?? defaultFacebookContent()
  );
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(() =>
    syncAccountSelection(
      initial?.platforms ?? ["youtube"],
      initial?.accountIds ?? [],
      getAccounts()
    )
  );
  const connectedAccounts = getAccounts();

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    async function loadPreviews() {
      if (initial?.mediaId && !initial.mediaUrl) {
        const url = await resolveMediaObjectUrl(initial.mediaId);
        if (url && !cancelled) {
          urls.push(url);
          setMediaUrl(url);
        }
      }
      if (initial?.youtube?.thumbnailMediaId && !initial.youtube.thumbnailUrl) {
        const url = await resolveMediaObjectUrl(initial.youtube.thumbnailMediaId);
        if (url && !cancelled) {
          urls.push(url);
          setYoutube((yt) => ({ ...yt, thumbnailUrl: url }));
        }
      }
      if (initial?.facebook?.thumbnailMediaId && !initial.facebook.thumbnailUrl) {
        const url = await resolveMediaObjectUrl(initial.facebook.thumbnailMediaId);
        if (url && !cancelled) {
          urls.push(url);
          setFacebook((fb) => ({ ...fb, thumbnailUrl: url }));
        }
      }
    }

    void loadPreviews();

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [initial]);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => {
      const next = prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p];
      if (next.length === 0) return prev;
      if (!next.includes(activeTab)) setActiveTab(next[0]);
      setSelectedAccountIds((selected) =>
        syncAccountSelection(next, selected, getAccounts())
      );
      return next;
    });
  }

  function selectAccountForPlatform(platform: Platform, accountId: string) {
    setSelectedAccountIds((prev) => {
      const all = getAccounts();
      const withoutPlatform = prev.filter(
        (id) => all.find((a) => a.id === id)?.platform !== platform
      );
      return [...withoutPlatform, accountId];
    });
  }

  const missingPlatformAccounts = platforms.filter(
    (p) => !connectedAccounts.some((a) => a.platform === p)
  );
  const canContinue =
    platforms.length > 0 &&
    missingPlatformAccounts.length === 0 &&
    platforms.every((p) =>
      selectedAccountIds.some(
        (id) => connectedAccounts.find((a) => a.id === id)?.platform === p
      )
    );

  function handleSubmit(asDraft: boolean, postNow = false) {
    if (platforms.length === 0 || !canContinue) return;
    const title = postDisplayTitle(platforms, youtube, tiktok, facebook);
    const description =
      youtube.description || facebook.message || tiktok.caption || "";
    const now = new Date().toISOString();

    const post: ScheduledPost = {
      id: initial?.id ?? generateId("post"),
      title,
      description,
      platforms,
      accountIds: selectedAccountIds.filter((id) =>
        connectedAccounts.some((a) => a.id === id && platforms.includes(a.platform))
      ),
      scheduledAt: postNow
        ? now
        : scheduledAt
          ? new Date(scheduledAt).toISOString()
          : now,
      status: asDraft ? "draft" : postNow ? "scheduled" : status,
      mediaType,
      mediaId,
      mediaFileName,
      youtube: platforms.includes("youtube")
        ? { ...youtube, thumbnailUrl: undefined }
        : undefined,
      tiktok: platforms.includes("tiktok") ? tiktok : undefined,
      facebook: platforms.includes("facebook")
        ? { ...facebook, thumbnailUrl: undefined }
        : undefined,
      createdAt: initial?.createdAt ?? now,
    };

    onSave(post, postNow);
  }

  return (
    <div className={`${cardClass} space-y-6`}>
      <div className="flex flex-wrap gap-2">
        {([1, 2, 3] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStep(n)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium ${
              step === n
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {n === 1 ? "1. Platforms & media" : n === 2 ? "2. Content" : "3. Schedule"}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <p className={labelClass}>Where should this post go?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                    platforms.includes(p)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <PlatformIcon platform={p} />
                </button>
              ))}
            </div>
          </div>

          {platforms.length > 0 && (
            <div className="space-y-4">
              <p className={labelClass}>Which accounts should receive this post?</p>
              {platforms.map((platform) => {
                const platformAccounts = connectedAccounts.filter(
                  (a) => a.platform === platform
                );
                if (platformAccounts.length === 0) {
                  return (
                    <div
                      key={platform}
                      className="rounded-xl border border-dashed border-border p-4 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={platform} />
                        <span className="capitalize">{platform}</span>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        No account connected.{" "}
                        <Link href="/dashboard/accounts" className="text-primary underline">
                          Connect one →
                        </Link>
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={platform} className="rounded-xl border border-border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <PlatformIcon platform={platform} />
                      <span className="text-sm font-semibold capitalize">{platform}</span>
                    </div>
                    <div className="space-y-2">
                      {platformAccounts.map((acc) => (
                        <label
                          key={acc.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                            selectedAccountIds.includes(acc.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`account-${platform}`}
                            checked={selectedAccountIds.includes(acc.id)}
                            onChange={() => selectAccountForPlatform(platform, acc.id)}
                            className="h-4 w-4 accent-[var(--primary)]"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{formatHandle(acc.handle)}</p>
                            <p className="truncate text-xs text-muted-foreground">{acc.name}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <p className={labelClass}>Video or image</p>
            <div className="mt-2">
              <MediaUpload
                mediaType={mediaType}
                mediaId={mediaId}
                mediaUrl={mediaUrl}
                mediaFileName={mediaFileName}
                onChange={({ mediaType: t, mediaId: id, mediaUrl: u, mediaFileName: f }) => {
                  setMediaType(t);
                  setMediaId(id);
                  setMediaUrl(u);
                  setMediaFileName(f);
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className={btnSecondary}>Cancel</button>
            <button type="button" onClick={() => setStep(2)} className={btnPrimary} disabled={!canContinue}>
              Next: Edit content
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActiveTab(p)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  activeTab === p ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <PlatformIcon platform={p} />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{PLATFORM_FIELD_HINTS[activeTab]}</p>

          {activeTab === "youtube" && platforms.includes("youtube") && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input className={inputClass} value={youtube.title} maxLength={100}
                  onChange={(e) => setYoutube({ ...youtube, title: e.target.value })} placeholder="Catchy video title" />
                <p className="mt-1 text-xs text-muted-foreground">{youtube.title.length}/100</p>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass} h-auto py-3`} rows={4} value={youtube.description}
                  onChange={(e) => setYoutube({ ...youtube, description: e.target.value })} placeholder="Tell viewers what this video is about..." />
              </div>
              <div>
                <label className={labelClass}>Tags (comma-separated)</label>
                <input className={inputClass} value={youtube.tags.join(", ")}
                  onChange={(e) => setYoutube({ ...youtube, tags: parseTags(e.target.value) })} placeholder="shorts, tutorial, creator" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Category</label>
                  <select className={inputClass} value={youtube.category}
                    onChange={(e) => setYoutube({ ...youtube, category: e.target.value })}>
                    {YOUTUBE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Visibility</label>
                  <select className={inputClass} value={youtube.visibility}
                    onChange={(e) => setYoutube({ ...youtube, visibility: e.target.value as YouTubePostContent["visibility"] })}>
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <ThumbnailUpload
                label="Custom thumbnail"
                value={youtube.thumbnailUrl}
                mediaId={youtube.thumbnailMediaId}
                onChange={({ url, mediaId: id }) =>
                  setYoutube({ ...youtube, thumbnailUrl: url, thumbnailMediaId: id })
                }
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={youtube.madeForKids}
                  onChange={(e) => setYoutube({ ...youtube, madeForKids: e.target.checked })} />
                Made for kids
              </label>
            </div>
          )}

          {activeTab === "tiktok" && platforms.includes("tiktok") && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Caption *</label>
                <textarea className={`${inputClass} h-auto py-3`} rows={3} value={tiktok.caption} maxLength={2200}
                  onChange={(e) => setTiktok({ ...tiktok, caption: e.target.value })} placeholder="Write your TikTok caption..." />
                <p className="mt-1 text-xs text-muted-foreground">{tiktok.caption.length}/2200</p>
              </div>
              <div>
                <label className={labelClass}>Hashtags (comma or # separated)</label>
                <input className={inputClass} value={tiktok.hashtags.map((h) => `#${h}`).join(" ")}
                  onChange={(e) => setTiktok({ ...tiktok, hashtags: parseTags(e.target.value) })} placeholder="#fyp #creator #tips" />
              </div>
              <div>
                <label className={labelClass}>Who can view</label>
                <select className={inputClass} value={tiktok.privacy}
                  onChange={(e) => setTiktok({ ...tiktok, privacy: e.target.value as TikTokPostContent["privacy"] })}>
                  <option value="public_to_everyone">Everyone</option>
                  <option value="mutual_follow_friends">Friends</option>
                  <option value="self_only">Only me</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={tiktok.allowComments} onChange={(e) => setTiktok({ ...tiktok, allowComments: e.target.checked })} />
                  Allow comments
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={tiktok.allowDuet} onChange={(e) => setTiktok({ ...tiktok, allowDuet: e.target.checked })} />
                  Allow duet
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={tiktok.allowStitch} onChange={(e) => setTiktok({ ...tiktok, allowStitch: e.target.checked })} />
                  Allow stitch
                </label>
              </div>
            </div>
          )}

          {activeTab === "facebook" && platforms.includes("facebook") && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Post message *</label>
                <textarea className={`${inputClass} h-auto py-3`} rows={3} value={facebook.message}
                  onChange={(e) => setFacebook({ ...facebook, message: e.target.value })} placeholder="What do you want to say to your audience?" />
              </div>
              <div>
                <label className={labelClass}>Video title</label>
                <input className={inputClass} value={facebook.title}
                  onChange={(e) => setFacebook({ ...facebook, title: e.target.value })} placeholder="Title shown on the video" />
              </div>
              <div>
                <label className={labelClass}>Video description</label>
                <textarea className={`${inputClass} h-auto py-3`} rows={2} value={facebook.description}
                  onChange={(e) => setFacebook({ ...facebook, description: e.target.value })} placeholder="Additional context for the video" />
              </div>
              <div>
                <label className={labelClass}>Call to action button</label>
                <select className={inputClass} value={facebook.callToAction}
                  onChange={(e) => setFacebook({ ...facebook, callToAction: e.target.value as FacebookPostContent["callToAction"] })}>
                  {FACEBOOK_CTA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <ThumbnailUpload
                label="Video thumbnail"
                value={facebook.thumbnailUrl}
                mediaId={facebook.thumbnailMediaId}
                onChange={({ url, mediaId: id }) =>
                  setFacebook({ ...facebook, thumbnailUrl: url, thumbnailMediaId: id })
                }
              />
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <button type="button" onClick={() => setStep(1)} className={btnSecondary}>Back</button>
            <button type="button" onClick={() => setStep(3)} className={btnPrimary}>Next: Schedule</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>When to publish</label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPublishTiming("schedule")}
                className={`rounded-full border px-4 py-2 text-xs font-medium ${
                  publishTiming === "schedule"
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                Schedule for later
              </button>
              <button
                type="button"
                onClick={() => setPublishTiming("now")}
                className={`rounded-full border px-4 py-2 text-xs font-medium ${
                  publishTiming === "now"
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                Post now
              </button>
            </div>
          </div>

          {publishTiming === "schedule" && (
            <>
              <div>
                <label className={labelClass}>Publish date & time</label>
                <input type="datetime-local" className={inputClass} value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={status}
                  onChange={(e) => setStatus(e.target.value as PostStatus)}>
                  <option value="scheduled">Scheduled — publish automatically</option>
                  <option value="draft">Draft — save for later</option>
                </select>
              </div>
            </>
          )}

          {publishTiming === "now" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-semibold text-primary">Post immediately</p>
              <p className="mt-1 text-muted-foreground">
                Your content will be sent to all selected platforms right away.
              </p>
            </div>
          )}
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <p className="font-semibold">Summary</p>
            <p className="mt-2 text-muted-foreground">
              {postDisplayTitle(platforms, youtube, tiktok, facebook)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {platforms.map((p) => <PlatformIcon key={p} platform={p} />)}
            </div>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {selectedAccountIds.map((id) => {
                const acc = connectedAccounts.find((a) => a.id === id);
                if (!acc) return null;
                return (
                  <li key={id}>
                    <span className="capitalize">{acc.platform}</span>: {formatHandle(acc.handle)}
                  </li>
                );
              })}
            </ul>
            {mediaFileName && (
              <p className="mt-2 text-xs text-muted-foreground">Media: {mediaFileName}</p>
            )}
          </div>
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <button type="button" onClick={() => setStep(2)} className={btnSecondary}>Back</button>
            <div className="flex flex-wrap gap-2">
              {publishTiming === "schedule" && (
                <>
                  <button type="button" onClick={() => handleSubmit(true)} className={btnSecondary}>
                    <Save className="h-4 w-4" /> Save draft
                  </button>
                  <button type="button" onClick={() => handleSubmit(false)} className={btnPrimary}>
                    <Calendar className="h-4 w-4" /> Schedule post
                  </button>
                </>
              )}
              {publishTiming === "now" && (
                <button type="button" onClick={() => handleSubmit(false, true)} className={btnPrimary}>
                  <Send className="h-4 w-4" /> Post now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
