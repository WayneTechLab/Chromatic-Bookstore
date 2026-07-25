import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-400 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Chromatic Bookstore</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
            A digital-first bookstore for printable coloring books, seasonal drops, curated collections, and creator-ready licensing.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
            Live at chromatic-bookstore.web.app
          </p>
        </div>

        <div>
          <p className="font-bold text-white">Shop</p>
          <div className="mt-3 grid gap-2">
            <Link to="/" className="hover:text-white">Store</Link>
            <Link to="/bestsellers" className="hover:text-white">Best Sellers</Link>
            <Link to="/newreleases" className="hover:text-white">New Releases</Link>
            <Link to="/bookofmonth" className="hover:text-white">Book Of The Month</Link>
          </div>
        </div>

        <div>
          <p className="font-bold text-white">Support</p>
          <div className="mt-3 grid gap-2">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/faq" className="hover:text-white">FAQ</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="font-bold text-white">Need help with coloring books?</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Reach out for support requests, wholesale bundles, creator licensing, or custom coloring book collections.
          </p>
          <Link to="/contact" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 font-semibold text-slate-950">
            Contact support
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Chromatic Bookstore. Printable coloring book ecommerce.</p>
          <p>Chromatic Bookstore is a product of Wayne Tech Lab LLC.</p>
        </div>
      </div>
    </footer>
  )
}
