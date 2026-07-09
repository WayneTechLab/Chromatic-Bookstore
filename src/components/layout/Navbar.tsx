import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, Sparkles, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Store', end: true },
  { to: '/bestsellers', label: 'Best Sellers' },
  { to: '/newreleases', label: 'New Releases' },
  { to: '/admin', label: 'Admin' },
  { to: '/admin-inventory', label: 'CMS' },
  { to: '/admin-orders', label: 'CRM' },
  { to: '/admin-billing', label: 'Billing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-all ${
      isActive
        ? 'bg-white/10 text-white ring-1 ring-white/10'
        : 'text-slate-300 hover:bg-white/6 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-3 font-bold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-black text-slate-950 shadow-[0_0_30px_rgba(139,92,246,0.45)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base text-white">Chromatic Bookstore</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
              Digital art packs
            </span>
          </span>
        </NavLink>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="hidden lg:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            {links.slice(0, 7).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={linkClass}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-4 pb-3">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 pt-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
