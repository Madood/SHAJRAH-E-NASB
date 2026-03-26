// ═══════════════════════════════════════════════
// SHAJRA APP — useStorage Hook
// ═══════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react'
import { STORAGE_KEY } from '../constants/config'

const IS_DEV = import.meta.env.DEV

export function useStorage() {
  const [savedAt,  setSavedAt]  = useState(null)
  const [saveMode, setSaveMode] = useState('localStorage') // 'file' | 'localStorage'
  const timerRef = useRef(null)

  // Check if the file-save endpoint is available (only in dev)
  useEffect(() => {
    if (!IS_DEV) return
    fetch('/api/save-tree', { method: 'POST', body: '{}' })
      .then(r => r.ok ? setSaveMode('file') : null)
      .catch(() => {})
  }, [])

  const save = useCallback((data) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const json = JSON.stringify(data)

      // Always save to localStorage as backup
      try { localStorage.setItem(STORAGE_KEY, json) } catch {}

      // In dev: also write directly to src/data/shajra.json
      if (IS_DEV) {
        try {
          const res = await fetch('/api/save-tree', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json,
          })
          if (res.ok) {
            setSaveMode('file')
            setSavedAt(Date.now())
            return
          }
        } catch {}
      }

      // Fallback: localStorage only
      setSaveMode('localStorage')
      setSavedAt(Date.now())
    }, 800)
  }, [])

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return { save, load, clear, savedAt, saveMode }
}
