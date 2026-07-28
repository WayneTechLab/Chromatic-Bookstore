# Chromatic Bookstore Wiki

**Current release:** `2.0.0` (Major)

Welcome to the **Chromatic Bookstore** wiki. This repo is now a branded
printable-coloring-book ecommerce storefront backed by React, Vite, Firebase,
Stripe test-mode readiness, Google Drive PDF production, and the `.SYSTEMX`
operational layer.

> The repo is both the customer-facing Chromatic Bookstore app and a
> `.SYSTEMX`-managed production workspace. The app code lives at the repo root;
> setup, deployment, account-level policy, and operating runbooks live under
> `.SYSTEMX/`.

## Start here

| If you want to... | Go to |
| --- | --- |
| Run or preview the app | **[Quick Start](Quick-Start)** |
| Understand the stack | **[Architecture & Stack](Architecture-and-Stack)** |
| Wire Firebase, Stripe, and site URLs | **[Environment Variables](Environment-Variables)** |
| Review account levels and admin protection | **[Security](Security)** |
| Deploy production safely | **[Deployment](Deployment)** |
| Follow the full `.SYSTEMX` setup flow | **[Setup Playbook](Setup-Playbook)** |
| Keep tests and QA aligned | **[Testing & QA](Testing-and-QA)** |
| Common questions | **[FAQ](FAQ)** |

## Product direction

Chromatic Bookstore is focused on selling printable coloring-book PDFs:

- Public storefront and route-aware collections
- Coloring-book catalog cards with price, license, pages, preview, and checkout buttons
- Admin/CMS/CRM/Billing dashboards for PDF upload, customer operations, orders, and Stripe test-mode billing drafts
- Firebase Google login plus `.SYSTEMX` Level 0-5 account behavior
- SEO, sitemap, robots, manifest, and social preview image for production sharing

## Operational rule

Preserve the bookstore brand in public UI. Wayne Tech Lab LLC is provenance only
and belongs in the quiet footer/product notice, not the top nav or hero.

## Production posture

- Firebase project: `chromatic-bookstore`
- Production URL: `https://chromatic-bookstore.web.app`
- Stripe: test/demo mode until real products, webhooks, fulfillment, and support policy are verified
- Large generated PDFs: stored in Google Drive, not committed to GitHub

## `.SYSTEMX` status

`.SYSTEMX` was refreshed from the `WayneTechLab/webapp-stack-g1` template source
and then re-layered with Chromatic-specific production deploy safeguards.
