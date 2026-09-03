# Brand UI Hardening — Precision Pass

Implemented from the supplied Growthbridge brand reference.

- Core Navy: #123B5D
- Core Green: #16A36A
- Core Orange: #F59E0B
- Montserrat is now the application typeface.
- Public page surface defaults to pure white.
- Public theme defaults to light; dark is opt-in.
- Admin theme defaults to dark; light is opt-in.
- Core colors are exposed through `--gb-brand-navy`, `--gb-brand-green`, and `--gb-brand-orange`.
- Existing derived shades are explicitly documented as accessibility/state shades, not additional brand colors.
- Hard-coded core brand hex values were removed from UI TSX in favor of the source-of-truth tokens.
- Green brand surfaces use a dark accessible foreground instead of white because the exact brand green with white text does not meet WCAG AA for normal-size text.
- Navy/white and orange/navy combinations remain available where their contrast is sufficient.
