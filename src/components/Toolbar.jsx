// ═══════════════════════════════════════════════
// SHAJRA APP — Toolbar Component
// ═══════════════════════════════════════════════

import React, { useEffect } from 'react'
import styles from '../styles/Toolbar.module.css'

export default function Toolbar({
  editMode,
  search,
  savedAt,
  saveMode,
  onExpandAll,
  onCollapseAll,
  onToggleEdit,
  onReset,
  onSearch,
  onPrint,
  onExport,
}) {
  // Keyboard shortcut: Ctrl/Cmd+F → focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        document.getElementById('searchInput')?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className={styles.toolbar}>
      {/* Left actions */}
      <div className={styles.left}>
        <button className={styles.btn} onClick={onExpandAll}>
          ⊞ Expand All
        </button>
        <button className={styles.btn} onClick={onCollapseAll}>
          ⊟ Collapse All
        </button>
        <button
          className={`${styles.btn} ${editMode ? styles.btnActive : ''}`}
          onClick={onToggleEdit}
        >
          {editMode ? '✓ Edit Mode ON' : '✎ Edit Mode'}
        </button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onReset}>
          ↺ Reset
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <input
          id="searchInput"
          className={styles.searchInput}
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search name… (Ctrl+F)"
        />
        {search && (
          <button className={styles.searchClear} onClick={() => onSearch('')}>
            ×
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className={styles.right}>
        {savedAt && (
          <span className={styles.savedBadge} key={savedAt}>
            {saveMode === 'file' ? '💾 Saved to file' : '✓ Saved'}
          </span>
        )}
        <button className={`${styles.btn} ${styles.btnPrint}`} onClick={onPrint}>
          ⎙ Print
        </button>
        <button className={`${styles.btn} ${styles.btnExport}`} onClick={onExport}>
          ↓ Export JSON
        </button>
      </div>
    </div>
  )
}
