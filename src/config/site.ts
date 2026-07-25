const DEFAULT_SITE_URL = 'https://chromatic-bookstore.web.app'
const SHARE_IMAGE_PATH = '/media/chromatic-bookstore-hero-hd.png'

type PageMetadata = {
  title: string
  description: string
  path: string
  robots?: string
}

const pageMetadata: Record<string, PageMetadata> = {
  '/': {
    title: 'Chromatic Bookstore | Printable Coloring Books',
    description: 'Shop polished printable coloring books, curated monthly drops, commercial-ready art packs, and instant PDF downloads.',
    path: '/',
  },
  '/bestsellers': {
    title: 'Best Sellers | Chromatic Bookstore',
    description: 'Browse the top-performing printable coloring books and creative PDF packs customers return to first.',
    path: '/bestsellers',
  },
  '/newreleases': {
    title: 'New Releases | Chromatic Bookstore',
    description: 'Explore fresh printable coloring book releases, latest drops, and newly curated digital PDF packs.',
    path: '/newreleases',
  },
  '/bookofmonth': {
    title: 'Book Of The Month | Chromatic Bookstore',
    description: 'Discover the featured coloring book of the month with a clean buy path, instant delivery, and premium licensing details.',
    path: '/bookofmonth',
  },
  '/about': {
    title: 'About | Chromatic Bookstore',
    description: 'Learn how Chromatic Bookstore blends bold digital publishing, curated printable books, and creator-first licensing.',
    path: '/about',
  },
  '/contact': {
    title: 'Contact | Chromatic Bookstore',
    description: 'Contact Chromatic Bookstore for support, wholesale requests, creator partnerships, or custom coloring book inquiries.',
    path: '/contact',
  },
  '/faq': {
    title: 'FAQ | Chromatic Bookstore',
    description: 'Get quick answers on downloads, PDF access, commercial licensing, refunds, and customer support.',
    path: '/faq',
  },
  '/privacy': {
    title: 'Privacy Policy | Chromatic Bookstore',
    description: 'Review how Chromatic Bookstore handles customer data, transactions, account access, and analytics.',
    path: '/privacy',
  },
  '/terms': {
    title: 'Terms Of Service | Chromatic Bookstore',
    description: 'Read the storefront, purchase, licensing, and digital-download terms for Chromatic Bookstore.',
    path: '/terms',
  },
  '/services': {
    title: 'Services | Chromatic Bookstore',
    description: 'See the creative publishing, storefront operations, CMS, CRM, and licensing services behind the bookstore.',
    path: '/services',
  },
  '/docs': {
    title: 'Docs | Chromatic Bookstore',
    description: 'Review operating docs, setup flow, deployment tooling, and system guidance behind Chromatic Bookstore.',
    path: '/docs',
  },
  '/admin': {
    title: 'Admin Login | Chromatic Bookstore',
    description: 'Secure operator access for Chromatic Bookstore CMS, CRM, billing, and digital inventory controls.',
    path: '/admin',
    robots: 'noindex,nofollow',
  },
  '/admin-inventory': {
    title: 'Admin CMS | Chromatic Bookstore',
    description: 'Inventory and PDF publishing workspace for Chromatic Bookstore operators.',
    path: '/admin-inventory',
    robots: 'noindex,nofollow',
  },
  '/admin-orders': {
    title: 'Admin CRM | Chromatic Bookstore',
    description: 'Orders, customer records, and download operations for Chromatic Bookstore staff.',
    path: '/admin-orders',
    robots: 'noindex,nofollow',
  },
  '/admin-billing': {
    title: 'Admin Billing | Chromatic Bookstore',
    description: 'Billing operations, test Stripe readiness, and reporting access for Chromatic Bookstore.',
    path: '/admin-billing',
    robots: 'noindex,nofollow',
  },
}

function titleFromPath(pathname: string) {
  return pathname
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase()))
    .join(' / ')
}

export function getSiteUrl() {
  return (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
}

export function getShareImageUrl() {
  return `${getSiteUrl()}${SHARE_IMAGE_PATH}`
}

export function resolveMetadata(pathname: string) {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '')
  const meta = pageMetadata[normalizedPath]

  if (meta) {
    return {
      ...meta,
      canonicalUrl: `${getSiteUrl()}${meta.path === '/' ? '' : meta.path}`,
      imageUrl: getShareImageUrl(),
      robots: meta.robots || 'index,follow',
    }
  }

  const fallbackTitle = titleFromPath(normalizedPath) || 'Chromatic Bookstore'
  return {
    title: `${fallbackTitle} | Chromatic Bookstore`,
    description: 'Discover curated printable coloring books, featured collections, and digital product drops from Chromatic Bookstore.',
    path: normalizedPath,
    canonicalUrl: `${getSiteUrl()}${normalizedPath === '/' ? '' : normalizedPath}`,
    imageUrl: getShareImageUrl(),
    robots: normalizedPath.startsWith('/admin') ? 'noindex,nofollow' : 'index,follow',
  }
}
