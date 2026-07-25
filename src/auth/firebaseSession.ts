import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { normalizeAccountLevel, type AccountLevel } from '@/auth/accountLevels'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

type SessionState = {
  user: User | null
  loading: boolean
  error: string
  claimsLoading: boolean
  claimLevel: AccountLevel | null
  claimRole: string
}

function explainAuthError(error: unknown) {
  if (!(error instanceof Error)) return 'Google sign-in failed. Check Firebase Auth settings and try again.'

  const message = error.message.toLowerCase()

  if (message.includes('auth/unauthorized-domain') || message.includes('not authorized for oauth operations')) {
    return 'Localhost is not authorized in Firebase Auth yet. Add localhost under Authentication > Settings > Authorized domains for the chromatic-bookstore project.'
  }

  if (message.includes('auth/operation-not-allowed')) {
    return 'Google sign-in is disabled in Firebase Auth. Enable the Google provider under Authentication > Sign-in method.'
  }

  if (message.includes('auth/popup-blocked')) {
    return 'The browser blocked the Google popup. Allow popups for localhost and try again.'
  }

  return error.message
}

export function useFirebaseSession() {
  const [state, setState] = useState<SessionState>({
    user: null,
    loading: Boolean(auth),
    error: '',
    claimsLoading: false,
    claimLevel: null,
    claimRole: '',
  })

  useEffect(() => {
    if (!auth) {
      setState({
        user: null,
        loading: false,
        error: 'Firebase Auth is not configured in this app.',
        claimsLoading: false,
        claimLevel: null,
        claimRole: '',
      })
      return
    }

    setPersistence(auth, browserLocalPersistence).catch(() => {
      // Persistence fallback is safe; auth can still continue for this session.
    })

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({
          user: null,
          loading: false,
          error: '',
          claimsLoading: false,
          claimLevel: null,
          claimRole: '',
        })
        return
      }

      setState((current) => ({
        ...current,
        user,
        loading: false,
        error: '',
        claimsLoading: true,
      }))

      try {
        const token = await user.getIdTokenResult()
        const rawLevel = token.claims.level
        const claimLevel = typeof rawLevel === 'number' || typeof rawLevel === 'string'
          ? normalizeAccountLevel(rawLevel)
          : null
        const claimRole = typeof token.claims.role === 'string' ? token.claims.role : ''

        setState((current) => ({
          ...current,
          user,
          loading: false,
          error: '',
          claimsLoading: false,
          claimLevel,
          claimRole,
        }))
      } catch (error) {
        setState((current) => ({
          ...current,
          user,
          loading: false,
          error: explainAuthError(error),
          claimsLoading: false,
          claimLevel: null,
          claimRole: '',
        }))
      }
    })
  }, [])

  async function signInWithGoogle() {
    if (!auth) {
      setState((current) => ({ ...current, error: 'Firebase Auth is not configured in this app.' }))
      return
    }

    setState((current) => ({ ...current, error: '' }))

    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      setState((current) => ({ ...current, error: explainAuthError(error) }))
    }
  }

  async function logout() {
    if (!auth) return
    await signOut(auth)
  }

  return {
    ...state,
    signInWithGoogle,
    logout,
  }
}
