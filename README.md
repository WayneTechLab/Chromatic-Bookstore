# Chromatic Bookstore

Chromatic Bookstore is a production-leaning digital bookstore for printable coloring books, curated monthly drops, instant PDF delivery, and creator-friendly licensing. It runs on React, Vite, Firebase, Stripe test-mode tooling, and the updated `.SYSTEMX` operational layer.

Live site: [chromatic-bookstore.web.app](https://chromatic-bookstore.web.app)

## Current product surface

- Customer storefront with route-based collections like `Best Sellers`, `New Releases`, and `Book Of The Month`
- Level-aware top-right account menu using the `.SYSTEMX` Level 0-5 model
- Firebase Google login with custom-claim `level` support and local demo fallback
- Admin entry points for CMS, CRM, billing, and PDF inventory workflows
- Demo-real CMS/CRM/billing dashboards with Stripe-SDK-shaped test flows
- Firebase Hosting deployment wired to the `chromatic-bookstore` project
- SEO foundations including canonical tags, route metadata, sitemap, robots policy, mobile web manifest, and social share preview tags

## Access model

Chromatic Bookstore follows the `.SYSTEMX` account-level standard:

| Level | Meaning | Site behavior |
| --- | --- | --- |
| 0 | Public / guest | Storefront and public pages only |
| 1 | Member | Signed/profile-ready customer state |
| 2 | Pro | Paid/pro commerce entitlement state |
| 3 | Diamond | Premium customer state |
| 4 | Admin | Admin, CMS, CRM, and Billing links |
| 5 | Owner | Super-admin indicator plus admin operations |

Firebase custom claim `level` is authoritative when present. During local/dev work,
the dropdown demo selector falls back to `wsg.demo.accountLevel` so workflows can
be tested before claims are seeded.

## Local development

```bash
npm install
npm run dev
```

The local app runs at [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Build and deploy

```bash
npm run build
bash .SYSTEMX/scripts/deploy.sh hosting --project chromatic-bookstore --fast --skip-push
bash .SYSTEMX/scripts/deploy.sh rules --project chromatic-bookstore --fast --skip-push --skip-build
```

## Production deploy path

Use the explicit production mode before shipping customer-facing changes:

```bash
npm run deploy:production:preflight
npm run deploy:production:hosting
```

Production mode locks the Firebase target to `chromatic-bookstore`, sets
`VITE_ENVIRONMENT=production`, applies the canonical site URL, checks SEO/share
assets, confirms core dependencies, and blocks accidental live Stripe publishable
keys unless the operator intentionally passes `--allow-live-stripe`.

Stripe remains test/demo-first for now. Do not enable live Stripe until real PDF
products, download fulfillment, webhook handling, refund/support policy, and
Level 4/5 admin claims have been verified end-to-end.

## Book/PDF production workflow

Finished book PDFs are generated locally and uploaded to Google Drive rather than
committed to GitHub. Large generated artifacts are ignored with `output/` and
`tmp/` so the repository stays deployable and avoids GitHub file-size limits.

Current Forest Friends output:

- `Forest Friends - Series 01.pdf` - original 50-page book
- `Forest Friends - Series 01 - Marker Cover Edition.pdf` - page `0000` marker-style cover preview, reserved pages `01-50`, page `51` back of book, and pages `52-54` blank pages

## Firebase and backend status

- Hosting is live on the `chromatic-bookstore` Firebase project
- Firestore and Storage rules are aligned for bookstore collections and PDF asset paths
- Product publishing can write Firebase records/storage when permissions are available, with local demo fallback during development
- Real admin verification still needs production Firebase Auth custom claims/MFA assignment before protected writes should be treated as final

## Stripe status

Stripe is intentionally in test-mode readiness only.

- `@stripe/stripe-js` is installed
- Client publishable key support is scaffolded
- Billing and checkout admin views create demo/test-mode session drafts
- Live payment flows, webhooks, and portal sessions are deferred until the real PDF catalog and access controls are verified

## SEO and sharing

- `index.html` provides strong default metadata for first paint
- Route-aware metadata is applied in-app for collection pages and support pages
- `public/sitemap.xml` and `public/robots.txt` expose crawlable storefront routes while excluding admin paths
- Social cards use the live hosted preview image at `https://chromatic-bookstore.web.app/media/chromatic-bookstore-hero-hd.png`

## Operational system

`.SYSTEMX` remains the control layer for setup, deployment, auditing, account levels, login standards, and environment sync. It has been refreshed from the `WayneTechLab/webapp-stack-g1` template source, with Chromatic-specific production deploy guards layered back in.

Useful entry points:

```bash
bash .SYSTEMX/WSG-MENU.sh
npm run sync:system
npm run system:audit
```

## Next production steps

1. Replace demo admin access with Firebase Auth, MFA, and custom claims.
2. Verify real PDF upload against Firestore and Firebase Storage.
3. Add download entitlements and fulfillment verification.
4. Keep Stripe in test mode until the catalog, access rules, and post-purchase flow are proven end-to-end.
