// ═══════════════════════════════════════════════
// SHAJRA APP — Header Component
// ═══════════════════════════════════════════════

import React from 'react'
import styles from '../styles/Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.corner} data-pos="tl" />
      <div className={styles.corner} data-pos="tr" />
      <div className={styles.corner} data-pos="bl" />
      <div className={styles.corner} data-pos="br" />

      <div className={styles.bismillah}>
        بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
      </div>

      <div className={styles.divider}>✦ ✦ ✦</div>

      <h1 className={styles.titleAr}>
        شجرہ نسب حضرت خواجہ نور محمد مہاروی رحمۃ اللہ علیہ
      </h1>

      <div className={styles.divider}>✦ ✦ ✦</div>

      <p className={styles.titleEn}>
        Lineage of Hazrat Khwaja Noor Muhammad Maharvi (RA)
      </p>
    </header>
  )
}
