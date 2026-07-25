import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, ShieldCheck, Sparkles } from 'lucide-react'
import { useFirebaseSession } from '@/auth/firebaseSession'

const readiness = [
  'Google popup auth for local development',
  'Persistent session on this browser',
  'Clear localhost authorization guidance',
  'Admin handoff after authentication',
]

export function LoginPage() {
  const { user, loading, error, signInWithGoogle, logout } = useFirebaseSession()

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_30rem]">
        <div className="chromatic-panel p-8 sm:p-10">
          <p className="chromatic-kicker">Unified Login</p>
          <h1 className="mt-4 font-['Fraunces',serif] text-4xl font-black leading-tight text-white sm:text-6xl">
            Sign in with your Google account on localhost.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            This page now uses real Firebase Authentication instead of the local demo selector. Once
            signed in, you can continue into the bookstore admin workspace and we can layer claims,
            MFA, and role checks on top.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {readiness.map((item) => (
              <div key={item} className="chromatic-card rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-200" />
                  <p className="text-sm font-medium text-slate-200">{item}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-200/10 p-4 text-sm leading-6 text-amber-50">
            If Google says localhost is disabled, the fix is in Firebase console for the
            <span className="font-semibold"> `chromatic-bookstore` </span>
            project:
            add <span className="font-semibold">`localhost`</span> under
            <span className="font-semibold"> Authentication → Settings → Authorized domains</span>,
            and make sure the <span className="font-semibold">Google</span> provider is enabled.
          </div>
        </div>

        <aside className="chromatic-panel p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-cyan-100">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Secure Access</p>
              <h2 className="mt-1 text-2xl font-black text-white">Admin sign in</h2>
            </div>
          </div>

          {user ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName ?? user.email ?? 'Signed-in user'}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-white">{user.displayName ?? 'Signed in'}</p>
                    <p className="text-sm text-slate-300">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-200/10 p-4 text-sm text-emerald-50">
                Google authentication is working locally in this browser session.
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/admin" className="chromatic-btn chromatic-btn--primary inline-flex min-h-11 items-center px-5 py-3">
                  Continue to Admin
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="chromatic-btn chromatic-btn--secondary inline-flex min-h-11 items-center px-5 py-3"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <p className="text-sm leading-6 text-slate-300">
                Use the same Google account you want tied to bookstore operations. After this works,
                we can assign admin roles and tighten access rules.
              </p>

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading}
                className="chromatic-btn chromatic-btn--primary inline-flex min-h-11 w-full items-center justify-center gap-3 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck className="h-5 w-5" />
                {loading ? 'Checking session...' : 'Continue with Google'}
              </button>

              {error ? (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-200/10 p-4 text-sm leading-6 text-rose-50">
                  {error}
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
