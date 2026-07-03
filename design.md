# NicheScope — Design System

This document captures every design decision baked into the codebase so the visual language stays consistent across new features.

## 1. Design Philosophy

- **Style**: Clean analytics dashboard. Light, airy, data-forward.
- **Influences**: Linear / Vercel / Stripe dashboards — generous whitespace, restrained color, sharp typography.
- **Avoid**: Generic AI gradients (purple/indigo on white), default Inter-only hero pages, decorative shadows.
- **Tone**: Trustworthy, precise, fast.

## 2. Color Tokens

All colors live in `src/styles.css` as CSS custom properties and are exposed to Tailwind via `@theme inline`. **Never hardcode colors** (`text-white`, `bg-[#fff]`, etc.) in components — always use semantic tokens.

### Light theme (`:root`)

| Token | Value (oklch) | Usage |
|---|---|---|
| `--background` | `oklch(1 0 0)` | App background fallback |
| `--foreground` | `oklch(0.21 0.034 264.665)` | Primary text |
| `--surface` | `oklch(0.98 0.003 247.858)` | Body background (slate-50 feel) |
| `--surface-elevated` | `oklch(1 0 0)` | Elevated surfaces |
| `--card` / `--popover` | `oklch(1 0 0)` | Cards, popovers |
| `--card-foreground` | `oklch(0.21 0.034 264.665)` | Card text |
| `--primary` | `oklch(0.585 0.214 257.85)` (~`#3b82f6`) | Brand blue — CTAs, links, focus |
| `--primary-foreground` | `oklch(1 0 0)` | Text on primary |
| `--secondary` / `--muted` | `oklch(0.968 0.007 247.896)` (~`#f1f5f9`) | Subtle backgrounds, chips |
| `--muted-foreground` | `oklch(0.51 0.024 257)` | Secondary text, labels |
| `--accent` | `oklch(0.953 0.026 256)` | Hover wash |
| `--destructive` | `oklch(0.6 0.222 27.325)` | Errors |
| `--success` | `oklch(0.66 0.16 152)` | Positive scores |
| `--warning` | `oklch(0.74 0.17 70)` | Medium scores / challenges |
| `--border` / `--input` | `oklch(0.92 0.013 255.508)` | Hairlines, inputs |
| `--ring` | `oklch(0.585 0.214 257.85)` | Focus ring (matches primary) |

### Usage rules

- Score color logic: `>=70` → `text-[var(--color-success)]`, `>=45` → `text-[var(--color-warning)]`, else `text-destructive`.
- Chips / pills use `bg-primary/10 text-primary border-primary/20`.
- Destructive alerts use `border-destructive/30 bg-destructive/5 text-destructive`.

## 3. Typography

- **Font family**: `Inter` (loaded via `<link>` in `src/routes/__root.tsx`). System fallback chain in `--font-sans`.
- **Features enabled**: `cv11`, `ss01` (via `font-feature-settings` on `body`).
- **Smoothing**: `-webkit-font-smoothing: antialiased`.
- **Headings (h1–h4)**: `letter-spacing: -0.02em`, `font-semibold`.
- **Scale**:
  - Hero `h2`: `text-3xl sm:text-4xl font-semibold tracking-tight`
  - Section title: `text-xl font-semibold`
  - Card title: `text-sm font-semibold`
  - Stat value: `text-2xl font-semibold tracking-tight`
  - Metric value: `text-xl font-semibold tracking-tight`
  - Body: `text-sm`
  - Labels / meta: `text-xs uppercase tracking-wider text-muted-foreground`

## 4. Radius

Defined via `--radius: 0.75rem` (12px) with derived `--radius-sm/md/lg/xl`.

- Cards / forms / large blocks: `rounded-2xl` (16px)
- Inputs / buttons / inner tiles: `rounded-xl` (12px)
- Chips / suggestion pills: `rounded-full`
- Avatars (channel thumbnails): `rounded-full`
- Icon tiles: `rounded-lg`

## 5. Elevation & Shadows

Two custom shadows only — keep depth subtle.

- `--shadow-card`: `0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)` — applied as `shadow-[var(--shadow-card)]` on every card.
- `--shadow-elevated`: heavier variant for popovers/modals when needed.

## 6. Layout

- Max content width: `max-w-6xl` centered with `mx-auto px-6`.
- Vertical rhythm: sections separated by `space-y-8`; inner grids use `gap-4`.
- Header & footer: bordered with `border-border bg-card`.
- Body background: `--color-surface` (slightly off-white) so white cards stand out.
- Grid patterns:
  - Stat strip: `grid grid-cols-4 gap-px bg-border` (hairline dividers between cells).
  - Metric row: `grid sm:grid-cols-4 gap-4`.
  - Cards/ideas: `grid sm:grid-cols-2 lg:grid-cols-3 gap-4`.

## 7. Components

### Buttons
- Primary CTA: `h-12 rounded-xl bg-primary text-primary-foreground px-6 text-sm font-medium hover:opacity-90 disabled:opacity-50`.
- Icon + label, gap-2.

### Inputs
- Height `h-12`, `rounded-xl`, `border-input bg-background`, leading icon at `left-3`.
- Focus: `focus:border-ring focus:ring-2 focus:ring-ring/20`.

### Cards
- `rounded-2xl border border-border bg-card p-5/6 shadow-[var(--shadow-card)]`.
- Section header inside card: small icon (`h-4 w-4 text-primary`) + `text-sm font-semibold`.

### Chips / suggestions
- `rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground`.

### Keyword tags
- `rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary`.

### Icon tiles
- `inline-flex h-8 w-8 (or h-9 w-9) items-center justify-center rounded-lg bg-primary/10 text-primary`.

### Alerts (error)
- `rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive` with leading `AlertTriangle` icon.

### Loading
- Skeletons use `animate-pulse rounded-2xl border border-border bg-card` matching the final block heights.

## 8. Iconography

- Library: `lucide-react` only.
- Size: `h-4 w-4` inline, `h-5 w-5` in brand mark.
- Color: `text-primary` for accents, `text-muted-foreground` for meta, semantic tokens for state (success/warning/destructive).

## 9. Imagery

- Channel avatars: `h-12 w-12 rounded-full object-cover`.
- Video thumbnails: `aspect-video object-cover` inside `rounded-xl` card, subtle `group-hover:scale-[1.02]` zoom.
- Always provide `alt` text (channel/video title).

## 10. Motion

- Keep transitions to `transition` (default Tailwind: colors/opacity/transform) with no custom durations.
- Hover affordances: border color shift to `border-primary/40`, background to `bg-muted/40`, opacity dip on buttons.
- No page-level entrance animations. Skeletons handle perceived loading.

## 11. Accessibility

- Focus ring always visible (`ring-ring/20`).
- Color is never the sole signal — pair score color with numeric value and label.
- External links: `target="_blank" rel="noreferrer"`.
- Images require descriptive `alt`.

## 12. SEO baseline (per route)

Set in each route's `head()`:
- Unique `<title>` (<60 chars) and meta description (<160 chars).
- `og:title`, `og:description` per page.
- Single `<h1>` per page; semantic landmarks (`header`, `main`, `footer`).

## 13. Do / Don't

**Do**
- Use semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`).
- Reach for `rounded-2xl` + `shadow-[var(--shadow-card)]` for any new card.
- Keep icons monochrome with `text-primary` or muted tones.

**Don't**
- Don't add new gradients, glows, or decorative blobs.
- Don't introduce a second font family.
- Don't hardcode hex colors or Tailwind palette classes (`bg-blue-500`, `text-gray-700`).
- Don't add heavy shadows or large border radii (>20px).
