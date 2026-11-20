# Older composed blocks: scoped verification

## Scope and result

Section 7 of the original roadmap and the separate block track in
`roadmap-implementation-status.md` were reviewed. This follow-up covers the existing
Phase 1–4 blocks; it does not change mobile compositions or add a component family.
Existing uncommitted notification/chat/transfer links in `/blocks` were preserved.

- `/blocks` now supplies both hero CTAs using the existing `hyBlockActions` slot;
  its displayed HTML also includes the second link. No redundant hero API added.
- `/advanced-forms` includes an editable native checkout summary (quantity, USD
  total, request, explicit simulated decline/confirmation, retry and reset).
  It collects no card data and performs no payment, authentication or network call.
  The source lives in `projects/docs/src/app/pages/advanced-forms.{ts,html}` rather
  than a new giant importable checkout family.
- Auth/settings/booking expose `aria-busy` from host-owned `pending`. Their existing
  error alerts remain host-owned; `requested` does not set success or clear errors.
  The docs demonstrate pending, explicit local failure and explicit local success,
  with an honest status that no backend action occurred. A shared demo host locks
  all three forms while one request is pending; production hosts may isolate them.
- Booking now rejects invalid persisted calendar dates, malformed times, disabled
  or absent choices when a slot list is supplied, and noninteger/out-of-range
  guest counts. Invalid persisted dates do not reach the date picker's arithmetic.
  Empty slot lists allow valid HH:mm manual time entry. Server availability,
  timezone validation, DST resolution and final prices remain application duties.

## Behavioral evidence

New `projects/hyalo/blocks/blocks.spec.ts` covers dual CTA focusable DOM order and
Persian projection, dashboard sidebar/toolbar/main projection, native product
options, controlled monthly/annual pricing and Persian number rendering,
stable-ID feature updates/removal with tinted cards, testimonial captions/removal,
localized KPI updates and activity ISO datetime/removal.

New `projects/hyalo/blocks/forms.spec.ts` covers booking invalid/valid requests,
host pending/error ownership, auth validation and OTP mode with leading zeros,
and editing/required validation in settings. Booking validation and missing
`aria-busy` were reproduced by failing tests before fixes. Existing-behavior
characterization tests did not require gratuitous production changes.

New `projects/docs/src/app/pages/older-blocks.spec.ts` covers the missing second
hero CTA, retention of all three existing block links, explicit host settlement
for transactional forms, and checkout quantity -> pending -> decline -> retry ->
success. Missing dual CTA/checkout were observed failing before implementation.

## Commands actually run

- `npx ng test hyalo --watch=false --include='projects/hyalo/blocks/*.spec.ts'`:
  **4 files / 18 tests passed** (includes existing mobile/API tests). Existing jsdom
  canvas getContext notice remains, not GPU evidence.
- `npx ng test docs --watch=false --include='projects/docs/src/app/pages/older-blocks.spec.ts'`:
  **1 file / 3 tests passed**.
- Targeted ESLint of both new library specs, forms.ts, the three changed form
  templates, both changed docs pages/templates and the docs spec: **passed**.
- `npm run check:architecture`: **109 entry points, acyclic dependencies**.
  Basic hero still imports only Button; marketing composition uses phase 1/2
  primitives (CSS Grid, not the Phase 3 Bento API); data blocks use phase <=3;
  transactional blocks use phase <=4. No new dependencies were installed.
- Prettier applied only to this scoped source/spec list.

An intermediate library compile encountered a concurrent Select edit missing
`commitNativeKey`; a later unchanged scoped rerun passed. No Select source was
modified by this follow-up.

## Browser/layout evidence (bounded)

The running local docs at `http://localhost:4200` were inspected through Chromium
DOM/computed styles, not screenshots or a screen reader:

- At 390px with RTL applied, hero resolves to one grid column, both links remain
  present, and document scroll width was 375px (no horizontal page overflow).
- At 1440px RTL, hero resolves to two 380px columns; native Tab from the primary
  link focuses `Browse components` at `/components`.
- Advanced forms at 390px resolve their split layouts to one 256.219px column;
  document scroll width was 375px. At 1440px the split layouts resolve to two
  342px columns with no page overflow (1425px document width).
- Native checkout click produced `aria-busy=true` and `Awaiting host confirmation`;
  explicit decline produced the alert and retained quantity. Automated docs tests
  establish the full success/retry path; live hot reload reset the browser's local
  state during subsequent checks, so no settled browser-success claim is made.

## Remaining gates (not a release certificate)

- Parent must regenerate displayed/generated example artifacts and run settled
  full tests/build/lint/source checks. This worker deliberately ran no global sync.
  Checkout is editable page source, not yet an independently generated EXAMPLE
  artifact; existing advanced-forms EXAMPLE is not claimed to contain this checkout.
- Auth/settings labels and booking validation/action copy are still English.
  Persian fixture text and RTL layout are tested, but complete localized UI strings
  and a genuine Persian content demo for every block remain open.
- Host loading/error/empty/success ownership is documented for read-only marketing
  and data blocks; no artificial async state machine was added to each stateless
  export. Comprehensive live state demos for every marketing/data block remain open.
- Filter-toolbar descriptor/codec behavior remains delegated to the existing
  FilterBar tests; no new dedicated wrapper interaction suite was added here.
- No real optics stage, low-tier hydration/deferred/event replay, forced colors,
  contrast, reduced-motion visual audit, Firefox/WebKit, physical touch or AT
  certification. Static DOM tests and CSS source inspection do not establish them.
- Responsive browser measurements sampled hero and form split layouts only, not
  every content length, zoom level or every exported block. Product commerce,
  realtime audit persistence, auth, availability and payment remain host-owned.
