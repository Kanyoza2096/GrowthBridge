# Public Theme Remediation

## Acceptance criteria

- Public routes default to **light** when no `gb_theme` preference exists.
- Dark mode remains an explicit user option and is persisted independently from the admin theme.
- Public surfaces use Growthbridge brand colors: navy `#123B5D`, green `#16A36A`, orange `#F59E0B`, with neutral slates only for readable surfaces/text.
- No public content should become invisible because white text is placed on a light surface.
- Gradient tokens must be applied with `background`, not `background-color`.

## Screenshot findings addressed

1. The footer used `bg-[var(--gradient-footer)]`. Tailwind's `bg-*` utility maps this form to `background-color`, but the token contains a gradient, so the declaration is invalid and the footer could fall back to a white surface while its text remained white. This produced the large blank/invisible footer appearance visible in the supplied screenshots.
2. Several components used `bg-[var(--gradient-brand)]` for gradient backgrounds. These were migrated to the existing `bg-gradient-brand` utility, which correctly uses `background: var(--gradient-brand)`.
3. Mobile footer legal links were allowed to shrink into narrow columns, producing broken words such as `Contac t` and `Staff logi n`. They now use a two-column mobile layout with `whitespace-nowrap` and a horizontal layout from the small breakpoint upward.
4. Public data-backed lists now have branded, truthful empty states instead of rendering an empty section when the data service returns no rows.
5. Blue/purple public badges now map to the Growthbridge navy/orange palette while retaining their existing component API for compatibility.
6. Public theme boundaries and browser `color-scheme` values are explicit.

## Intentional dark surfaces

The homepage hero, CTA, footer, project visual, and other explicitly branded dark bands remain dark in light mode. They are not theme failures; they are deliberate brand surfaces with white text. The surrounding public experience remains light by default.
