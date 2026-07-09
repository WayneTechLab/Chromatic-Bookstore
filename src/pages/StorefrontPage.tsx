import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Award,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Download,
  FileUp,
  Filter,
  Heart,
  Lock,
  Mail,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  UploadCloud,
} from 'lucide-react'
import { useAccountLevel } from '@/auth/useAccountLevel'
import { ACCOUNT_LEVELS, type AccountLevel } from '@/auth/accountLevels'
import { isStripeTestMode, stripePublishableKey } from '@/config/stripe'
import { createCheckoutIntent, publishProduct } from '@/services/bookstore'

type Product = {
  id: string
  title: string
  author: string
  price: number
  category: 'Kids' | 'Teens' | 'Adults' | 'Pro'
  pages: number
  license: string
  description: string
  status: 'Live' | 'Draft' | 'Review'
  badge: string
  accent: string
  coverPosition: string
}

const products: Product[] = [
  { id: 'kids-safari', title: 'Cute Safari Animals Pack', author: 'ArtbyLucy', price: 4.99, category: 'Kids', pages: 15, license: 'Personal PDF', description: 'Bold animal outlines for early creative play.', status: 'Live', badge: 'Starter favorite', accent: 'from-emerald-300 to-cyan-300', coverPosition: '0% 0%' },
  { id: 'magic-castles', title: 'Fairytale Castles & Dragons', author: 'Ink & Quill Studios', price: 5.5, category: 'Kids', pages: 20, license: 'Personal PDF', description: 'Castles, smiling dragons, and starry skies.', status: 'Live', badge: 'Giftable', accent: 'from-rose-300 to-amber-200', coverPosition: '0% 0%' },
  { id: 'anime-techwear', title: 'Anime Legends Techwear', author: 'Hiroshi Sato', price: 12.5, category: 'Teens', pages: 25, license: 'Personal PDF', description: 'High contrast character sheets with modern style.', status: 'Live', badge: 'Best seller', accent: 'from-cyan-300 to-blue-300', coverPosition: '100% 0%' },
  { id: 'vaporwave-futures', title: 'Vaporwave Neon Futures', author: 'SynthWave Studio', price: 14.5, category: 'Teens', pages: 20, license: 'Personal PDF', description: 'Retro grids, cassettes, chrome, and neon horizons.', status: 'Review', badge: 'Fresh drop', accent: 'from-fuchsia-300 to-cyan-300', coverPosition: '100% 0%' },
  { id: 'mandala-master', title: 'Mandala Meditation Masterpieces', author: 'ZenFlow Artistry', price: 10.99, category: 'Adults', pages: 40, license: 'Personal PDF', description: 'Intricate geometric mandalas for focus and calm.', status: 'Live', badge: 'Monthly pick', accent: 'from-violet-300 to-emerald-200', coverPosition: '0% 100%' },
  { id: 'city-skylines', title: 'Architectural Wonders & Skylines', author: 'ArchLine Designs', price: 15.99, category: 'Adults', pages: 25, license: 'Personal PDF', description: 'Landmarks, streets, and architectural detail.', status: 'Draft', badge: 'Coming soon', accent: 'from-sky-300 to-slate-100', coverPosition: '0% 100%' },
  { id: 'pro-svg-mandala', title: 'Pro Geometric Mandala SVGs', author: 'Master Vector', price: 49.99, category: 'Pro', pages: 50, license: 'Commercial SVG/PDF', description: 'Layered SVG source files with commercial license.', status: 'Live', badge: 'Commercial', accent: 'from-amber-200 to-lime-200', coverPosition: '100% 100%' },
  { id: 'steampunk-blueprints', title: 'Steampunk Blueprint Schematics', author: 'Cogs & Copper', price: 29.5, category: 'Pro', pages: 10, license: 'Commercial PDF/PNG', description: 'Printable airship, gear, and machinery layouts.', status: 'Live', badge: 'Pro pack', accent: 'from-orange-200 to-cyan-200', coverPosition: '100% 100%' },
]

const orders = [
  { id: 'CB-1029', customer: 'maria@example.com', product: 'Mandala Meditation Masterpieces', amount: '$10.99', status: 'Paid', date: 'Jul 9' },
  { id: 'CB-1028', customer: 'studio@printlab.test', product: 'Pro Geometric Mandala SVGs', amount: '$49.99', status: 'Paid', date: 'Jul 9' },
  { id: 'CB-1027', customer: 'parent@example.com', product: 'Cute Safari Animals Pack', amount: '$4.99', status: 'Delivered', date: 'Jul 8' },
]

function pageTitle(slug: string | undefined) {
  if (!slug) return 'Store'
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function ProductCard({ product }: { product: Product }) {
  const [checkoutStatus, setCheckoutStatus] = useState('')

  async function handleBuy() {
    setCheckoutStatus('Creating test checkout...')
    try {
      const checkoutId = await createCheckoutIntent(product.id)
      setCheckoutStatus(`Test checkout ${checkoutId.slice(0, 8)} ready`)
    } catch (error) {
      setCheckoutStatus(error instanceof Error ? error.message : 'Checkout setup failed')
    }
  }

  return (
    <article className="rounded-lg border border-white/10 bg-slate-950/65 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-cyan-300/30">
      <div
        className={`mb-4 aspect-[4/3] rounded-md bg-gradient-to-br ${product.accent} bg-cover p-4 text-slate-950 shadow-inner`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04)), url('/media/chromatic-cover-sheet.png')`,
          backgroundPosition: product.coverPosition,
          backgroundSize: '210%',
        }}
      >
        <div className="flex h-full flex-col justify-between rounded-md bg-white/12 p-1">
          <span className="w-fit rounded-full bg-white/75 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em]">{product.badge}</span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">{product.license}</p>
            <p className="mt-1 text-xl font-black leading-tight">{product.title}</p>
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{product.category}</p>
          <h3 className="mt-2 text-lg font-black text-white">{product.title}</h3>
          <p className="mt-1 text-sm text-slate-400">by {product.author}</p>
        </div>
        <button className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/10" title="Save">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-300">{product.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
        <span className="rounded-full bg-white/8 px-3 py-1">{product.pages} pages</span>
        <span className="rounded-full bg-white/8 px-3 py-1">{product.license}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xl font-black text-white">${product.price.toFixed(2)}</span>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-white/10 p-2 text-slate-200 hover:bg-white/10" title="Preview sample">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={handleBuy} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100">
            <ShoppingCart className="h-4 w-4" />
            Buy PDF
          </button>
        </div>
      </div>
      {checkoutStatus && <p className="mt-3 text-xs font-semibold text-cyan-100">{checkoutStatus}</p>}
    </article>
  )
}

function AdminLogin() {
  const { level, definition, setLevel } = useAccountLevel()

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Secure back office</p>
          <h1 className="mt-3 text-4xl font-black text-white">Admin login for bookstore operations</h1>
          <p className="mt-4 text-slate-300">
            Use the Level 4 or Level 5 operator role to unlock CMS, CRM, upload, and billing workspaces. This is wired as a local demo gate until Firebase Auth custom claims are connected.
          </p>
          <div className="mt-6 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
            Production target: Firebase Auth + MFA + custom claims, Firestore rules, Storage rules for PDF assets, and Stripe Checkout/Billing Portal.
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-cyan-200" />
            <h2 className="text-xl font-black text-white">Operator access</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {ACCOUNT_LEVELS.map((item) => (
              <button
                key={item.level}
                onClick={() => setLevel(item.level as AccountLevel)}
                className={`rounded-lg border p-4 text-left transition ${
                  level === item.level ? 'border-cyan-300/40 bg-cyan-300/10' : 'border-white/10 bg-slate-950/50 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-white">Level {item.level}: {item.label}</span>
                  {level === item.level && <CheckCircle2 className="h-4 w-4 text-cyan-200" />}
                </div>
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/60 p-4">
            <span className="text-sm text-slate-300">Current role: {definition.label}</span>
            <Link to="/admin-inventory" className="rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-950">
              Enter Admin
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function AdminDashboard({ view }: { view: 'inventory' | 'orders' | 'billing' }) {
  const { capabilities } = useAccountLevel()
  const [publishStatus, setPublishStatus] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPublishStatus('Publishing product...')
    const formData = new FormData(event.currentTarget)

    try {
      const result = await publishProduct({
        title: String(formData.get('Title') ?? ''),
        author: String(formData.get('Author') ?? ''),
        price: Number(formData.get('Price') ?? 0),
        category: String(formData.get('Category') || 'Adults'),
        license: String(formData.get('License') || 'Personal PDF'),
        status: String(formData.get('Status') || 'Draft') as 'Draft' | 'Review' | 'Live',
        pdfFile,
      })
      setPublishStatus(`Published product ${result.id.slice(0, 8)}${result.pdfPath ? ' with PDF' : ''}`)
      event.currentTarget.reset()
      setPdfFile(null)
    } catch (error) {
      setPublishStatus(error instanceof Error ? error.message : 'Publish failed')
    }
  }

  if (!capabilities.canAccessAdmin) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-amber-200" />
          <h1 className="mt-4 text-3xl font-black text-white">Admin access required</h1>
          <p className="mt-3 text-slate-300">Log in with Level 4 Admin or Level 5 Owner access to manage PDFs, CMS, CRM, and billing.</p>
          <Link to="/admin" className="mt-6 inline-flex rounded-md bg-white px-5 py-3 font-bold text-slate-950">
            Go to Admin Login
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-black text-white">
            {view === 'inventory' ? 'CMS and PDF Library' : view === 'orders' ? 'CRM and Orders' : 'Billing Operations'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin-inventory" className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">CMS</Link>
          <Link to="/admin-orders" className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">CRM</Link>
          <Link to="/admin-billing" className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Billing</Link>
        </div>
      </div>

      {view === 'inventory' && (
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <form onSubmit={handlePublish} className="rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <UploadCloud className="h-5 w-5 text-cyan-200" />
              <h2 className="font-black text-white">Upload PDF product</h2>
            </div>
            {['Title', 'Author', 'Price', 'Category', 'License', 'Status'].map((label) => (
              <label key={label} className="mt-4 block text-sm font-semibold text-slate-300">
                {label}
                <input name={label} required={label !== 'Status'} className="mt-2 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-cyan-300/50" />
              </label>
            ))}
            <label className="mt-4 block text-sm font-semibold text-slate-300">
              PDF file
              <div className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-white/20 bg-slate-950/70 p-8 text-slate-400">
                <FileUp className="mr-2 h-5 w-5" />
                {pdfFile ? pdfFile.name : 'Drop PDF or select file'}
              </div>
              <input
                accept="application/pdf"
                className="mt-3 block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-slate-950"
                type="file"
                onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-bold text-slate-950">
              <UploadCloud className="h-4 w-4" />
              Publish to CMS
            </button>
            {publishStatus && <p className="mt-3 text-sm font-semibold text-cyan-100">{publishStatus}</p>}
          </form>

          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="font-black text-white">Product CMS</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
              {products.map((product) => (
                <div key={product.id} className="grid gap-3 border-b border-white/10 p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <p className="font-bold text-white">{product.title}</p>
                    <p className="text-sm text-slate-400">{product.category} / {product.license}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-200">${product.price.toFixed(2)}</span>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-cyan-100">{product.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'orders' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="font-black text-white">Orders and customers</h2>
            <div className="mt-4 grid gap-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-bold text-white">{order.id} / {order.customer}</p>
                    <span className="text-sm font-bold text-cyan-100">{order.amount}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{order.product} / {order.status} / {order.date}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="font-black text-white">CRM actions</h2>
            <div className="mt-4 grid gap-3">
              {['Send receipt', 'Grant download link', 'Issue support credit', 'Tag pro customer'].map((action) => (
                <button key={action} className="rounded-md border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-white/10">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'billing' && (
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['Stripe Checkout', isStripeTestMode ? 'Test publishable key detected. Create test checkout intents before live payments.' : 'Add VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... to enable test checkout SDK readiness.'],
            ['Billing Portal', stripePublishableKey ? 'SDK is loaded on the client; portal sessions still need a backend endpoint.' : 'Portal is planned after checkout and webhook verification.'],
            ['Tax and license rules', 'Track commercial licenses, discounts, and regional tax settings.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-5">
              <CreditCard className="h-6 w-6 text-cyan-200" />
              <h2 className="mt-4 font-black text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Storefront({ pageId }: { pageId?: string }) {
  const [query, setQuery] = useState('')
  const defaultCategory = pageId === 'genre-fantasy' || pageId === 'genre-biography'
    ? 'Kids'
    : pageId === 'genre-scifi' || pageId === 'genre-mystery'
      ? 'Teens'
      : pageId === 'genre-classics' || pageId === 'genre-history' || pageId === 'genre-poetry'
        ? 'Adults'
        : pageId === 'genre-dystopian'
          ? 'Pro'
          : 'All'
  const [category, setCategory] = useState(defaultCategory)
  const routeProducts = products.filter((product) => {
    if (pageId === 'bestsellers') return ['anime-techwear', 'mandala-master', 'pro-svg-mandala', 'kids-safari'].includes(product.id)
    if (pageId === 'newreleases') return ['vaporwave-futures', 'city-skylines', 'steampunk-blueprints', 'magic-castles'].includes(product.id)
    if (pageId === 'bookofmonth') return product.id === 'mandala-master'
    return true
  })
  const filtered = routeProducts.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category
    const q = query.toLowerCase()
    const matchesQuery = !q || product.title.toLowerCase().includes(q) || product.author.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })
  const headline = pageId === 'bestsellers'
    ? 'Best-selling printable art packs'
    : pageId === 'newreleases'
      ? 'Fresh art drops ready for download'
      : pageId === 'bookofmonth'
        ? 'Design collection of the month'
        : 'Printable PDF coloring books ready to sell'
  const subhead = pageId === 'bookofmonth'
    ? 'A focused editorial pick with a clear buy path, license detail, and instant delivery promise.'
    : 'Browse premium printable coloring packs, preview the license, and buy instant PDF downloads.'

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="relative min-h-96 overflow-hidden rounded-lg border border-white/10 bg-cover bg-center p-6"
          style={{ backgroundImage: "url('/media/chromatic-hero-workspace.png')" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,18,0.92),rgba(5,7,18,0.64)_48%,rgba(5,7,18,0.12))]" />
          <div className="relative z-10 flex min-h-[21rem] flex-col justify-end">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Chromatic Bookstore</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">{headline}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100">{subhead}</p>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <a href="#catalog" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-bold text-slate-950">
              <ShoppingCart className="h-4 w-4" />
              Shop PDFs
            </a>
            <Link to="/bookofmonth" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-slate-950/35 px-5 py-3 font-bold text-white hover:bg-white/10">
              <BookOpen className="h-4 w-4" />
              Monthly pick
            </Link>
            <Link to="/admin" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-slate-950/35 px-5 py-3 font-bold text-white hover:bg-white/10">
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-amber-200" />
              <p className="font-black text-white">Selling flow</p>
            </div>
            <div className="mt-4 grid gap-3">
              {[
                ['Discover', 'Search, category filter, and curated routes.'],
                ['Evaluate', 'Pages, license, price, and sample preview.'],
                ['Checkout', 'Stripe-ready buy buttons and receipts.'],
                ['Deliver', 'Firebase Storage download links for PDFs.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-md border border-white/10 bg-slate-950/55 p-3">
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['18', 'live packs'],
              ['300dpi', 'print ready'],
              ['0 min', 'delivery'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="font-bold text-white">Shop by audience</p>
            <div className="mt-3 grid gap-2">
              {['All', 'Kids', 'Teens', 'Adults', 'Pro'].map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${category === item ? 'bg-white text-slate-950' : 'bg-slate-950/60 text-slate-300 hover:bg-white/10'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="font-bold text-white">Trust signals</p>
            <div className="mt-3 space-y-3 text-sm text-slate-300">
              <div className="flex gap-2"><Download className="mt-0.5 h-4 w-4 text-cyan-200" /> Instant PDF delivery</div>
              <div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-200" /> Secure checkout ready</div>
              <div className="flex gap-2"><Truck className="mt-0.5 h-4 w-4 text-cyan-200" /> No physical shipping</div>
            </div>
          </div>
        </aside>

        <div id="catalog">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books, packs, or artists" className="w-full rounded-md border border-white/10 bg-slate-950/70 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-300/50" />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-300">
              <Filter className="h-4 w-4 text-slate-400" />
              {filtered.length} packs
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoPage({ title }: { title: string }) {
  const [sent, setSent] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">{title}</p>
        <h1 className="mt-3 text-4xl font-black text-white">{title === 'Contact' ? 'Customer support and wholesale inquiries' : `${title} for Chromatic Bookstore`}</h1>
      </div>
      {title === 'Contact' ? (
        <form onSubmit={submit} className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-5">
          <input required placeholder="Name" className="rounded-md border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none" />
          <input required type="email" placeholder="Email" className="rounded-md border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none" />
          <textarea required rows={5} placeholder="Message" className="rounded-md border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none" />
          <button className="inline-flex w-fit items-center gap-2 rounded-md bg-white px-5 py-3 font-bold text-slate-950">
            <Mail className="h-4 w-4" />
            Send
          </button>
          {sent && <p className="text-sm font-semibold text-cyan-100">Message captured in demo mode.</p>}
        </form>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {['Customer trust', 'Instant delivery', 'Creator licensing'].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-5">
              <Sparkles className="h-5 w-5 text-cyan-200" />
              <h2 className="mt-4 font-black text-white">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Professional bookstore content surface ready for CMS-backed copy.</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function StorefrontPage() {
  const { pageId } = useParams()

  if (pageId === 'admin') return <AdminLogin />
  if (pageId === 'admin-inventory') return <AdminDashboard view="inventory" />
  if (pageId === 'admin-orders') return <AdminDashboard view="orders" />
  if (pageId === 'admin-billing') return <AdminDashboard view="billing" />
  if (pageId === 'about' || pageId === 'contact' || pageId === 'faq' || pageId === 'terms' || pageId === 'privacy') {
    return <InfoPage title={pageTitle(pageId)} />
  }

  return <Storefront pageId={pageId} />
}
