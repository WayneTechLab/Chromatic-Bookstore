import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyClP2AxV-EPwFn8-yk2KLhAPuzcWpvMII8',
  authDomain: 'chromatic-bookstore.firebaseapp.com',
  projectId: 'chromatic-bookstore',
  storageBucket: 'chromatic-bookstore.firebasestorage.app',
  messagingSenderId: '444767911955',
  appId: '1:444767911955:web:c69f18c8e610cebc10ffe6',
  measurementId: 'G-YK5N9P1ZP6',
}

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app = isConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null
export const analytics = app ? getAnalytics(app) : null

if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    '[firebase] No VITE_FIREBASE_* config found. Copy .env.example to .env.local and fill it in.',
  )
}
