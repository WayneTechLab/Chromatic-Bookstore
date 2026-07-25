import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getSiteUrl, resolveMetadata } from '@/config/site'

function ensureMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  const selector = `meta[${attribute}="${name}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function ensureLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

function ensureStructuredData(payload: Record<string, unknown>) {
  const id = 'chromatic-bookstore-jsonld'
  let element = document.getElementById(id) as HTMLScriptElement | null
  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(payload)
}

export function Seo() {
  const location = useLocation()

  useEffect(() => {
    const meta = resolveMetadata(location.pathname)
    document.title = meta.title

    ensureMeta('description', meta.description)
    ensureMeta('robots', meta.robots)
    ensureMeta('theme-color', '#050707')
    ensureMeta('apple-mobile-web-app-title', 'Chromatic Bookstore')
    ensureMeta('application-name', 'Chromatic Bookstore')

    ensureMeta('og:type', 'website', 'property')
    ensureMeta('og:site_name', 'Chromatic Bookstore', 'property')
    ensureMeta('og:title', meta.title, 'property')
    ensureMeta('og:description', meta.description, 'property')
    ensureMeta('og:url', meta.canonicalUrl, 'property')
    ensureMeta('og:image', meta.imageUrl, 'property')
    ensureMeta('og:image:alt', 'Chromatic Bookstore printable coloring book preview', 'property')

    ensureMeta('twitter:card', 'summary_large_image')
    ensureMeta('twitter:title', meta.title)
    ensureMeta('twitter:description', meta.description)
    ensureMeta('twitter:image', meta.imageUrl)

    ensureLink('canonical', meta.canonicalUrl)

    ensureStructuredData({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${getSiteUrl()}#organization`,
          name: 'Chromatic Bookstore',
          url: getSiteUrl(),
          logo: meta.imageUrl,
        },
        {
          '@type': 'WebSite',
          '@id': `${getSiteUrl()}#website`,
          name: 'Chromatic Bookstore',
          url: getSiteUrl(),
          description: 'A polished digital bookstore for printable coloring books, curated collections, and creator-ready licensing.',
          publisher: {
            '@id': `${getSiteUrl()}#organization`,
          },
        },
        {
          '@type': 'WebPage',
          '@id': `${meta.canonicalUrl}#webpage`,
          url: meta.canonicalUrl,
          name: meta.title,
          description: meta.description,
          isPartOf: {
            '@id': `${getSiteUrl()}#website`,
          },
          primaryImageOfPage: meta.imageUrl,
        },
      ],
    })
  }, [location.pathname])

  return null
}
