import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
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
import { createBillingPortalSessionDraft, createCheckoutIntent, createStripeCheckoutSessionDraft, publishProduct } from '@/services/bookstore'

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
  { id: 'kids-safari', title: 'Cute Safari Animals Pack', author: 'ArtbyLucy', price: 4.99, category: 'Kids', pages: 15, license: 'Personal PDF', description: 'Bold animal outlines for early creative play, classroom tables, and rainy-day print sessions.', status: 'Live', badge: 'Starter favorite', accent: 'from-emerald-300 to-cyan-300', coverPosition: '0% 0%' },
  { id: 'magic-castles', title: 'Fairytale Castles & Dragons', author: 'Ink & Quill Studios', price: 5.5, category: 'Kids', pages: 20, license: 'Personal PDF', description: 'Castles, friendly dragons, moons, stars, and storybook pages for young colorists.', status: 'Live', badge: 'Giftable', accent: 'from-rose-300 to-amber-200', coverPosition: '0% 0%' },
  { id: 'anime-techwear', title: 'Anime Legends Techwear', author: 'Hiroshi Sato', price: 12.5, category: 'Teens', pages: 25, license: 'Personal PDF', description: 'High-contrast character sheets with modern fashion, strong poses, and clean printable linework.', status: 'Live', badge: 'Best seller', accent: 'from-cyan-300 to-blue-300', coverPosition: '100% 0%' },
  { id: 'vaporwave-futures', title: 'Vaporwave Neon Futures', author: 'SynthWave Studio', price: 14.5, category: 'Teens', pages: 20, license: 'Personal PDF', description: 'Retro grids, cassettes, chrome, and neon-inspired scenes for marker-friendly coloring.', status: 'Review', badge: 'Fresh drop', accent: 'from-fuchsia-300 to-cyan-300', coverPosition: '100% 0%' },
  { id: 'mandala-master', title: 'Mandala Meditation Masterpieces', author: 'ZenFlow Artistry', price: 10.99, category: 'Adults', pages: 40, license: 'Personal PDF', description: 'Intricate geometric mandalas for focus, relaxation, and premium printable collections.', status: 'Live', badge: 'Monthly pick', accent: 'from-violet-300 to-emerald-200', coverPosition: '0% 100%' },
  { id: 'city-skylines', title: 'Architectural Wonders & Skylines', author: 'ArchLine Designs', price: 15.99, category: 'Adults', pages: 25, license: 'Personal PDF', description: 'Landmarks, streets, and architectural detail for patient coloring and display-ready prints.', status: 'Draft', badge: 'Coming soon', accent: 'from-sky-300 to-slate-100', coverPosition: '0% 100%' },
  { id: 'pro-svg-mandala', title: 'Pro Geometric Mandala SVGs', author: 'Master Vector', price: 49.99, category: 'Pro', pages: 50, license: 'Commercial SVG/PDF', description: 'Layered SVG source files and print-ready PDFs for creators, sellers, and classroom bundles.', status: 'Live', badge: 'Commercial', accent: 'from-amber-200 to-lime-200', coverPosition: '100% 100%' },
  { id: 'steampunk-blueprints', title: 'Steampunk Blueprint Schematics', author: 'Cogs & Copper', price: 29.5, category: 'Pro', pages: 10, license: 'Commercial PDF/PNG', description: 'Printable airship, gear, and machinery layouts with commercial-ready detail.', status: 'Live', badge: 'Pro pack', accent: 'from-orange-200 to-cyan-200', coverPosition: '100% 100%' },
]

const orders = [
  { id: 'CB-1029', customer: 'maria@example.com', product: 'Mandala Meditation Masterpieces', amount: '$10.99', status: 'Paid', date: 'Jul 9', stripe: 'pi_test_9A2', download: 'Delivered', segment: 'Adult wellness' },
  { id: 'CB-1028', customer: 'studio@printlab.test', product: 'Pro Geometric Mandala SVGs', amount: '$49.99', status: 'Paid', date: 'Jul 9', stripe: 'cs_test_P91', download: 'Pending license review', segment: 'Creator pro' },
  { id: 'CB-1027', customer: 'parent@example.com', product: 'Cute Safari Animals Pack', amount: '$4.99', status: 'Delivered', date: 'Jul 8', stripe: 'pi_test_L77', download: 'Delivered', segment: 'Parent' },
]

const cmsTasks = [
  { title: 'PDF upload queue', value: '4', note: '2 ready for metadata, 2 need cover previews' },
  { title: 'Live catalog value', value: '$193.96', note: 'Across active printable coloring packs' },
  { title: 'Needs review', value: '2', note: 'Draft/review products should stay hidden from storefront' },
]

const customers = [
  { name: 'Maria Alvarez', email: 'maria@example.com', level: 'Level 3 Diamond', spend: '$42.96', tags: ['Mandala', 'Monthly pick'], last: 'Today' },
  { name: 'Print Lab Studio', email: 'studio@printlab.test', level: 'Level 2 Pro', spend: '$129.48', tags: ['Commercial license', 'Invoice-ready'], last: 'Today' },
  { name: 'Jamie Parent', email: 'parent@example.com', level: 'Level 1 Member', spend: '$14.97', tags: ['Kids packs', 'Receipt sent'], last: 'Yesterday' },
]

const billingPlans = [
  { name: 'Single PDF Checkout', price: '$4.99-$15.99', mode: 'payment' as const, priceId: 'price_test_coloring_pdf', note: 'Stripe Checkout Session for instant download purchases.' },
  { name: 'Pro Creator Pack', price: '$29.50-$49.99', mode: 'payment' as const, priceId: 'price_test_creator_license', note: 'Commercial license checkout with admin review tags.' },
  { name: 'Monthly Coloring Club', price: '$9.99/mo', mode: 'subscription' as const, priceId: 'price_test_monthly_club', note: 'Stripe Billing subscription draft for later launch.' },
]

const stripeReadiness = [
  { label: 'Stripe.js SDK', state: stripePublishableKey ? 'Configured' : 'Needs pk_test key', detail: stripePublishableKey ? 'Client can load Stripe.js in test mode.' : 'Add VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... when ready.' },
  { label: 'Checkout Sessions', state: 'Demo drafts active', detail: 'Buy buttons and billing actions create test-mode session records.' },
  { label: 'Billing Portal', state: 'Demo drafts active', detail: 'Admin can draft portal sessions until backend endpoint is connected.' },
  { label: 'Webhooks', state: 'Pending CLI', detail: 'Later connect stripe listen for checkout.session.completed and invoice events.' },
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
      setCheckoutStatus(`Stripe test checkout ${checkoutId.slice(0, 14)} ready`)
    } catch (error) {
      setCheckoutStatus(error instanceof Error ? error.message : 'Checkout setup failed')
    }
  }

  return (
    <article className="chromatic-card rounded-2xl p-4 transition">
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
          <button onClick={handleBuy} className="chromatic-btn chromatic-btn--primary inline-flex min-h-10 items-center gap-2 px-4 py-2 text-sm">
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
            Use the Level 4 or Level 5 operator role to unlock CMS, CRM, PDF upload, and billing workspaces for Chromatic Bookstore. This is wired as a local demo gate until Firebase Auth custom claims are connected.
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
  const [operationStatus, setOperationStatus] = useState('')

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

  async function runStripeAction(action: 'portal' | 'subscription' | 'payment', customerEmail = 'studio@printlab.test') {
    setOperationStatus('Creating Stripe test-mode draft...')
    try {
      if (action === 'portal') {
        const portal = await createBillingPortalSessionDraft({ customerEmail })
        setOperationStatus(`Billing Portal draft ${portal.id.slice(0, 16)} ready for ${portal.customer_email}`)
        return
      }

      const plan = billingPlans.find((item) => item.mode === (action === 'subscription' ? 'subscription' : 'payment')) ?? billingPlans[0]
      const session = await createStripeCheckoutSessionDraft({
        customerEmail,
        mode: action === 'subscription' ? 'subscription' : 'payment',
        priceId: plan.priceId,
      })
      setOperationStatus(`Checkout Session draft ${session.id.slice(0, 16)} ready in ${session.mode} mode`)
    } catch (error) {
      setOperationStatus(error instanceof Error ? error.message : 'Stripe demo action failed')
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
          <form onSubmit={handlePublish} className="chromatic-panel rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <UploadCloud className="h-5 w-5 text-cyan-200" />
              <h2 className="font-black text-white">Upload coloring book PDF</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Creates a CMS product record, stores the PDF in Firebase Storage when available, and falls back to a local demo record during development.
            </p>
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

          <div className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-3">
              {cmsTasks.map((task) => (
                <div key={task.title} className="chromatic-card rounded-2xl p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">{task.title}</p>
                  <p className="mt-3 text-3xl font-black text-white">{task.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{task.note}</p>
                </div>
              ))}
            </div>
            <div className="chromatic-panel rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-black text-white">Product CMS</h2>
                  <p className="mt-1 text-sm text-slate-400">Catalog status, PDF/license metadata, pricing, and storefront visibility.</p>
                </div>
                <button type="button" onClick={() => setOperationStatus('Demo CMS sync queued for Firestore products, Storage PDFs, and Stripe Prices.')} className="chromatic-btn chromatic-btn--secondary px-4 py-2 text-sm">
                  Queue CMS sync
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
                {products.map((product) => (
                  <div key={product.id} className="grid gap-3 border-b border-white/10 p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                    <div>
                      <p className="font-bold text-white">{product.title}</p>
                      <p className="text-sm text-slate-400">{product.category} / {product.pages} pages / {product.license}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-200">${product.price.toFixed(2)}</span>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-cyan-100">{product.status}</span>
                    <button type="button" onClick={() => setOperationStatus(`${product.title} is staged for preview, price sync, and PDF delivery QA.`)} className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {operationStatus && <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-50">{operationStatus}</p>}
          </div>
        </div>
      )}

      {view === 'orders' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
          <div className="chromatic-panel rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-white">CRM, orders, and fulfillment</h2>
                <p className="mt-1 text-sm text-slate-400">Track test Stripe references, customer segments, receipt state, and PDF delivery state.</p>
              </div>
              <button type="button" onClick={() => setOperationStatus('CRM sync queued for customer tags, receipts, and download grants.')} className="chromatic-btn chromatic-btn--secondary px-4 py-2 text-sm">
                Sync CRM demo
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-bold text-white">{order.id} / {order.customer}</p>
                    <span className="text-sm font-bold text-cyan-100">{order.amount}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{order.product} / {order.status} / {order.date}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full bg-white/8 px-3 py-1">Stripe {order.stripe}</span>
                    <span className="rounded-full bg-white/8 px-3 py-1">{order.download}</span>
                    <span className="rounded-full bg-white/8 px-3 py-1">{order.segment}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Receipt', 'Download link', 'Support note'].map((action) => (
                      <button key={action} type="button" onClick={() => setOperationStatus(`${action} queued for ${order.customer}.`)} className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-5">
            <div className="chromatic-panel rounded-2xl p-5">
              <h2 className="font-black text-white">Customer profiles</h2>
              <div className="mt-4 grid gap-3">
                {customers.map((customer) => (
                  <div key={customer.email} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="font-bold text-white">{customer.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{customer.email} / {customer.level} / {customer.last}</p>
                    <p className="mt-3 text-sm font-black text-cyan-100">{customer.spend} lifetime spend</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {customer.tags.map((tag) => <span key={tag} className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-slate-300">{tag}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chromatic-panel rounded-2xl p-5">
              <h2 className="font-black text-white">CRM actions</h2>
              <div className="mt-4 grid gap-3">
                {['Send receipt batch', 'Grant download links', 'Issue support credit', 'Tag pro customers'].map((action) => (
                  <button key={action} type="button" onClick={() => setOperationStatus(`${action} staged in demo CRM workflow.`)} className="rounded-md border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-white/10">
                    {action}
                  </button>
                ))}
              </div>
            </div>
            {operationStatus && <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-50">{operationStatus}</p>}
          </div>
        </div>
      )}

      {view === 'billing' && (
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="chromatic-panel rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-cyan-200" />
                <div>
                  <h2 className="font-black text-white">Stripe test-mode command center</h2>
                  <p className="mt-1 text-sm text-slate-400">SDK-ready billing operations for demo products until server API routes and Stripe CLI are connected.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {stripeReadiness.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">{item.label}</p>
                    <p className="mt-2 font-black text-white">{item.state}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
                Stripe secret keys stay server-side. This screen uses Stripe.js readiness plus demo session drafts; later we connect Firebase Functions or API routes for real Checkout Sessions, Customer Portal sessions, webhooks, tax, and fulfillment.
              </div>
            </div>
            <div className="chromatic-panel rounded-2xl p-5">
              <h2 className="font-black text-white">Billing actions</h2>
              <div className="mt-4 grid gap-3">
                <button type="button" onClick={() => runStripeAction('payment')} className="chromatic-btn chromatic-btn--primary justify-center px-4 py-3">
                  Create test Checkout draft
                </button>
                <button type="button" onClick={() => runStripeAction('subscription')} className="chromatic-btn chromatic-btn--secondary justify-center px-4 py-3">
                  Draft monthly subscription
                </button>
                <button type="button" onClick={() => runStripeAction('portal')} className="chromatic-btn chromatic-btn--secondary justify-center px-4 py-3">
                  Draft Billing Portal session
                </button>
              </div>
              <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm font-bold text-white">Mode</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {isStripeTestMode ? 'Stripe publishable key is in test mode.' : stripePublishableKey ? 'Publishable key exists but is not pk_test. Keep live payments disabled.' : 'No publishable key found yet. Demo records still work locally.'}
                </p>
              </div>
              {operationStatus && <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-50">{operationStatus}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {billingPlans.map((plan) => (
              <div key={plan.name} className="chromatic-card rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">{plan.mode === 'subscription' ? 'Subscription' : 'One-time checkout'}</p>
                <h3 className="mt-3 text-xl font-black text-white">{plan.name}</h3>
                <p className="mt-2 text-2xl font-black text-white">{plan.price}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{plan.note}</p>
                <p className="mt-4 rounded-md bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-300">{plan.priceId}</p>
              </div>
            ))}
          </div>
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
    ? 'Best-selling printable coloring books'
    : pageId === 'newreleases'
      ? 'Fresh coloring book drops ready to download'
      : pageId === 'bookofmonth'
        ? 'Coloring book of the month'
        : 'Printable coloring books ready to download'
  const subhead = pageId === 'bookofmonth'
    ? 'A focused editorial pick with a clear buy path, license detail, and instant PDF delivery promise.'
    : 'Browse premium printable coloring books, preview the license, and buy instant PDF downloads for kids, teens, adults, and creators.'
  const routeCta = pageId === 'bestsellers'
    ? { to: '/newreleases', label: 'See new releases' }
    : pageId === 'newreleases'
      ? { to: '/bookofmonth', label: 'View monthly pick' }
      : { to: '/bestsellers', label: 'Browse best sellers' }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="chromatic-hero relative min-h-[34rem] overflow-hidden bg-cover bg-center p-6 sm:p-8"
          style={{ backgroundImage: "url('/media/chromatic-bookstore-hero-hd.png')" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,8,0.98),rgba(4,8,8,0.78)_46%,rgba(4,8,8,0.06)_78%),linear-gradient(0deg,rgba(4,8,8,0.55),transparent_48%)]" />
          <div className="hero-content relative z-10 flex min-h-[30rem] flex-col justify-end">
            <p className="chromatic-kicker text-[11px] font-black uppercase tracking-[0.22em]">Chromatic Bookstore</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[0.98] text-white sm:text-6xl">{headline}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100">{subhead}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              <span className="rounded-full border border-white/15 bg-slate-950/40 px-3 py-1">Instant PDF delivery</span>
              <span className="rounded-full border border-white/15 bg-slate-950/40 px-3 py-1">Curated collections</span>
              <span className="rounded-full border border-white/15 bg-slate-950/40 px-3 py-1">Creator licensing</span>
            </div>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <a href="#catalog" className="chromatic-btn chromatic-btn--primary inline-flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Shop coloring books
              </a>
            <Link to={routeCta.to} className="chromatic-btn chromatic-btn--secondary inline-flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                {routeCta.label}
              </Link>
              <Link to="/admin" className="chromatic-btn chromatic-btn--secondary inline-flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="chromatic-panel rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-amber-200" />
              <p className="font-black text-white">Selling flow</p>
            </div>
            <div className="mt-4 grid gap-3">
              {[
                ['Discover', 'Search, category filters, and curated coloring book routes.'],
                ['Evaluate', 'Pages, license, price, and sample preview.'],
                ['Checkout', 'Stripe-ready buy buttons and receipts.'],
                ['Deliver', 'Firebase Storage download links for printable PDFs.'],
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
              <div key={label} className="chromatic-panel chromatic-stat rounded-2xl p-4">
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-4">
          <div className="chromatic-panel rounded-2xl p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Quick routes</p>
            <div className="mt-3 grid gap-2">
              {[
                ['/', 'Main storefront'],
                ['/bestsellers', 'Top coloring books'],
                ['/newreleases', 'Latest releases'],
                ['/bookofmonth', 'Book of the month'],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="inline-flex items-center justify-between rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
                  {label}
                  <ArrowRight className="h-4 w-4 text-cyan-200" />
                </Link>
              ))}
            </div>
          </div>
          <div className="chromatic-panel rounded-2xl p-4">
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
          <div className="chromatic-panel rounded-2xl p-4">
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
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books, packs, or artists" className="chromatic-field w-full rounded-xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-300/50" />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-300">
              <Filter className="h-4 w-4 text-slate-400" />
              {filtered.length} packs
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-lg font-black text-white">No matching titles yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Try a broader search, switch audience, or jump into the curated routes to keep the buying journey moving.
              </p>
            </div>
          )}
          <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Growth-ready bookstore</p>
              <h2 className="mt-3 text-2xl font-black text-white">Built for discovery, conversion, and digital delivery</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Chromatic Bookstore presents a complete coloring-book ecommerce flow: storefront, checkout path, admin CMS, CRM actions, billing readiness, SEO, and PDF fulfillment workflow.
              </p>
            </div>
            <div className="grid gap-3">
              <Link to="/contact" className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 font-semibold text-white hover:bg-white/10">
                Ask about custom bundles
                <ArrowRight className="h-4 w-4 text-cyan-200" />
              </Link>
              <Link to="/faq" className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 font-semibold text-white hover:bg-white/10">
                Read FAQ and delivery terms
                <ArrowRight className="h-4 w-4 text-cyan-200" />
              </Link>
              <Link to="/admin" className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 font-semibold text-white hover:bg-white/10">
                Open admin workspace
                <ArrowRight className="h-4 w-4 text-cyan-200" />
              </Link>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-sm leading-6 text-slate-300">
            <p className="font-semibold text-white">Product notice</p>
            <p className="mt-2">Chromatic Bookstore is a product of Wayne Tech Lab LLC.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoPage({ title, pageId }: { title: string; pageId: string }) {
  const [sent, setSent] = useState(false)

  const content = {
    about: {
      headline: 'A modern digital bookstore built for curated coloring book sales',
      cards: ['Editorial curation', 'Instant PDF delivery', 'Creator-friendly licensing'],
    },
    services: {
      headline: 'Storefront operations, content merchandising, and digital delivery support',
      cards: ['Merchandising systems', 'Admin tooling', 'Customer support flow'],
    },
    docs: {
      headline: 'Operational docs for launch, deployment, and bookstore workflows',
      cards: ['Setup guidance', 'Deployment workflow', 'Publishing checklist'],
    },
    faq: {
      headline: 'Answers on downloads, access, and licensing',
      cards: ['Download access', 'Licensing basics', 'Support response flow'],
    },
    privacy: {
      headline: 'How customer information and app activity are handled',
      cards: ['Analytics usage', 'Customer records', 'Account access policy'],
    },
    terms: {
      headline: 'Rules for purchases, usage, and digital content delivery',
      cards: ['Purchase terms', 'License scope', 'Refund expectations'],
    },
    contact: {
      headline: 'Customer support and wholesale inquiries',
      cards: [],
    },
  }[pageId]

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">{title}</p>
        <h1 className="mt-3 text-4xl font-black text-white">{content?.headline || `${title} for Chromatic Bookstore`}</h1>
        {pageId !== 'contact' && (
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            This page is tuned to support stronger search context, better internal linking, and a more complete customer journey around the Chromatic Bookstore catalog.
          </p>
        )}
      </div>
      {pageId === 'contact' ? (
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
          {(content?.cards || ['Customer trust', 'Instant delivery', 'Creator licensing']).map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-5">
              <Sparkles className="h-5 w-5 text-cyan-200" />
              <h2 className="mt-4 font-black text-white">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Professional bookstore content surface ready for CMS-backed copy and real product details.</p>
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
  if (pageId === 'about' || pageId === 'contact' || pageId === 'faq' || pageId === 'terms' || pageId === 'privacy' || pageId === 'services' || pageId === 'docs') {
    return <InfoPage title={pageTitle(pageId)} pageId={pageId} />
  }

  return <Storefront pageId={pageId} />
}
