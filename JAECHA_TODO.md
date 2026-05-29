# Jae Cha Portfolio — TODO

Tracks open work for the `/jaecha` portfolio. The visual frontend is in place using
placeholder gradients; the items below are what's left to finish it as a real photographer's
site.

## 1. Image hosting & content delivery strategy

**Decided.** S3 + CloudFront (reusing the existing `openpresent` bucket and
`NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB` distribution). Day-to-day workflow for adding /
removing / reordering photos lives in [`docs/JAECHA_PHOTOS.md`](docs/JAECHA_PHOTOS.md).

### Done

- [x] S3 key convention: `web-assets/jaecha/<project-id>/<source-slug>-<size>.<ext>`
      (under the existing `web-assets/` prefix served by
      `NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB`). Slug is derived from the source filename
      so it's a permanent, human-readable identity.
- [x] Project list (`_components/data.ts`) restructured to match the real
      `Portfolio 2026/` folders.
- [x] `JaePhoto` type + auto-generated `photos.ts` catalog + hand-edited
      `curation.ts` manifest (order, hero, hidden, home-grid picks).
- [x] `scripts/process-jaecha-photos.ts` — thumb/medium/large × AVIF/WebP variants,
      EXIF rotation, blurDataURL generation, idempotent S3 upload, `--prune` for
      removals, `--dry-run`, `--project`. Wired up as `npm run jaecha:upload`.

### Still to do (after first upload run)

- [ ] Run `npm run jaecha:upload -- --source "/Volumes/.../Portfolio 2026"` to do
      the first full upload. Commit the generated `photos.ts`.
- [ ] Add `next.config.ts` `images.remotePatterns` entry for the CloudFront domain
      so Next.js can optimize images served through it.
- [ ] Replace `PlaceholderImg` with a `<JaePhoto>` Next.js `<Image>` wrapper
      (blurDataURL placeholder, correct `sizes` per layout, `priority` on the first
      home-grid row + project-detail hero only).
- [ ] Update pages that assume "many projects per category" — Environmental,
      Still Life, and Landscape collapsed to one project each, so those pages now
      iterate photos within that project rather than across projects.
- [ ] Wire zoom overlay to fetch the `large` tier directly from CloudFront (bypass
      Next.js optimizer — saves a redirect hop, source is already optimized).
- [ ] Skeleton/empty state styling matched to the bone palette for the brief
      window between blur and sharp.
- [ ] `<link rel="preconnect">` to the CloudFront domain in `/jaecha/layout.tsx`.

## 2. Contact form

The form at `/jaecha/contact` is visual-only — `onSubmit` just calls `preventDefault()`.

Plan: wire BOTH paths so the user can choose at click-time.

- [ ] **Primary "Send" button → Formspree** (or Basin). Hosted endpoint, POSTs the
      form fields, routes to Jae's email. Free tier is fine for portfolio volume.
      Add a honeypot field to the form and rely on the service's built-in spam
      filtering.
- [ ] **Secondary "Email directly" link → `mailto:`** with prefilled subject. Opens
      the user's mail app — useful on desktop or for users who don't want to fill
      a web form.
- [ ] Confirmation UI (success / error / sending states) inside the form for the
      Formspree path.

## 3. Domain redirect — jaebinchae.com → openpresent.nyc/jaecha

The plan is for `jaebinchae.com` to redirect to `/jaecha`. Handle when domain is acquired:

- [ ] DNS: point `jaebinchae.com` (and `www.jaebinchae.com`) at Vercel via A/AAAA or CNAME.
- [ ] Vercel project settings → Domains → add `jaebinchae.com` as an alias with a
      redirect rule to `https://openpresent.nyc/jaecha` (308 permanent).
  - Alternative: serve `jaecha` directly under the apex by adding a Next.js rewrite
    in `next.config.ts` (`source: '/'`, `destination: '/jaecha'`, plus matching rules
    for sub-paths). The redirect approach is simpler and keeps a single canonical URL.
- [ ] Add `metadataBase` + canonical URL to the `/jaecha` layout pointing at
      `https://openpresent.nyc/jaecha` so SEO doesn't split between the two domains.

## 4. Real photos & metadata

- [ ] Collect Jae's actual project list and photographs (currently mocked in `data.ts`).
- [ ] For each project, decide hero shot + supporting shots + ordering.
- [ ] Replace the dummy `count` field with real photo arrays once hosting is decided.
- [ ] Real bio copy for `/jaecha/contact` (current copy is from the wireframe — Jae may
      want to revise).
- [ ] Real portrait photo of Jae for the contact page.

## 5. Polish (nice-to-have)

- [ ] Add OPENPRESENT logo somewhere on `/jaecha` to signal it's an Open Present–hosted
      portfolio (footer "Hosted by OPENPRESENT" mark? small wordmark in the NavBar?).
      Will be hidden once `jaebinchae.com` becomes the canonical domain — TBD whether the
      logo also disappears under that domain or stays as attribution.
- [ ] OG image for `/jaecha` (currently inherits default).
- [ ] Sitemap entries for each portfolio route.
- [ ] Smooth page transitions (e.g. `motion` fades, since the package is already in deps).
- [ ] Pre-load adjacent project on `/jaecha/p/[id]` for instant prev/next nav.
- [ ] Keyboard shortcuts on `/jaecha/p/[id]`: ← / → for prev/next, Esc back to category.
