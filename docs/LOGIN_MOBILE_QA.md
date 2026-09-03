# Login Mobile QA

The Growthbridge staff login is intentionally isolated from the public shell, but it retains an explicit escape route to the public website.

## Acceptance criteria

- The login page is usable at narrow mobile widths without horizontal overflow.
- A minimum 44px back-navigation target is available at the top of the page.
- The top navigation control links to `/` and is labelled **Back to website**.
- A second **Return to public website** action is available beneath the form for keyboard/touch users.
- Successful authentication shows the inline **Signed in successfully** status before the control center navigation occurs.
- `prefers-reduced-motion` remains respected by the global UI system.
