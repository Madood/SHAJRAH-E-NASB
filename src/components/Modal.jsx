// ═══════════════════════════════════════════════
// SHAJRA APP — Modal Component
// ═══════════════════════════════════════════════

import React, { useEffect, useRef } from 'react'
import styles from '../styles/Modal.module.css'
import { BRANCH_OPTIONS } from '../constants/config'

export default function Modal({ mode, form, setForm, onSubmit, onClose }) {
  const nameRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isAdd = mode === 'add'

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { nameRef.current?.focus(); return }
    onSubmit()
  }

  return (
    <div className={styles.overlay} onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className={styles.box}>
        <div className={styles.title}>
          {isAdd ? '＋ Add Descendant' : '✎ Edit Person'}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* English name */}
          <div className={styles.field}>
            <label className={styles.label}>Name (English) *</label>
            <input
              ref={nameRef}
              className={styles.input}
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Hazrat Mian Muhammad ..."
              required
            />
          </div>

          {/* Urdu name */}
          <div className={styles.field}>
            <label className={styles.label}>Name (Urdu / Arabic)</label>
            <input
              className={`${styles.input} ${styles.inputUrdu}`}
              type="text"
              dir="rtl"
              value={form.nameAr}
              onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="مثلاً حضرت میاں محمد ..."
            />
          </div>

          {/* Notes */}
          <div className={styles.field}>
            <label className={styles.label}>Notes / Laqab</label>
            <input
              className={styles.input}
              type="text"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes or title"
            />
          </div>

          {/* Nasl + Branch row */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Nasl (Generation №)</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={20}
                value={form.nasl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nasl: parseInt(e.target.value) || 1 }))
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Branch / Silsila</label>
              <select
                className={styles.select}
                value={form.branch}
                onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              >
                {BRANCH_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RA checkbox */}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={form.ra}
              onChange={(e) => setForm((f) => ({ ...f, ra: e.target.checked }))}
            />
            Radi Allahu Anhu / Anha &nbsp;(RA) &nbsp;—&nbsp; رضی اللہ عنہ
          </label>

          {/* Buttons */}
          <div className={styles.footer}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSave}>
              {isAdd ? 'Add to Shajra' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
