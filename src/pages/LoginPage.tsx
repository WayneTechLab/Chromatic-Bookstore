import { ACCOUNT_LEVELS, TEST_ACCOUNTS } from '@/auth/accountLevels'
import { useAccountLevel } from '@/auth/useAccountLevel'

export function LoginPage() {
  const { level, definition, capabilities, setLevel } = useAccountLevel()

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
          Unified Login
        </p>
        <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
          Account levels for Firebase, Playwright, and setup checks.
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-300">
          This template starts with a local demo selector so projects can wire
          routes, menus, rules, and tests before live auth is connected. Replace
          the demo resolver with Firebase Auth custom claims during project setup.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-3">
          {ACCOUNT_LEVELS.map((item) => (
            <button
              key={item.level}
              type="button"
              onClick={() => setLevel(item.level)}
              className={`rounded-2xl border p-5 text-left transition-colors ${
                level === item.level
                  ? 'border-violet-400/30 bg-white/10 text-white shadow-[0_10px_30px_rgba(139,92,246,0.12)]'
                  : 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/8'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  Level {item.level} - {item.label}
                </h2>
                <span className="text-sm font-medium">{item.account}</span>
              </div>
              <p className={`mt-3 text-sm leading-6 ${level === item.level ? 'text-slate-200' : 'text-slate-400'}`}>
                {item.description}
              </p>
            </button>
          ))}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Current state</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-slate-400">Level</dt>
              <dd className="text-white">{level}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-400">Label</dt>
              <dd className="text-white">{definition.label}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-400">Login</dt>
              <dd className="text-white">{definition.loginState}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-400">MFA guidance</dt>
              <dd className="text-white">{capabilities.requiresMfa ? 'Required' : 'Optional'}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">Standard test accounts</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEST_ACCOUNTS.map((account) => (
            <div key={account.email} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm font-semibold text-white">{account.email}</p>
              <p className="mt-2 text-sm text-slate-400">
                Level {account.level} / {account.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
