# GrowthBridge Virtual — Brand System & Rollout Notes

This document translates the approved brand hierarchy into repeatable website and campaign applications. The visual source of truth is `/BRAND_GUIDELINES.md`.

## Identity hierarchy
- Parent organization: **GrowthBridge**
- Public-facing brand: **GrowthBridge Virtual**
- Public wordmark: **GROWTHBRIDGE VIRTUAL**
- Tagline: **Bridging Skills. Driving Growth.**

The public site should lead with GrowthBridge Virtual. Legal, ownership and governance references should use the parent organization name where appropriate.

## Logo files
- `public/brand/growthbridge-virtual-lockup.svg` — horizontal primary lockup.
- `public/brand/growthbridge-mark.svg` — compact standalone symbol.
- `public/brand/growthbridge-social-avatar.svg` — square social avatar.
- `public/icons/icon-192.svg`, `icon-512.svg`, `icon-maskable.svg` — application icons.

The React `BrandMark` and `BrandWordmark` components remain the shared website logo implementation, so header and footer stay consistent.

## Colour use
- Navy `#123B5D`: primary identity, trust, navigation and headings.
- Green `#16A36A`: growth, progress and primary action surfaces; pair with a tested dark foreground.
- Gold `#F59E0B`: opportunity, emphasis and small visual accents.
- White `#FFFFFF`: clean public-site surface and breathing room.

Do not add new core brand colours. Use existing design tokens for all interface colours.

## Typography and layout
Montserrat is the brand typeface. Use bold weights for short display headlines and regular/medium weights for long-form reading and interface copy. Maintain generous whitespace, readable line lengths and consistent spacing.

## Social and campaign templates
**Avatar:** use the standalone mark centred on a navy field.

**Cover/banner:** place the GrowthBridge Virtual lockup in the upper-left safe area. Use a navy base, a subtle bridge/growth motif in green, a restrained gold highlight and the tagline. Keep important copy away from platform crop edges.

**Service/division card:** division name, one-line outcome, no more than three supporting capabilities, and one clear next action.

**Opportunity/event announcement:** event or opportunity title, date/time/location only when confirmed, eligibility, one action and a visible source/contact route. Never fabricate programme dates, partner logos or impact statistics.

**Impact/story post:** real subject or project, concise context, verified outcome, consent-cleared media and alt text.

## Content pillars
1. Digital Innovation — practical digital products, technology and AI.
2. Business Growth — strategy, visibility, marketing and operational growth.
3. People & Talent — skills, mentorship, careers and leadership.
4. Community Impact — digital inclusion, learning and local initiatives.
5. Events & Opportunities — workshops, hackathons, networking and calls for participation.

## Brand copy starter set
- **Short description:** GrowthBridge Virtual connects people, businesses and communities with digital solutions, talent, learning and opportunities.
- **Headline:** Connect potential to opportunity.
- **Supporting line:** Explore digital solutions, business support, talent pathways, community programmes and events built to help people and organizations grow.
- **Primary action:** Explore GrowthBridge
- **Secondary action:** Connect with us

## Website rollout checklist
- [x] Confirm parent/public brand hierarchy and tagline.
- [x] Document official colour, typography, logo and voice rules.
- [x] Add scalable SVG lockup, standalone mark and social avatar assets.
- [x] Align shared header/footer wordmark with GrowthBridge Virtual.
- [x] Align application icons with the approved bridge mark.
- [ ] Review public homepage hero and division cards against the content system.
- [ ] Review social profile names, handles and platform-specific crop previews before publishing.
- [ ] Run typecheck, lint, unit tests, contrast checks and production build in CI.

## Governance
Mission and vision remain draft copy pending leadership adoption. This branch changes source files only; it does not publish a live site, change domain settings, upload social posts or modify organization records.
