<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# CreatorAutopilot — Technical Documentation

**Version:** demo frontend (Next.js 16 App Router, TypeScript, Tailwind v4)  
**Purpose:** This document is the canonical technical reference for the entire CreatorAutopilot codebase. A developer who has never seen the repo should be able to understand product behavior, data flow, business rules, module boundaries, and extension points from this file alone.

**Product:** Multi-mode social media autopilot for creators who prioritize **growth**, **monetization visibility**, and **repeatable content pipelines**.

**Current data layer:** Mock data in `src/lib/mock-data.ts` + browser `localStorage` persistence. No real OAuth, payment processor, or AI backend is wired. When integrating APIs, preserve component props, period-scaling interfaces, credit estimate shapes, and group card contracts.

---

## Table of contents

1. [System architecture](#1-system-architecture)
2. [Runtime model](#2-runtime-model)
3. [Domain types](#3-domain-types)
4. [Library modules — API reference](#4-library-modules--api-reference)
5. [UI components — contracts](#5-ui-components--contracts)
6. [Routes and pages](#6-routes-and-pages)
7. [Content engines — full specification](#7-content-engines--full-specification)
8. [Credit and billing system](#8-credit-and-billing-system)
9. [Analytics and period scaling](#9-analytics-and-period-scaling)
10. [Monetization logic](#10-monetization-logic)
11. [AI intelligence](#11-ai-intelligence)
12. [Admin panel](#12-admin-panel)
13. [Events and persistence keys](#13-events-and-persistence-keys)
14. [Known constraints and past bugs](#14-known-constraints-and-past-bugs)
15. [Backend integration guide](#15-backend-integration-guide)
16. [Extension checklist](#16-extension-checklist)

---

## 1. System architecture

### 1.1 Three application shells

```
┌─────────────────────────────────────────────────────────────────────────┐
│ MARKETING SHELL          Route group: app/page.tsx, app/(auth)/*         │
│   /                      MarketingHomepage                               │
│   /login, /signup, /forgot-password                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ CREATOR APP SHELL        Route group: app/(dashboard)/*                  │
│   Layout: Sidebar (fixed) + TopBar + scrollable main                     │
│   /dashboard, /analytics, /niche-analyzer, 6 content engines, etc.     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ADMIN SHELL              Route group: app/(admin)/admin/*                │
│   Layout: amber accent, separate sidebar, no creator Sidebar           │
│   /admin, /admin/users, /admin/pricing, …                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Product layers

| Layer | Responsibility |
|---|---|
| **Discover** | Niche Analyzer, Master Prompter — research before automation |
| **Automate** | 6 content engines — scheduled pipelines that generate and post |
| **Analyze** | Per-account and per-video analytics, combined `/analytics`, AI Score |
| **Monetize** | Criteria panels, earnings gating, YPP/TikTok CP/FB Reels progress |
| **Credits** | Balance, spend, purchase, pipeline cost estimates |
| **Admin** | Global pricing, engine toggles, user overrides, orders, templates |

### 1.3 Shared engine pattern

Every content engine implements the same lifecycle:

```
First visit (localStorage setup flag absent)
  → Landing CTA ("Start …")
  → Multi-step setup wizard
  → Set setup flag = true
  → Redirect to mode dashboard

Return visit (setup flag present)
  → Period selector + overview KPIs
  → Publishing group cards (2 per row desktop)
  → Click platform card → account detail analytics
  → Scroll to mode-specific content list
  → Click clip → video detail (CrossPostVideoDetailClient)

Account detail
  → Header: name, platform pill, badges, AI Memory / Brainstorm / Settings
  → PeriodSelector → all KPIs + charts rescale
  → Monetized vs non-monetized layout branch
  → Bottom panel (flat list OR column-by-source)

Settings (SideDrawer portal)
  → Per-account config in localStorage
  → Posting toggle, schedule, sources, voice, add-on flags
```

### 1.4 File tree (authoritative)

```
src/
├── app/
│   ├── page.tsx                         Marketing homepage
│   ├── layout.tsx                       suppressHydrationWarning on html/body
│   ├── (auth)/                          login, signup, forgot-password
│   ├── (dashboard)/                     creator app (layout: Sidebar + TopBar)
│   └── (admin)/admin/                   admin panel (layout: AdminSidebar)
├── components/
│   ├── layout/                          Sidebar, TopBar, GlobalSearch, UserMenu, CreditBadge
│   ├── marketing/                       MarketingHomepage
│   ├── dashboard/                       DashboardClient, AnalyticsClient, CreditOverview
│   ├── admin/                           Admin*Client components
│   ├── shared/                          forms, SideDrawer, PostedVideosPanel,
│   │                                    EngineAccountGroupCard, PlatformDestinationSlot,
│   │                                    DestinationAccountGroups, EngineDailyCreditEstimate,
│   │                                    ScheduleEditor, ReferenceChannelsField
│   ├── shared/ai/                       AiScoreCard, AiMemoryPanel, BrainstormPanel,
│   │                                    VideoAiAnalyticsPanel, AccountIntelligenceBar
│   ├── cross-posting/                   CrossPostSetupWizard, CrossPostPageDetailClient,
│   │                                    TrendChart (ComparisonChart), MonetizationCriteriaPanel
│   ├── podcast/                         PodcastSetupWizard, PodcastAccountDetailClient,
│   │                                    PodcastClipsBySourcePanel
│   ├── movie/                           MovieSetupWizard, MovieUploadModal, MovieAccountDetailClient,
│   │                                    MovieClipsBySourcePanel, ChannelRemix*
│   ├── asmr/                            AsmrTemplateGrid, AsmrSetupWizard, AsmrAccountDetailClient
│   └── story/                           StoryTypePicker, StorySetupWizard, StoryAccountDetailClient,
│                                        StoryClipsByStoryPanel
├── contexts/connect-account-context.tsx ConnectAccountModal provider
└── lib/                                 See §4
```

---

## 2. Runtime model

### 2.1 Server vs client components

| Pattern | Rule |
|---|---|
| **Page routes** | Often Server Components that pass serializable props to client children |
| **Interactive UI** | `"use client"` on wizards, drawers, charts, stores |
| **admin-store.ts** | `"use client"` — **never import from Server Components** |
| **credit-ledger.ts, user-store.ts, orders-store.ts** | `"use client"` — localStorage only |
| **mock-data.ts, analytics-period.ts, credit-pricing.ts** | Safe on server (no window) except when they call admin-store |

**Critical:** Do not pass functions from Server Components to Client Components. Example: `ComparisonChart` uses `valueFormat="number" | "percent" | "currency"` instead of `formatValue={fn}`.

**Admin embed pattern:** Admin channel/video routes use thin client wrappers (`AdminUserAccountPageClient`, `AdminUserVideoPageClient`) that call `getAdminUserById()` on the client, then render creator analytics with `embedOptions={{ compact: true, readOnly: true }}`.

### 2.2 Persistence model

All creator and admin mutations write to `localStorage` in the browser. There is no API sync. Seed data is loaded on first read when a key is empty.

**Implication for SSR:** Server renders use defaults; client hydrates with stored values. Use `suppressHydrationWarning` on `<html>` and `<body>` in `app/layout.tsx` to tolerate browser extension attribute injection (e.g. `cz-shortcut-listen`).

### 2.3 Demo user identity

| Constant | Value | File |
|---|---|---|
| Current checkout user | `CURRENT_USER_ID = "u-1"` | `orders-store.ts` |
| Default profile | Alex Rivera | `user-store.ts` DEFAULT_PROFILE |
| Admin seed users | u-1 … u-5 | `admin-data.ts` ADMIN_USERS |

---

## 3. Domain types

File: `src/lib/types.ts` — single source of truth for creator domain.

### 3.1 Core enums

```typescript
Platform = "youtube" | "tiktok" | "facebook"
AnalyticsPeriod = "all" | "7d" | "30d" | "90d"
AutomationStatus = "active" | "paused" | "error" | "scheduled"
ProductMode = "cross-posting" | "podcast" | "movie" | "channel-remix" | "asmr" | "story"
JourneyStepStatus = "pending" | "running" | "done" | "failed"
```

### 3.2 Publishing groups

```typescript
interface DestinationAccountGroup {
  id: string;           // e.g. "grp-1730…-abc12"
  label: string;        // User-visible group name
  accountIds: string[]; // Connected destination account IDs in this group
}
```

**Semantics:** One group = one logical channel/template published to N platforms. First connector pays base rate; each additional connector pays `connectorSurcharge × (N - 1)` per clip.

### 3.3 Cross-posting types

```typescript
CrossPostUploadMode = "sequential" | "round_robin"
  // sequential  = "Channel Marathon" — exhaust source A before B
  // round_robin = "Round Robin Mix" — rotate one video per source

CrossPostScheduleMode = "fixed" | "weekly"
  // fixed  = same post times every day
  // weekly = per-weekday time grid (Mon–Sun cards)

interface CrossPostSourceAccount {
  id: string;
  platform: Platform;
  urlOrHandle: string;
}

interface CrossPostPageConfig {
  sourceAccounts: CrossPostSourceAccount[];
  uploadMode: CrossPostUploadMode;
  scheduleMode: CrossPostScheduleMode;
  postsPerDay: number;
  postTimes: string[];              // HH:MM 24h when fixed mode
  weeklySchedule: Record<string, string[]>; // weekday → times
  destinationAccountIds: string[];
  destinationGroups?: DestinationAccountGroup[];
  shieldBlendEnabled: boolean;
  titleSparkEnabled: boolean;
  postingEnabled: boolean;
}
```

### 3.4 Analytics entities

`CrossPostPage` — account/page with 30-day baseline metrics, `monetized: boolean`, `viewsTrend`, config.  
`CrossPostVideo` — clip with views, viewers, impressions, earnings, retentionCurve, demographics, viralScore, uploadedAt/postedAt strings.

Mode-specific accounts extend `CrossPostPage` with typed `config`:

| Type | Config interface |
|---|---|
| PodcastAccount | PodcastConfig |
| MovieAccount | MovieExplainerConfig |
| ChannelRemixAccount | ChannelRemixConfig |
| AsmrAccount | AsmrConfig |
| StoryAccount | StoryConfig |

### 3.5 ASMR types

```typescript
AsmrVideoDuration = "15" | "30" | "60" | "90" | "120"  // seconds only
AsmrAudioMode = "voiceover" | "natural_only"
normalizeAsmrVideoDuration(raw) → maps legacy values to valid duration
```

### 3.6 Story types

```typescript
StoryKind = "narration" | "documentary" | "drama"
StoryVisualStyle = "2D" | "3D" | "Realistic" | "Manga"
StoryAudioMode = "dialogue" | "narration"
DramaEpisodeMode = "continuous" | "standalone"
  // continuous  = same arc across episodes
  // standalone  = new self-contained story each episode
```

### 3.7 Monetization criteria

```typescript
interface MonetizationCriteria {
  id: string;
  label: string;
  current: number | string;
  target: number | string;
  met: boolean;
  optionalGroup?: string;  // e.g. "ypp_watch_path" — OR logic within group
}
```

### 3.8 Admin types

File: `src/lib/admin-types.ts`

```typescript
EngineAccessMode = "default" | "hidden" | "disabled" | "coming_soon"
EnginePricingKind = "base" | "bundle" | "duration_tiers"

interface AdminUserEngineOverride {
  engineId: string;
  access: EngineAccessMode;
  customBaseCredits: number | null;           // Niche, Master Prompter
  customClipsPerCredit: number | null;        // Legacy bundle engines
  customDurationCredits: Record<string, number> | null;  // tier id → credits
  customConnectorSurcharge: number | null;
}

interface AdminUserAddonPrefs {
  shieldBlendEnabled: boolean;
  titleSparkEnabled: boolean;
  aiVideoAnalyticsEnabled: boolean;
  brainstormEnabled: boolean;
  aiScoreRefreshEnabled: boolean;
}
```

---

## 4. Library modules — API reference

### 4.1 `analytics-period.ts`

**Purpose:** Scale all demo analytics from a 30-day baseline to selected period.

| Export | Signature | Logic |
|---|---|---|
| `PERIOD_FACTORS` | `Record<AnalyticsPeriod, number>` | all=4.2, 90d=2.85, 30d=1, 7d=0.26 |
| `PERIOD_OPTIONS` | array | UI labels; default selection is `"all"` |
| `periodFactor(period)` | → number | Lookup factor |
| `scaleForPeriod(value, period)` | → number | `value × factor` |
| `changeForPeriod(basePct, period)` | → number | Adds period offset to comparison badge |
| `periodComparisonLabel(period)` | → string | "vs previous 7 days", etc. |
| `buildPeriodTrend(baseDaily, period)` | → TimeSeriesPoint[] | Generates dated chart series |
| `getPreviousPeriodTrend(trend)` | → TimeSeriesPoint[] | ~78–86% of current for comparison line |

**Rule:** Call `scaleForPeriod` on every KPI, chart input, and list metric when period changes.

### 4.2 `credit-pricing.ts`

**Purpose:** Resolve admin pricing into per-clip and per-day estimates.

#### Key functions

| Function | Input | Output | Logic |
|---|---|---|---|
| `getBaseActionCredits(mode)` | `"niche-analyzer"` etc. | number | Lookup `costs` where category=`base` |
| `getConnectorSurchargePerPlatform(mode, override?)` | EngineCreditMode | number | Admin surcharge or user override |
| `getEnginePricingKind(engineId)` | string | EnginePricingKind | base / bundle / duration_tiers |
| `getEngineDurationTiers(engineId)` | string | AdminDurationCreditTier[] | Sorted by durationSeconds |
| `getEngineGlobalPricingHint(engineId)` | string | string | Human label for admin UI |
| `parseDurationSeconds(value)` | string \| number | number | Parses "60", defaults 60 |
| `formatAddonBundleRate(addon)` | AdminAddonCreditCost | string | `"1 credit = 10 clips"` |
| `getEngineCreditBreakdown(input)` | EngineCreditEstimateInput | EngineCreditBreakdown | **Main pricing engine** |

#### `getEngineCreditBreakdown` algorithm

```
INPUT:
  mode, durationSeconds, postsPerDay,
  shieldBlendEnabled?, titleSparkEnabled?,
  destinationGroups[] OR connectorCount

FOR EACH group in destinationGroups:
  connectorCount = max(1, group.accountIds.length)
  basePerClip = resolveBasePerClip(mode, durationSeconds)
    IF mode has per_clip cost → use it (cross-posting = 2 credits/video)
    ELSE IF bundle → 1 / clipsPerCredit
    ELSE → duration tier (smallest tier >= durationSeconds)
  connectorSurcharge = (connectorCount - 1) × extraCreditsPerConnector
  shieldBlendPerClip = addonCredits["addon-shieldblend"].credits / unitsPerCredit IF enabled
  titleSparkPerClip = addonCredits["addon-titlespark"].credits / unitsPerCredit IF enabled
  totalPerClip = base + connector + shield + title
  creditsPerDay = postsPerDay × totalPerClip

RETURN sum across groups, plus week/month projections
```

**Rounding:** `roundCredit(n) = ceil(n × 10) / 10` (one decimal).

### 4.3 `credit-ledger.ts` (`"use client"`)

| Function | Behavior |
|---|---|
| `getCreditLedger()` | Returns last 100 transactions; seeds demo ledger if empty |
| `getCreditSummary()` | Calls `syncBillingMonth()` first; returns balance, plan, low/critical flags |
| `spendCredits(amount, label, mode?)` | Fails if insufficient; increments `creditsUsedThisMonth`; pushes tx; fires event |
| `addCredits(amount, label, kind?)` | Adds balance; auto-upgrades free→payg on purchase |
| `syncBillingMonth()` | On new calendar month: reset usage; free plan gets `freeMonthlyCredits` grant |
| `formatCreditAmount(amount)` | `+5` or `−2` display |
| `transactionKindLabel(kind)` | Purchase / Usage / Monthly grant / … |

**Event:** `window.dispatchEvent(new CustomEvent("creatorautopilot-credits-changed"))`  
**Listeners:** CreditBadge, CreditOverview, UserMenu balance.

### 4.4 `credit-estimates.ts`

| Function | Purpose |
|---|---|
| `getUpcomingCreditEstimates()` | Maps `automations[]` from mock-data to daily credit burn per pipeline |
| `getTotalDailyCreditBurn()` | Sum of active + scheduled pipelines |
| `getDaysUntilEmpty(balance)` | `floor(balance / dailyBurn)` or null |

Uses global user add-on settings (`shieldBlendEnabled`, `titleSparkEnabled`) from `getUserSettings()`.

### 4.5 `credit-packs.ts`

Defines pack IDs, credit amounts, USD prices for checkout. Referenced by `/pricing` and checkout page.

### 4.6 `orders-store.ts` (`"use client"`)

| Function | Behavior |
|---|---|
| `getCreditOrders()` | All orders (seeded + user purchases) |
| `getCreditOrderById(id)` | By id or orderNumber |
| `completeCreditCheckout(input)` | **Requires** `termsAccepted && nonRefundableAcknowledged`; calls `addCredits`; saves order with balance before/after |

**Order number format:** `CA-YYYYMMDD-####` (random 4 digits).

### 4.7 `user-store.ts` (`"use client"`)

| Key | Interface | Defaults |
|---|---|---|
| `creatorautopilot-profile` | UserProfile | Alex Rivera |
| `creatorautopilot-settings` | UserSettings | add-ons off, defaultPeriod=all |
| `creatorautopilot-billing` | UserBilling | free, 120 credits, 150/mo allowance |

| Function | Purpose |
|---|---|
| `getUserProfile()` / `saveUserProfile()` | Profile CRUD |
| `getUserSettings()` / `saveUserSettings()` | Settings merge with DEFAULT_SETTINGS |
| `getUserBilling()` / `saveUserBilling()` | Billing merge with DEFAULT_BILLING |
| `CONTENT_ENGINE_CONNECT` | 6 engines for ConnectAccountModal — ASMR/Story href includes `?add=1` |

### 4.8 `destination-groups.ts`

| Function | Purpose |
|---|---|
| `createDestinationGroup(label?)` | New group with unique id, empty accountIds |
| `normalizeDestinationGroups(groups?, accountIds?, label?)` | Migrate legacy flat accountIds to groups |
| `flattenGroupAccountIds(groups)` | All account IDs across groups |
| `totalConnectorsInGroups(groups)` | Sum of connectors |
| `syncConfigDestinations(config, groups)` | Writes both `destinationGroups` and flat `destinationAccountIds` |

### 4.9 `account-groups.ts`

**Purpose:** Build dashboard `ContentAccountGroup[]` from mock accounts.

| Function | Returns |
|---|---|
| `getCrossPostGroups()` | Cross-posting publishing groups |
| `getPodcastGroups()` | Podcast groups |
| `getMovieGroups()` | Movie Explainer groups |
| `getChannelRemixGroups()` | Channel Remix groups |
| `getAsmrGroups()` | ASMR template groups |
| `getStoryGroups()` | Story project groups |

**`buildGroup()` logic:**
- Aggregates views, earnings (non-monetized → $0), avg engagement across members
- Builds `GroupConnector[]` with per-platform detailHref
- Reads duration from config (`videoDuration` or `clipDuration`)
- Computes `viewsTrend` from primary account

### 4.10 `monetization-criteria.ts`

| Function | Logic |
|---|---|
| `monetizationProgress(criteria)` | Counts required criteria + one slot per optionalGroup (any met in group counts) |
| `primaryMonetizationCriterion(criteria)` | First unmet required, else first unmet optional group member — used for ring display |

**YPP optional group:** `optionalGroup: "ypp_watch_path"` — watch hours (4K/12mo) OR Shorts views (10M/90d); only one path required.

### 4.11 `ai-intelligence.ts`

| Function | Returns |
|---|---|
| `getAiPageScore(accountId, mode)` | AiPageScore — 0–100, grade A–D, changePct, summary |
| `getAiMemory(accountId, mode)` | AiMemory — learnings[], verdict, topPerformers[], underPerformers[] |
| `getBrainstormSuggestions(accountId, mode)` | BrainstormSuggestion[] — ASMR/Story = video ideas; others = title/desc/tag improvements |
| `getAiVideoAnalytics(video, mode)` | AiVideoAnalytics — report + checks (checks not shown in UI) |

**Date parsing (`parseDateString`):** Handles ISO, `"2 hours ago"`, `"Scheduled · Jun 26, 2026 · 6:00 PM"`, returns null for `"Pending"`. Never call `.toISOString()` on invalid Date.

**Report schedule (backend logic only):** 6h → 24h → day2 → day3 → day4 after publish. UI shows report when elapsed ≥ 6h; no timeline displayed.

**Visual analysis:** Included in report when `mode ∈ ["asmr", "story"]`.

### 4.12 `search-index.ts`

| Function | Behavior |
|---|---|
| `getSearchIndex()` | Cached flat list: static pages + all accounts + all videos |
| `searchAll(query, limit=12)` | Case-insensitive match on title, subtitle, mode |

Indexed at build/read time from mock-data account and clip getters.

### 4.13 `movie-jobs.ts`

**Purpose:** Background movie upload queue simulation.

| Export | Purpose |
|---|---|
| `MOVIE_JOBS_STORAGE_KEY` | `"creatorautopilot-movie-jobs"` |
| `getMovieJobs()` | Read jobs from localStorage |
| `createMovieJob(input)` | Starts job with journey steps from JOURNEY_PIPELINES.movie |
| `tickMovieJobs()` | Advances steps on interval; generates clip previews at Clipping step |
| `subscribeMovieJobs(cb)` | Listener for upload queue UI updates |

**Clip preview generation:** Starts at step index 4 (Clipping); one clip every `CLIP_DELAY_MS`; titles from `movie_name` or `random` mode.

### 4.14 `dashboard-analytics.ts`

Aggregates all 18 connected channels across 6 modes for Dashboard and `/analytics`. Exports KPI totals, platform breakdown, best channels, top videos, niche opportunities, combined views trend.

### 4.15 `admin-store.ts` (`"use client"`)

**Never import from Server Components.**

| Getter / Setter | Key | Default source |
|---|---|---|
| `getAdminEngines()` / `saveAdminEngines()` | admin-engines | DEFAULT_ADMIN_ENGINES |
| `getAdminCreditPricing()` / `saveAdminCreditPricing()` | admin-pricing | DEFAULT_CREDIT_PRICING + migrateCreditPricing() |
| `getAdminAsmrTemplates()` / `saveAdminAsmrTemplates()` | admin-asmr-templates | from mock asmrTemplates + masterPrompt |
| `getAdminUsers()` / `saveAdminUsers()` | admin-users | ADMIN_USERS |
| `getUserEngineOverrides(userId)` | admin-user-engine-overrides | per-user map |
| `getUserAddonPrefs(userId)` | admin-user-addon-prefs | DEFAULT_USER_ADDON_PREFS |
| `getAdminUserById(id)` | — | lookup in users list |
| `getAdminUserAccountById(accountId)` | — | from ADMIN_USER_ACCOUNTS |

**Migration:** `migrateCreditPricing()` upgrades old localStorage shapes (removes addon costs from `costs`, ensures cross-post per_clip entry).

### 4.16 `admin-data.ts`

Seed data and `DEFAULT_*` constants:

- `DEFAULT_CREDIT_PRICING` — costs, durationTiers, connectorSurcharges, addonCredits, clipBundles, freeMonthlyCredits
- `DEFAULT_MONETIZATION_RULES` — YPP with Shorts 10M/90d alternate path
- `ADMIN_USERS`, `ADMIN_USER_ACCOUNTS` — demo users with linkedMockAccountId for analytics embed
- `getAdminDashboardMetrics(period)` — KPIs scaled by AdminDashboardPeriod
- `getAdminViralVideos(period)`, `getAdminViralChannels(period)`

### 4.17 `admin-user-analytics.ts`

Resolves `AdminUserAccount.linkedMockAccountId` → full mock account/page for embedding creator analytics components in admin.

### 4.18 `mock-data.ts`

**Purpose:** All demo accounts, videos, niches, automations, competitors. Largest file (~156KB).

**Key getters (non-exhaustive):**

| Getter | Returns |
|---|---|
| `crossPostPages`, `crossPostVideos` | Cross-posting accounts + videos |
| `getCrossPostPageById(id)` | Single page |
| `getCrossPostVideoById(pageId, videoId)` | Single video |
| `podcastAccounts`, `getPodcastClipsByAccountId(id)` | Podcast |
| `movieAccounts`, `getMovieClipsByAccountId(id)` | Movie Explainer |
| `channelRemixAccounts`, `getChannelRemixClipsByAccountId(id)` | Channel Remix |
| `asmrAccounts`, `asmrTemplates`, `getAsmrClipsByAccountId(id)` | ASMR |
| `storyAccounts`, `getStoryClipsByAccountId(id)` | Story |
| `searchNicheVideosLocal(filters)` | Client-side niche search |
| `generateMasterPrompterResult(input)` | Master Prompter mock AI output |

**Baseline assumption:** Metrics stored as 30-day values; always pass through `scaleForPeriod` for display.

---

## 5. UI components — contracts

### 5.1 Layout

| Component | File | Contract |
|---|---|---|
| `Sidebar` | layout/Sidebar.tsx | Fixed `w-64`, sections from NAV in constants.ts, Connect account footer |
| `TopBar` | layout/TopBar.tsx | title, subtitle props; GlobalSearch + CreditBadge + UserMenu |
| `GlobalSearch` | layout/GlobalSearch.tsx | Calls `searchAll()`; ⌘K/Ctrl+K; navigates via router |
| `CreditBadge` | layout/CreditBadge.tsx | Listens `creatorautopilot-credits-changed`; links /pricing |
| `UserMenu` | layout/UserMenu.tsx | Profile, Settings, Pricing, Admin panel, Sign out |

### 5.2 SideDrawer

File: `shared/SideDrawer.tsx`

**Must** portal to `document.body` via `createPortal`. Props: `open`, `onClose`, `title`, `children`. Fixed right panel `max-w-lg`, sticky header, backdrop click closes.

Used by: all mode settings, AI Memory, Brainstorm.

### 5.3 Form system

Styles: `lib/form-styles.ts` — shared Tailwind class strings.

| Component | Props | Notes |
|---|---|---|
| `Input` | label, value, onChange, placeholder, type | Blue focus ring |
| `Select` | label, value, onChange, options | Same styling |
| `TextArea` | label, value, onChange, rows | Same styling |
| `Toggle` / `ToggleRow` | checked, onChange, label, description | Pill switch, white knob |
| `NumberStepper` | value, onChange, min, max | Value left, ± buttons right |
| `TimePicker` | value (HH:MM), onChange | Scroll columns with `.od-scroll`; 12h display |
| `VoiceArtistPicker` | artists, selectedId, onSelect, tone?, pitch? | Preview + sliders |
| `ReferenceChannelsField` | channels, onChange | PlatformUrlField per row + Add more |
| `ScheduleEditor` | config slice | postsPerDay, fixed/weekly, TimePicker grid |
| `PlatformUrlField` | platform, value, onPlatformChange, onChange | z-[100] dropdown, pointerdown outside close |

### 5.4 Charts — ComparisonChart

File: `cross-posting/TrendChart.tsx`

```typescript
interface ComparisonChartProps {
  title: string;
  data: TimeSeriesPoint[];           // current period
  comparison?: TimeSeriesPoint[];    // previous period
  height?: number;
  variant?: "bar" | "line";
  valueFormat?: "number" | "percent" | "currency";  // NOT a function prop
  changePct?: number;
}
```

**Rendering rules:**
- Y-axis = HTML text elements (never SVG text with preserveAspectRatio="none")
- Bar height = pixel math from max value (never nested % in flex items-end)
- Line charts: solid current, dashed comparison, area fill under current
- Mobile: horizontal scroll when ≥6 points; tap for tooltip

**Chart assignment (account pages):**

| Metric | variant |
|---|---|
| Views, Impressions, Watch time | line |
| Engagement, Earnings, Subs/Followers gained | bar |

### 5.5 EngineAccountGroupCard

File: `shared/EngineAccountGroupCard.tsx`

**Layout:** 2 cards per row (`lg:grid-cols-2`).

**Header:** Group name (plain text, NOT clickable).

**KPI row:** Combined Views, Engagement, Platforms count, Earnings — hover shows per-platform breakdown tooltip.

**Platform row:** Always 3 cards (YouTube, TikTok, Facebook):
- Connected → clickable → `connector.detailHref`
- Empty → "Connect [Platform]" button → mode setup URL

**Footer:** credits/day from `getEngineCreditBreakdown()`.

### 5.6 EngineDailyCreditEstimate

File: `shared/EngineDailyCreditEstimate.tsx`

Props: `EngineCreditEstimateInput` + optional `showBalance`. Renders per-group breakdown, total daily/weekly/monthly, rate label, days-until-empty from current balance.

### 5.7 CrossPostVideoDetailClient

File: `cross-posting/CrossPostVideoDetailClient.tsx`

**Reused by all modes** for video/clip analytics.

| Prop | Purpose |
|---|---|
| `page` | Account/page object |
| `video` | CrossPostVideo-compatible clip |
| `backHref` | Back navigation |
| `showSourcePage` | false for Story, ASMR, Movie Explainer |
| `productMode` | ProductMode for AI panels |
| `embedOptions?` | Admin compact/readOnly embed |

**Sections:** header, 8 metrics, charts, retention SVG, sidebar panels, VideoAiAnalyticsPanel.

YouTube only: description + tags block below title.

### 5.8 Account detail clients

Each mode has `*AccountDetailClient.tsx` following the same structure:

1. AccountIntelligenceBar (Memory, Brainstorm, Settings)
2. PeriodSelector
3. 7 KPI cards (6 + AiScoreCard)
4. Layout branch on `page.monetized`
5. Charts grid
6. Bottom content panel (mode-specific)

| Mode | Bottom panel component |
|---|---|
| Cross-posting | PostedVideosPanel (flat) |
| Podcast | PodcastClipsBySourcePanel (columns by podcast) |
| Movie Explainer | MovieClipsBySourcePanel (columns by movie) |
| Channel Remix | ChannelRemixClipsBySourcePanel (columns by source channel) |
| ASMR | PostedVideosPanel (flat, "Latest posts") |
| Story | StoryClipsByStoryPanel (columns by story project) |

### 5.9 MonetizationCriteriaPanel

File: `cross-posting/MonetizationCriteriaPanel.tsx`

Props: `criteria[]`, `platform`, `programName`, `fullWidth?`, `compact?`.

Compact card: max-w-xs by default; `fullWidth` for equal grid column width. Progress ring on primary unmet criterion.

---

## 6. Routes and pages

### 6.1 Marketing and auth

| Route | Component | Behavior |
|---|---|---|
| `/` | MarketingHomepage | Hero, 6 engines, AI, pricing preview, FAQ, animations |
| `/login` | login/page | Demo form → router.push("/dashboard") |
| `/signup` | signup/page | Demo form → /dashboard |
| `/forgot-password` | forgot-password/page | Demo reset flow |

### 6.2 Creator — Overview

| Route | Component | Data source |
|---|---|---|
| `/dashboard` | DashboardClient | dashboard-analytics.ts, credit-ledger.ts |
| `/analytics` | AnalyticsClient | All 18 channels aggregated |

**Legacy redirects:** `/monetization` → `/analytics`; `/automations`, `/competitors`, `/insights`, `/activity` → `/dashboard`.

### 6.3 Discover

| Route | Component | Credit spend |
|---|---|---|
| `/niche-analyzer` | niche-analyzer/page | `spendCredits(getBaseActionCredits("niche-analyzer"))` on Run |
| `/niche-analyzer/master-prompter` | master-prompter/page | `spendCredits(getBaseActionCredits("master-prompter"))` on generate |

### 6.4 Content engines

Standard routes per mode:

```
/{mode}                          Landing or dashboard
/{mode}/[id]                     Account detail
/{mode}/[id]/videos/[videoId]    Video detail
```

Special routes:

| Route | Purpose |
|---|---|
| `/movie-explainer/uploads` | Movie upload queue |
| `/asmr/setup`, `/asmr/setup/wizard` | ASMR page-based setup |
| `/story/setup`, `/story/setup/wizard`, `/story/new` | Story setup flows |

### 6.5 Account and billing

| Route | localStorage |
|---|---|
| `/profile` | creatorautopilot-profile |
| `/settings` | creatorautopilot-settings |
| `/pricing` | displays packs; reads billing |
| `/pricing/checkout` | completeCreditCheckout on submit |
| `/pricing/thank-you` | reads order by query param |
| `/accounts/connect` | opens ConnectAccountModal, redirects |

### 6.6 Admin routes

See §12. All under `app/(admin)/admin/`. Layout: amber accent, AdminSidebar, mobile hamburger.

---

## 7. Content engines — full specification

### 7.1 Cross-posting (`/cross-posting`)

**Setup flag:** `creatorautopilot-crosspost-setup`  
**Config keys:** `creatorautopilot-crosspost-config`, `creatorautopilot-crosspost-page-config:{pageId}`

**Wizard steps:**

| Step | ID | Fields |
|---|---|---|
| 1 | sources | PlatformUrlField + source URL/handle, Add more, Continue while typing |
| 2 | upload-order | Channel Marathon (sequential) vs Round Robin Mix |
| 3 | schedule | NumberStepper posts/day; fixed times OR weekly grid (ScheduleEditor) |
| 4 | connect | DestinationAccountGroups (3 platform slots), ShieldBlend, TitleSpark, Connect buttons per platform |

**Settings drawer:** postingEnabled toggle, add/remove sources, upload mode, schedule, ShieldBlend, TitleSpark.

**Dashboard groups:** `getCrossPostGroups()` — Creator Clips Network, Starter Shorts Lab.

**Demo IDs:** cp-yt-1/2, cp-tt-1/2, cp-fb-1/2 (2 monetized + 3 non-monetized mix).

**Pipeline:** Schedule → Queue → Publish → Verify

### 7.2 Podcast (`/podcast`)

**Setup flag:** `creatorautopilot-podcast-setup`  
**Config key:** `creatorautopilot-podcast-config:{id}`

**Wizard steps:**

| Step | Fields |
|---|---|
| 1 | YouTube podcast URLs (PlatformUrlField, Add more) |
| 2 | Max clips per podcast (1–20 NumberStepper), duration, caption style, format |
| 3 | Schedule |
| 4 | DestinationAccountGroups + ShieldBlend + TitleSpark |

**Bottom panel:** PodcastClipsBySourcePanel — columns grouped by podcast name (JRE, Lex Fridman, etc.). Pagination 10, search, viral filter, sort.

**Pipeline:** Download → Transcript → Find viral moments → Cuts → Render → Post

### 7.3 Movie Explainer (`/movie-explainer`)

**Setup flag:** `creatorautopilot-movie-setup`  
**Config key:** `creatorautopilot-movie-config:{id}`  
**Jobs key:** `creatorautopilot-movie-jobs`

**Wizard steps:**

| Step | Fields |
|---|---|
| 1 | Connect destination groups |
| 2 | Video length, videos per movie, dimension, subtitles, tone, ShieldBlend, TitleSpark |
| 3 | Schedule |
| 4 | VoiceArtistPicker + tone/pitch + explain language |

**Upload flow (MovieUploadModal):**

1. Select destination account(s)
2. Movie name (required) + file upload
3. Title mode: `movie_name` vs `random` (TitleSpark)
4. Movie language + explain language
5. Process → job in localStorage → can leave screen
6. View queue at `/movie-explainer/uploads` — clip count, 9:16 previews, journey stepper

**Bottom panel:** MovieClipsBySourcePanel — columns by movie title.

**Pipeline:** Upload → Transcribe → AI story → Voice → Clipping → ShieldBlend → Schedule → Render → Post

### 7.4 Channel Remix (`/channel-remix`)

**Setup flag:** `creatorautopilot-channel-remix-setup`  
**Config key:** `creatorautopilot-channel-remix-config:{id}`

**Wizard steps:**

| Step | Fields |
|---|---|
| 1 | Niche: gaming OR movie_explain + source channel URLs |
| 2 | Upload order (Marathon / Round Robin) |
| 3 | Clip length, dimension, subtitles, narration tone, ShieldBlend, TitleSpark |
| 4 | Schedule |
| 5 | Connect groups + VoiceArtistPicker |

**Bottom panel:** ChannelRemixClipsBySourcePanel — columns by source channel.

**Pipeline:** Download → Transcribe → Rescript → Voiceover → ShieldBlend → Schedule → Render → Post

### 7.5 ASMR (`/asmr`)

**Setup flag:** `creatorautopilot-asmr-setup`  
**Config key:** `creatorautopilot-asmr-config:{id}`

**No ShieldBlend or TitleSpark** in ASMR wizard or settings.

**First visit:** Template grid from `getAdminAsmrTemplates()` (admin CRUD + user custom templates).

**Setup routes (page-based, NOT modal):**

| Route | Purpose |
|---|---|
| `/asmr/setup?add=1` | Template picker for Add account |
| `/asmr/setup/wizard?template=…` | 4-step wizard |

**Wizard steps:**

| Step | Fields |
|---|---|
| 1 | videos/month, duration (15–120s), caption, transitions, video style, reference channels |
| 2 | natural_only vs voiceover; master prompt; VoiceArtistPicker if voiceover |
| 3 | Schedule |
| 4 | DestinationAccountGroups — Connect per platform |

**Bottom panel:** PostedVideosPanel — flat "Latest posts" list.

**Pipeline:** Idea generation → Story → Voiceover → Video prompts → Generate → Merge → Render

### 7.6 Story (`/story`)

**Setup flag:** `creatorautopilot-story-setup`  
**Config key:** `creatorautopilot-story-config:{id}`  
**Projects key:** `creatorautopilot-story-projects`

**Story kinds:**

| Kind | Setup flow |
|---|---|
| narration | sub-type → reference channels → duration → visual/audio → voice → schedule → connect |
| documentary | sub-type → reference channels → duration (up to 5 min) → … |
| drama | character count → define each → generate portraits → premise → episode structure (continuous/standalone) → generate storyboard → visual/audio → voice → schedule → connect |

**Drama episode modes:**
- `continuous` — same arc across episodes
- `standalone` — new story each episode (regenerating storyboard clears on mode switch)

**Routes:** `/story/new` for Start new story on existing account.

**Bottom panel:** StoryClipsByStoryPanel — columns by story project.

**Pipeline:** Storyboard → Script → Voice → Scene gen → Merge → Render → Post

---

## 8. Credit and billing system

### 8.1 Plans

| Plan | ID | Behavior |
|---|---|---|
| Free | `free` | 150 credits/month (admin-configurable); auto-grant on calendar month via syncBillingMonth |
| Pay as you go | `payg` | Buy credit packs; no monthly reset of balance |

Purchasing any pack sets plan to `payg`.

### 8.2 Pricing categories (admin)

**File:** `DEFAULT_CREDIT_PRICING` in admin-data.ts, edited at `/admin/pricing`, stored in `creatorautopilot-admin-pricing`.

| Category | Field | Example |
|---|---|---|
| Fixed actions | `costs[]` category=`base` | niche-analyzer=2, master-prompter=5 |
| Per-video | `costs[]` category=`per_clip` | cross-posting=2 credits/video |
| Duration tiers | `durationTiers[]` | podcast/movie/remix/asmr/story × 15/30/60/90/120s |
| Connector surcharge | `connectorSurcharges[]` | +1 cross-post, +2 podcast per extra destination |
| Add-on bundles | `addonCredits[]` | ShieldBlend 1=10 clips, TitleSpark 1=5 posts, etc. |

**Removed from pricing UI:** voiceover surcharges, upload size surcharges. User opts into add-ons in `/settings`.

### 8.3 Add-on billing model

Add-ons are **opt-in** in user Settings (and overridable per user in admin). Global platform settings can disable ShieldBlend/TitleSpark entirely.

Per-clip add-on cost when enabled:

```
addonPerClip = addon.credits / addon.unitsPerCredit
```

Example: ShieldBlend 1 credit = 10 clips → 0.1 credits per clip.

### 8.4 Actions that spend credits (wired)

| UI action | Function call |
|---|---|
| Niche Analyzer → Run analysis | `spendCredits(getBaseActionCredits("niche-analyzer"), …)` |
| Master Prompter → Analyze/generate | `spendCredits(getBaseActionCredits("master-prompter"), …)` |
| Checkout → Pay | `completeCreditCheckout()` → `addCredits()` |

Pipeline renders (podcast clip, cross-post publish, etc.) show **estimates only** until backend wiring calls `spendCredits` on job completion.

### 8.5 Checkout legal requirements

Both must be `true` before Pay button enables:

1. `termsAccepted` — Terms & Conditions + Privacy Policy
2. `nonRefundableAcknowledged` — credits non-refundable

Stored on `CreditOrder` record for admin audit.

### 8.6 Dashboard credit UI

**CreditOverview** (`dashboard/CreditOverview.tsx`) — three panels:

1. Balance + monthly usage bar (free plan) + low/critical warnings
2. Pipeline forecast from `getUpcomingCreditEstimates()`
3. Recent transactions from `getCreditLedger().slice(0, 5)`

---

## 9. Analytics and period scaling

### 9.1 Period selector

Default: **All time** everywhere (dashboard, account pages, video pages, cross-posting overview).

Changing period triggers re-render with scaled values — no server fetch.

### 9.2 Account page layout branches

**Monetized (`page.monetized === true`):**

```
[KPI × 7 including AI Score]
[Secondary stats row]
[Charts 2-col grid × 6]
[Traffic sources | Top countries]
[Bottom content panel]
```

**Non-monetized:**

```
[KPI × 7 — earnings forced $0]
[MonetizationCriteria | Traffic sources | Top countries]  ← 3-col row
[Secondary stats row]
[Charts — Views/Impressions line; Engagement/Earnings/Watch/Subs bar]
[Bottom content panel]
```

Earnings = `$0` everywhere when `monetized === false` regardless of stored mock value.

### 9.3 Video metrics displayed

Views, Viewers (unique), Engagement rate, Estimated earnings, Subscribers/Followers gained, Impressions, Reach, Avg watch duration, Retention curve, Traffic sources, Demographics (country, age, gender), Device breakdown, Engagement breakdown (likes, comments, shares, saves).

Platform label: YouTube = Subscribers; TikTok/Facebook = Followers.

### 9.4 PostedVideosPanel / column panels

Shared toolbar: search by title, viral score filter, sort (newest, views, engagement, viral score), pagination 10 per page.

---

## 10. Monetization logic

### 10.1 Platform programs

| Platform | Program | Criteria |
|---|---|---|
| YouTube | YouTube Partner Program | 1K subs; **4K watch hours (12mo) OR 10M Shorts views (90d)**; policy compliance |
| TikTok | TikTok Creativity Program | Followers + views thresholds (admin-editable) |
| Facebook | Facebook Reels monetization | Followers + engagement thresholds |

### 10.2 Optional group OR logic

```typescript
// monetizationProgress()
for each criterion:
  if optionalGroup:
    group members together
    slot counts as MET if ANY member.met === true
  else:
    required — must be met individually

allMet = metCount === totalCount
```

YouTube watch hours and Shorts views share `optionalGroup: "ypp_watch_path"`.

### 10.3 Admin monetization rules

`/admin/monetization` edits `creatorautopilot-admin-monetization`. YouTube Shorts views target default: **10,000,000 in 90 days**.

---

## 11. AI intelligence

### 11.1 Feature matrix

| Feature | Trigger | UI location | Mode-specific |
|---|---|---|---|
| AI Score | Page load | 7th KPI card on account pages | All modes |
| AI Memory | User click | SideDrawer | All modes |
| Brainstorm | User click | SideDrawer | ASMR/Story → video ideas; others → metadata/script |
| Video AI Analytics | 6h+ after publish | Sidebar on video detail | All modes; visual analysis for ASMR/Story |

### 11.2 AI Memory contents

- Accumulated learnings (hooks, pacing, audience patterns)
- Final verdict paragraph
- Top performers + underperformers (from mock video history)
- Competitor influence notes

### 11.3 Brainstorm output types

```typescript
interface BrainstormSuggestion {
  id: string;
  title: string;
  description: string;
  rationale: string;
  tags?: string[];
  priority: "high" | "medium" | "low";
}
```

ASMR/Story: upcoming video concepts from memory + reference channels + history.  
Other modes: title, description, tag, script improvement suggestions.

### 11.4 Video AI Analytics report structure

```typescript
interface AiVideoAnalyticsReport {
  overallVerdict: "strong" | "mixed" | "underperforming";
  performanceScore: number;
  summary: string;
  whyItWorked: string[];
  whyItUnderperformed: string[];
  skipPoints: { time: string; reason: string; transcriptExcerpt?: string }[];
  transcriptAnalysis: string;
  visualPromptAnalysis?: string;  // ASMR/Story only
  titleAnalysis: string;
  descriptionAnalysis: string;
  tagsAnalysis: string;
  recommendations: string[];
}
```

**UI:** Collapsed header shows score or "Pending". Expanded shows full report. Schedule timeline intentionally hidden.

### 11.5 User settings gating add-ons

| Setting key | Add-on billed |
|---|---|
| shieldBlendEnabled | addon-shieldblend |
| titleSparkEnabled | addon-titlespark |
| aiVideoAnalyticsEnabled | addon-video-analytics |
| brainstormEnabled | addon-brainstorm |
| aiScoreRefreshEnabled | addon-ai-score |

Admin can override per user on `/admin/users/[id]` → User add-on preferences.

---

## 12. Admin panel

### 12.1 Navigation (`ADMIN_NAV` in admin-constants.ts)

| Group | Routes |
|---|---|
| Overview | /admin, /admin/analytics |
| Users & billing | /admin/users, /admin/orders |
| Platform | /admin/pricing, /admin/engines, /admin/monetization, /admin/ai, /admin/settings |
| Content | /admin/asmr-templates, /admin/voice-artists, /admin/pipelines |
| System | /admin/logs |

### 12.2 Admin dashboard (`/admin`)

**Period filter:** Today | Yesterday | 7d | 30d | 90d | All time

**KPIs (scale with period):** users, active pipelines, revenue, credits used, views, videos posted

**Sections:** active pipelines preview, audit log preview, top viral videos, top viral channels

### 12.3 Admin users

**List (`/admin/users`):** search, suspend/reactivate, plan badge, credits.

**Detail (`/admin/users/[id]`) — layout:**

```
Row 1: [Account settings] [User add-on preferences]
Row 2: [Engine access & special pricing — full width 3-col grid]
Row 3: [User analytics overview — KPIs + charts]
Row 4: [Connected channels table → click opens channel analytics]
Row 5: [All videos list → click opens video analytics]
```

**Engine override UI (`EnginePricingOverrideFields.tsx`):**

| engineId pricing kind | Editable fields |
|---|---|
| niche-analyzer, master-prompter | customBaseCredits |
| cross-posting | global 2 credits/video shown; customConnectorSurcharge |
| podcast, movie-explainer, channel-remix, asmr, story | customDurationCredits map + customConnectorSurcharge |
| all | access: default/hidden/disabled/coming_soon |

**Do NOT show duplicate "Channels — open full analytics" card list** — table in analytics overview is canonical.

### 12.4 Admin embed analytics

**Channel:** `/admin/users/[id]/accounts/[accountId]`

```typescript
// AdminUserAccountPageClient (client component)
const user = getAdminUserById(id);
const account = getAdminUserAccountById(accountId);
const mockPage = resolveMockAccount(account.linkedMockAccountId);
// Renders CrossPostPageDetailClient | PodcastAccountDetailClient | … with:
embedOptions={{ compact: true, readOnly: true, backHref, videoHref }}
```

**Video:** `/admin/users/[id]/accounts/[accountId]/videos/[videoId]` — same pattern with CrossPostVideoDetailClient.

`compact: true` hides duplicate back link and AccountIntelligenceBar.

### 12.5 Admin pricing (`/admin/pricing`)

Sections: Free tier allowance, Credit packs USD, Fixed actions, Per-video publish, Duration tiers (per mode), Extra destination surcharges, Anti-ban add-ons (bundle rates), AI add-ons (bundle rates).

Helper text: `formatAddonBundleRate()` → `"1 credit = 10 clips"`.

### 12.6 Admin engines (`/admin/engines`)

Enable/disable toggles only. No credit fields. Pricing lives in /admin/pricing; per-user overrides on user detail.

### 12.7 Admin ASMR templates

Fields: title, category, thumbnail URL, enabled, sortOrder, **masterPrompt** (multi-line).

Saved to `creatorautopilot-admin-asmr-templates`. User grid at `/asmr` reads via `getAdminAsmrTemplates()`.

### 12.8 Admin orders (`/admin/orders`)

Displays `CreditOrder[]` from orders-store. Detail drawer: orderNumber, customer, pack, credits, USD, status, termsAccepted, nonRefundableAcknowledged, balanceBefore, balanceAfter, cardLast4.

### 12.9 Admin platform settings

Maintenance mode, signups enabled, max upload MB, support email, global ShieldBlend/TitleSpark enabled flags.

---

## 13. Events and persistence keys

### 13.1 Custom events

| Event | Fired by | Listeners |
|---|---|---|
| `creatorautopilot-credits-changed` | credit-ledger spend/add/sync | CreditBadge, CreditOverview, UserMenu |
| `creatorautopilot-orders-changed` | orders-store completeCreditCheckout | AdminOrdersClient (if mounted) |

### 13.2 Creator localStorage keys

| Key | Schema | Purpose |
|---|---|---|
| `creatorautopilot-crosspost-setup` | boolean string | First visit flag |
| `creatorautopilot-crosspost-config` | CrossPostPageConfig JSON | Last wizard state |
| `creatorautopilot-crosspost-page-config:{id}` | CrossPostPageConfig | Per-page settings |
| `creatorautopilot-podcast-setup` | boolean | First visit |
| `creatorautopilot-podcast-config:{id}` | PodcastConfig | Per-account |
| `creatorautopilot-movie-setup` | boolean | First visit |
| `creatorautopilot-movie-config:{id}` | MovieExplainerConfig | Per-account |
| `creatorautopilot-movie-jobs` | MovieProcessingJob[] | Upload queue |
| `creatorautopilot-channel-remix-setup` | boolean | First visit |
| `creatorautopilot-channel-remix-config:{id}` | ChannelRemixConfig | Per-account |
| `creatorautopilot-asmr-setup` | boolean | First visit |
| `creatorautopilot-asmr-config:{id}` | AsmrConfig | Per-account |
| `creatorautopilot-story-setup` | boolean | First visit |
| `creatorautopilot-story-config:{id}` | StoryConfig | Per-account |
| `creatorautopilot-story-projects` | StoryProject[] | Drama/story projects |
| `creatorautopilot-profile` | UserProfile | |
| `creatorautopilot-settings` | UserSettings | |
| `creatorautopilot-billing` | UserBilling | |
| `creatorautopilot-credit-ledger` | CreditTransaction[] | |
| `creatorautopilot-credit-month` | `"YYYY-MM"` | Last monthly sync |
| `creatorautopilot-credit-orders` | CreditOrder[] | |

### 13.3 Admin localStorage keys

| Key | Schema |
|---|---|
| `creatorautopilot-admin-engines` | AdminEngineConfig[] |
| `creatorautopilot-admin-asmr-templates` | AdminAsmrTemplate[] |
| `creatorautopilot-admin-voices` | AdminVoiceArtist[] |
| `creatorautopilot-admin-monetization` | AdminMonetizationRule[] |
| `creatorautopilot-admin-pricing` | AdminCreditPricing |
| `creatorautopilot-admin-ai` | AdminAiSettings |
| `creatorautopilot-admin-platform` | AdminPlatformSettings |
| `creatorautopilot-admin-users` | AdminUser[] |
| `creatorautopilot-admin-user-engine-overrides` | Record<userId, AdminUserEngineOverride[]> |
| `creatorautopilot-admin-user-addon-prefs` | Record<userId, AdminUserAddonPrefs> |

---

## 14. Known constraints and past bugs

### 14.1 Do not reintroduce

| Bug | Cause | Fix |
|---|---|---|
| Empty chart bars | `%` height inside flex `items-end` | Pixel height from max value |
| Garbled Y-axis | SVG text stretched | HTML text labels |
| Runtime: function prop | Server → Client function | `valueFormat` enum on ComparisonChart |
| Invalid time value | `.toISOString()` on bad date | `parseDateString()` + guards in ai-intelligence.ts |
| Settings modal center | SideDrawer inside scrollable main | Portal to document.body |
| getAdminUserById server error | admin-store is client-only | Client wrapper page components |
| Hydration mismatch on body | Browser extensions | suppressHydrationWarning on html/body |
| ++2 extra/clip display | Double prefix in string concat | Single `+` in connector label |

### 14.2 Mobile requirements

- Sidebar fixed; main `lg:pl-64`
- KPI grid: 2 cols mobile → 7 cols desktop
- AccountIntelligenceBar: 3-col button grid on mobile
- Charts: horizontal scroll when dense; touch tooltips
- Niche Analyzer: filters open by default on mobile
- Analytics channel table → card list on mobile
- Non-monetized 3-col row stacks vertically on mobile

### 14.3 ASMR-specific rules

- No ShieldBlend/TitleSpark in wizard or settings
- Duration only: 15, 30, 60, 90, 120 seconds
- Setup is page-based (`/asmr/setup/wizard`), not modal
- Custom templates require masterPrompt min 12 chars

---

## 15. Backend integration guide

### 15.1 Replace mock data incrementally

| Layer | Current | Target |
|---|---|---|
| Accounts/videos | mock-data.ts getters | API routes + React Query |
| User profile/billing | user-store.ts localStorage | Auth provider + billing API |
| Admin | admin-store.ts localStorage | Admin API with real auth |
| Credits | credit-ledger.ts localStorage | Server-side ledger with idempotency |
| Niche search | searchNicheVideosLocal | POST /api/niche-analyzer/search |
| Master Prompter | generateMasterPrompterResult | Vision LLM API |
| Movie jobs | movie-jobs.ts tick simulation | WebSocket / polling job status |
| AI intelligence | ai-intelligence.ts hash seeds | Real analytics pipeline |

**Preserve:** function signatures consumed by components (`scaleForPeriod`, `getEngineCreditBreakdown`, `CrossPostVideoDetailClient` props).

### 15.2 Credit spend integration points

Call `spendCredits` (or server equivalent) when:

1. Niche analysis completes successfully
2. Master Prompter generation completes
3. Each pipeline job step completes (per clip at render/post)
4. Add-on runs (ShieldBlend clip processed, TitleSpark post generated, AI report generated)

Check user balance before starting job; reserve credits for long jobs if needed.

### 15.3 Auth

Current login/signup are demo redirects. Wire NextAuth, Clerk, or custom JWT. Protect `(dashboard)` and `(admin)` route groups. Admin routes require admin role claim.

### 15.4 Real OAuth for Connect account

Connect buttons simulate 1s delay then mark connected. Replace with platform OAuth (YouTube Data API, TikTok Content Posting API, Meta Graph API).

### 15.5 Admin pricing propagation

`getAdminCreditPricing()` is read on every credit estimate. When moving to server, cache pricing config and invalidate on admin save.

---

## 16. Extension checklist

When adding a **new content engine**:

- [ ] Add `ProductMode` union member in types.ts
- [ ] Add `{mode}-setup` and `{mode}-config:{id}` localStorage keys
- [ ] Add mock accounts + clips in mock-data.ts
- [ ] Add `get{Mode}Groups()` in account-groups.ts
- [ ] Create `{Mode}SetupWizard.tsx` with DestinationAccountGroups + EngineDailyCreditEstimate
- [ ] Create `{Mode}AccountDetailClient.tsx` + `{Mode}Dashboard` section in page.tsx
- [ ] Add duration tiers + connector surcharge in DEFAULT_CREDIT_PRICING
- [ ] Add engine toggle in DEFAULT_ADMIN_ENGINES
- [ ] Add to CONTENT_ENGINE_CONNECT, NAV in constants.ts, search-index.ts
- [ ] Add JOURNEY_PIPELINES entry
- [ ] Reuse CrossPostVideoDetailClient for video detail route
- [ ] Add admin user linkedMockAccountId entries if needed

When adding a **new KPI or chart**:

- [ ] Scale with `scaleForPeriod()`
- [ ] Use `changeForPeriod()` for badge
- [ ] Use `buildPeriodTrend()` for series
- [ ] ComparisonChart with serializable props only
- [ ] Gate earnings on `monetized`

When adding **admin features**:

- [ ] Never import admin-store from Server Components
- [ ] Add DEFAULT_* in admin-data.ts + getter/setter in admin-store.ts
- [ ] Add route under app/(admin)/admin/
- [ ] Add ADMIN_NAV entry

---

## Running locally

```bash
npm install --include=dev
npm run dev
```

| URL | Shell |
|---|---|
| http://localhost:3000 | Marketing |
| http://localhost:3000/dashboard | Creator app |
| http://localhost:3000/admin | Admin panel |

**Port conflicts:** Kill stale `node`/`next` processes. Only one dev server on port 3000.

**Offline fonts:** Geist fetch may fail; app falls back to system fonts.

---

*End of technical documentation. When behavior and this document diverge, treat the codebase as authoritative and update this file in the same PR.*
