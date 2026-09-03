# Bridge & Access QA

## Home bridge visual

The primary Growthbridge bridge illustration is intentionally static. Pulsing/ping effects were removed because they created visual noise, competed with the brand mark, and could appear clipped on smaller screens. Floating explanatory labels are hidden on narrow screens so the bridge structure remains fully legible.

The floating AI assistant no longer uses a pulsing status dot; the assistant remains available as a static action without implying live availability when the AI service may be unavailable.

## Admin access

Super Admins now have a dedicated **Users & Roles** workspace. It provisions Supabase Auth accounts server-side, assigns one of the predefined least-privilege Growthbridge roles, supports activation/deactivation, and records changes in the audit log. A Super Admin cannot remove their own access, and the last active Super Admin cannot be demoted or deactivated.

## Login mobile behavior

The admin login uses the admin theme boundary explicitly, `100svh`, mobile-safe padding, full-width controls, a bottom-sheet-friendly modal vocabulary, and an inline success state. Successful authentication remains visible briefly before navigation so mobile users can actually see confirmation instead of losing the message during an immediate redirect.
