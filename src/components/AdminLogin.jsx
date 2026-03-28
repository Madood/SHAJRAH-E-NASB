// ═══════════════════════════════════════════════
// SHAJRA APP — Admin Login Modal
// ═══════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react'
import styles from '../styles/AdminLogin.module.css'

export default function AdminLogin({ onSuccess, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(false)
  const [shake, setShake]       = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSuccess(password, (ok) => {
      if (!ok) {
        setError(true)
        setShake(true)
        setPassword('')
        setTimeout(() => setShake(false), 500)
        inputRef.current?.focus()
      }
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.box} ${shake ? styles.shake : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.icon}>🔐</div>
        <h2 className={styles.title}>Admin Access</h2>
        <p className={styles.sub}>Enter admin password to enable editing</p>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            placeholder="Password"
            autoComplete="current-password"
          />
          {error && (
            <p className={styles.errorMsg}>Incorrect password. Try again.</p>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={!password}>
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
