# Growthbridge UI/Theme Hardening

## Theme contract
- Public site defaults to light.
- Public dark mode is opt-in via `gb_theme`.
- Admin defaults to dark.
- Admin light mode is opt-in via `gb_admin_theme`.
- OS preference never overrides the product defaults.
- The root theme flash script detects `/admin` before paint to prevent a public-light flash on admin routes.
- Nested public/admin providers only mutate the document when their scope is active.

## Design-system fixes
- Restored the missing `src/styles/index.css` design-token layer referenced by `globals.css`.
- Added semantic surfaces, text, border, form, chip, navigation, gradient and state tokens for both modes.
- Admin legacy Tailwind slate colors were migrated to semantic admin tokens.
- Admin `dark:` utility dependencies were removed.
- Modal now uses semantic theme tokens instead of hard-coded slate colors.
- Global focus-visible styling was added.
- Body background/text are explicitly theme-driven to prevent white gaps caused by transparent/unresolved surfaces.

## Accessibility
- Primary/secondary/tertiary text tokens are selected for readable contrast in both themes.
- Form controls inherit the active color scheme and placeholder colors.
- Brand surfaces retain white foreground text in both themes.

## Responsive pass (2026-09)

### Design-system
- `Container` uses safe-area horizontal padding (`gb-safe-px`) so content clears notches / home indicators.
- `Button` adds `fullWidth` prop and `min-h` touch targets (≥40–48px by size).
- `Modal` becomes a bottom sheet on phones (`items-end`, rounded top only) with larger close hit area and `100dvh`-aware max height.
- `Input` / `Textarea` use `text-base` on mobile to prevent iOS focus zoom; `min-h-11` on inputs.

### Global CSS
- Fluid `h1` / `h2` via `clamp()` to avoid oversized headlines on mid-width phones.
- Utilities: `.gb-touch-target`, `.gb-scroll-x`, `.gb-table-wrap`, `.gb-safe-px`, `.gb-safe-pb`.
- `prefers-reduced-motion` disables non-essential animation/transition.
- Images/video default to `max-width: 100%; height: auto`.

### Surfaces
- Hero CTAs stretch full-width on mobile (`Link` + `Button fullWidth`).
- Header: brand tagline hidden below `sm`; mobile menu button is a proper touch target.
- Services / Projects / Team grids: tighter gaps on small screens; Projects & Team gain `sm:grid-cols-2`.
- Admin mobile top bar respects `safe-area-inset-top`.

### Follow-ups
- Full CSP nonce migration (separate from UI).
- Optional: intermediate `md` desktop nav before `lg` if tablet usage is high.
- Audit remaining admin data tables to wrap with `.gb-table-wrap`.

## Responsive pass 2 — tablet, tables, forms

### Navigation
- Public desktop nav + actions now appear from **`md` (768px)** instead of only `lg`.
- Compact spacing on tablet (`text-xs`, tighter horizontal padding); full spacing from `lg`.
- Mobile drawer (`MobileNav`) aligned to `md:hidden`, with safe-area insets, body scroll lock, Escape to close, scrollable link list, and full-width CTA.

### Admin
- People directory table uses `.gb-table-wrap` + `min-w-[720px]` for horizontal scroll on narrow viewports without breaking the page.

### Contact
- Form submit buttons are `fullWidth`.
- Tab switcher is a 2-column segmented control with min 44px height targets.
- Form cards use progressive padding: `p-4 → sm:p-6 → md:p-8`.
- Section vertical padding reduced on small screens.

### Footer
- Tighter top/bottom padding on mobile; grid becomes 2 columns from `sm`.

## Responsive pass 3 — talent, detail pages, lists

### Talent Hub
- Multi-step application form: progressive card padding, full-width primary actions, stacked Back/Next on mobile (`flex-col-reverse`), larger skill chips (min 40px), step header stacks on narrow screens.
- Form constrained to `max-w-2xl` for readability on large displays.
- Directory grids: `sm:grid-cols-2 lg:grid-cols-3` with tighter mobile gaps; mode switcher is full-width stacked on phones.

### Blog & Projects detail
- Replaced hard-coded `slate-*` / `emerald-*` / pure `text-white` with semantic theme tokens so light/dark modes stay consistent.
- Fluid title sizes (`text-2xl → sm:text-4xl → lg:text-5xl`).
- Card padding scale `p-4 → sm:p-6 → md:p-8`.
- Sticky CTA only on large screens; full-width accent button.
- Safer empty/loading states using semantic text colors.

### List pages (blog, projects, services, talent-hub)
- Reduced section spacing on mobile.
- Tighter card grids and progressive padding on service/blog cards.

## Responsive pass 4 — admin dashboard, services detail, toasts

### Admin dashboard
- Stat cards: 2-column grid on phones (was 1), tighter gaps, smaller value type on mobile.
- Chart cards: `overflow-hidden` + progressive padding so SVG charts don’t cause horizontal scroll.
- Hero banner and section spacing reduced on small screens.

### Services detail
- Same treatment as projects/blog: semantic tokens (no hard-coded slate/emerald/white-only).
- Fluid titles, progressive padding, sticky CTA only from `lg`, full-width consultation button.
- Feature list items with min height for easier tapping.

### Toasts
- Safe-area positioning was already present; dismiss control now meets touch-target size with hover affordance.

## Theme / contrast fixes (light mode)

### Root causes found
1. **Missing CSS variable** `--text-on-brand-green` was referenced by primary buttons but never defined → text could render with wrong/inherited color.
2. **Primary green + pure white** fails WCAG AA for normal text on brand green (`#1F8A3F`); light mode now uses near-navy foreground on primary actions.
3. **Transparent header over dark heroes** used `--text-primary` (dark in light mode) on top of navy/hero bands → nav labels appeared hidden until scroll. Fixed with `overDarkHero` light-text styles on `/`, `/blog/*`, `/projects/*`, `/services/*`.

### Token updates
- `light.css`: `--text-on-brand-green: var(--gb-navy-950)`; `--action-primary-text: var(--gb-navy-950)`.
- `dark.css`: `--text-on-brand-green: #ECFDF5`; `--action-primary-text: #ECFDF5`.
- Primary `Button` color uses `var(--action-primary-text)`.

### Remaining guidance
- Prefer semantic tokens (`--text-primary`, `--text-secondary`, `--text-accent`) on page surfaces.
- Reserve `text-white` for known dark bands (hero, footer, gradient headers, brand icons).
- Never put `--text-primary` (light-mode dark) on transparent chrome over navy heroes without a scroll/overDarkHero branch.

## Automated contrast checks

- Script: `scripts/check-contrast.js`
- Command: `npm run contrast:check`
- Included in `npm run validate` and `npm run production:check`
- Vitest: `src/__tests__/contrast-tokens.test.ts`

Checks WCAG AA contrast (4.5:1 normal text, 3:1 large/UI) for semantic pairs in **light** and **dark** themes (body text, links, forms, buttons, chips, on-brand). Translucent surfaces are composited against `--surface-page`.

Token adjustments applied so the suite passes:
- Light: `--text-link` / `--text-accent` → `--gb-green-700`
- Dark: primary button label / on-green text → `#042F1A`; green chip text → `#A7F3D0`

## Theme scope policy (enforced)

| Area | Default | Optional | Storage key |
|------|---------|----------|-------------|
| Public website | **Light** | Dark via toggle | `gb_theme` |
| Admin panel | **Dark** | Light via toggle | `gb_admin_theme` |

- OS `prefers-color-scheme` is **not** used as the product default.
- `ThemeFlashScript` applies the correct default before paint (avoids flash).
- Root layout: `ThemeProvider scope="public"`.
- Admin layout: nested `ThemeProvider scope="admin"` (independent preference).
- `PublicShell` hides public Header/Footer/assistant on `/admin/*` so admin is not wrapped in marketing chrome.
- Navigating public ↔ admin re-applies the active scope’s stored theme (or its default).

## Brand board alignment

Poster / board cores now match live tokens:

| Role | Hex | Token |
|------|-----|--------|
| Navy | `#123B5D` | `--gb-navy-800` / `--gb-brand-navy` |
| Green | `#16A36A` | `--gb-green-600` / `--gb-brand-green` |
| Orange | `#F59E0B` | `--gb-orange-500` / `--gb-brand-orange` |

- Gradients (`--gradient-brand`, `--gradient-text`) use brand aliases.
- Header + Footer use shared `BrandMark` (bridge + arrows) and `BrandWordmark` (GROWTH + BRIDGE).
- Contrast suite still passes after the green/navy shift.

## Media upload pattern (homepage + team)

**One pattern for all public images:**

1. **Admin → Media** — upload JPEG/PNG/WebP/GIF (max 10 MB) to Supabase Storage bucket `media`.
2. **Pick the asset** with `MediaPicker` (not ad-hoc random URLs only):
   - **Settings → Organization** — logo
   - **Settings → Homepage hero** — hero background + headline copy
   - **Settings → SEO** — Open Graph image
   - **People → New/Edit** — team photo (`photo` field on public team pages)
3. Public homepage reads hero via `GET /api/public/site-config` (safe fields only).
4. Team pages already render `person.photo` when set.

Requires Supabase Storage bucket named `media` with admin upload policies.

## Homepage partners marquee & social feed

### Partners (moving logos)
- `GET /api/public/partners` returns **active** partners (name, logo, website, category) — no contact PII.
- `PartnerCarousel` loads that endpoint, runs **marquee** animation (`animate-marquee`), supports grid mode + pause on hover.
- Logos: use **Admin → Partners** logo field (prefer Media library URL). Initials fallback if no logo.
- Toggle: **Settings → Features → Partner carousel** (`enablePartnerCarousel`).

### Social feed aggregator
- `GET /api/public/social-feed?platform=&limit=` 
- Prefers published **public announcements**; falls back to curated brand posts so the section is never empty.
- `useSocialFeed` calls this API (no longer returns `[]` only).
- Live LinkedIn/X APIs can replace curated items later without UI changes.

## Light-mode contrast fix (live site)

- **Header:** solid nav + brand navy/green wordmark in light theme (no white GROWTH on white).
- **Hero:** locked dark navy band (`#123B5D` → `#070F1B`) in both themes so white text always reads.
- **Footer impact card:** solid `#0C2D47` panel (not translucent `--chip-navy-bg` which washed out in light mode).
- **ScrollReveal:** reveals if already in viewport / reduced-motion (avoids stuck `opacity-0` on mobile).
- **Impact modal** promo uses explicit dark green gradient.
- **tsconfig.json** committed with `@/*` → `./src/*` (required for Render builds).
