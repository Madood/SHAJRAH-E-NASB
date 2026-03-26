// ═══════════════════════════════════════════════
// SHAJRA APP — Legend Component
// ═══════════════════════════════════════════════

import React from 'react'
import styles from '../styles/Legend.module.css'
import { LEGEND_ITEMS } from '../constants/config'

export default function Legend() {
  return (
    <div className={styles.legend}>
      {LEGEND_ITEMS.map(({ color, label }) => (
        <div key={label} className={styles.item}>
          <div
            className={styles.dot}
            style={{ borderColor: color, background: `${color}20` }}
          />
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  )
}
