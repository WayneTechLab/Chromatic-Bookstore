import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown, Crown, LogIn, LogOut, Menu, ShieldCheck, Sparkles, User, X } from 'lucide-react'
import { ACCOUNT_LEVELS, getAccountCapabilities, getAccountLevelDefinition, normalizeAccountLevel, type AccountLevel } from '@/auth/accountLevels'
import { useFirebaseSession } from '@/auth/firebaseSession'
import { useAccountLevel } from '@/auth/useAccountLevel'

const links = [
  { to: '/', label: 'Store', end: true },
  { to: '/bestsellers', label: 'Best Sellers' },
  { to: '/newreleases', label: 'New Releases' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const publicActions = [
  { to: '/', label: 'Store' },
  { to: '/bestsellers', label: 'Best Sellers' },
  { to: '/newreleases', label: 'New Releases' },
]

const adminActions = [
  { to: '/admin', label: 'Admin' },
  { to: '/admin-inventory', label: 'CMS' },
  { to: '/admin-orders', label: 'CRM' },
  { to: '/admin-billing', label: 'Billing' },
]

function AccountMenu() {
  const [open, setOpen] = useState(false)
  const { level: demoLevel, setLevel } = useAccountLevel()
  const { user, logout, claimLevel, claimRole, claimsLoading } = useFirebaseSession()
  const effectiveLevel = claimLevel ?? demoLevel
  const definition = getAccountLevelDefinition(effectiveLevel)
  const capabilities = getAccountCapabilities(effectiveLevel)
  const usingClaim = claimLevel !== null
  const buttonLabel = user || effectiveLevel > 0 ? `Level ${effectiveLevel}` : 'Login'

  function handleLevelChange(value: string) {
    setLevel(normalizeAccountLevel(value) as AccountLevel)
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {capabilities.canAccessOwner ? (
          <Crown className="h-4 w-4 text-amber-200" />
        ) : capabilities.canAccessAdmin ? (
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
        ) : user ? (
          <User className="h-4 w-4 text-cyan-200" />
        ) : (
          <LogIn className="h-4 w-4 text-cyan-200" />
        )}
        <span>{buttonLabel}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="border-b border-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
              {user ? 'Signed in' : 'Public access'}
            </p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">Level {effectiveLevel}: {definition.label}</p>
                <p className="mt-1 text-sm text-slate-400">{definition.account} / {definition.billing}</p>
              </div>
              {capabilities.canAccessOwner && (
                <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-xs font-bold text-amber-100">
                  Owner
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{definition.description}</p>
            {user && (
              <p className="mt-2 truncate text-xs text-slate-500">{user.email}</p>
            )}
            {claimRole && (
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Claim role: {claimRole}</p>
            )}
          </div>

          <div className="grid gap-2 p-3">
            {publicActions.map((action) => (
              <NavLink
                key={action.to}
                to={action.to}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {action.label}
              </NavLink>
            ))}
            <NavLink
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Login / Account
            </NavLink>
          </div>

          {capabilities.canAccessAdmin && (
            <div className="border-t border-white/10 p-3">
              <p className="mb-2 px-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Private operations</p>
              <div className="grid gap-2">
                {adminActions.map((action) => (
                  <NavLink
                    key={action.to}
                    to={action.to}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    {action.label}
                  </NavLink>
                ))}
              </div>
              {capabilities.canAccessOwner && (
                <p className="mt-3 rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-xs leading-5 text-amber-100">
                  Level 5 owner controls use server-side checks, MFA guidance, and owner-only recovery policy.
                </p>
              )}
            </div>
          )}

          <div className="border-t border-white/10 p-4">
            <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Demo level
              <select
                value={demoLevel}
                onChange={(event) => handleLevelChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-300/50"
              >
                {ACCOUNT_LEVELS.map((item) => (
                  <option key={item.level} value={item.level}>
                    Level {item.level}: {item.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {usingClaim
                ? 'Firebase custom claim level is active; demo level remains available for local testing.'
                : claimsLoading
                  ? 'Checking Firebase custom claims...'
                  : 'Local demo access only. Production still requires Firebase claims and rules.'}
            </p>
            {user && (
              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-teal-300 via-cyan-300 to-amber-300 text-sm font-black text-slate-950 shadow-[0_0_30px_rgba(53,214,223,0.32)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base text-white">Chromatic Bookstore</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
              Printable coloring books
            </span>
          </span>
        </NavLink>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="hidden lg:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            {links.map((l) => (
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

          <AccountMenu />

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
