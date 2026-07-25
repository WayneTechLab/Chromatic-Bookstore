import { useEffect, useMemo, useState } from 'react'
import {
  getAccountCapabilities,
  getAccountLevelDefinition,
  normalizeAccountLevel,
  type AccountLevel,
} from '@/auth/accountLevels'

const STORAGE_KEY = 'wsg.demo.accountLevel'
const ACCOUNT_LEVEL_EVENT = 'wsg.demo.accountLevel.change'

function readInitialLevel(): AccountLevel {
  if (typeof window === 'undefined') return 0
  const params = new URLSearchParams(window.location.search)
  return normalizeAccountLevel(params.get('level') ?? window.localStorage.getItem(STORAGE_KEY))
}

export function useAccountLevel() {
  const [level, setLevelState] = useState<AccountLevel>(readInitialLevel)

  useEffect(() => {
    function syncLevel() {
      setLevelState(readInitialLevel())
    }

    window.addEventListener('storage', syncLevel)
    window.addEventListener(ACCOUNT_LEVEL_EVENT, syncLevel)

    return () => {
      window.removeEventListener('storage', syncLevel)
      window.removeEventListener(ACCOUNT_LEVEL_EVENT, syncLevel)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(level))
  }, [level])

  const definition = useMemo(() => getAccountLevelDefinition(level), [level])
  const capabilities = useMemo(() => getAccountCapabilities(level), [level])

  return {
    level,
    definition,
    capabilities,
    setLevel: (nextLevel: AccountLevel) => {
      const normalized = normalizeAccountLevel(nextLevel)
      setLevelState(normalized)
      window.localStorage.setItem(STORAGE_KEY, String(normalized))
      window.dispatchEvent(new Event(ACCOUNT_LEVEL_EVENT))
    },
  }
}
