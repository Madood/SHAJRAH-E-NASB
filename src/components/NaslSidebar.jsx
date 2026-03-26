// ═══════════════════════════════════════════════
// SHAJRA APP — NaslSidebar Component
// ═══════════════════════════════════════════════

import React, { useEffect, useRef, useState, useCallback } from 'react'
import styles from '../styles/NaslSidebar.module.css'
import { NASL_CONFIG } from '../constants/config'

export default function NaslSidebar({ treePanelRef, renderKey, zoom = 1 }) {
  const [positions, setPositions] = useState({})
  const [containerH, setContainerH] = useState(400)

  const measure = useCallback(() => {
    const panel = treePanelRef.current
    if (!panel) return

    const panelRect = panel.getBoundingClientRect()
    const pos = {}

    panel.querySelectorAll('[data-nasl-node]').forEach((el) => {
      const n = parseInt(el.dataset.naslNode, 10)
      const r = el.getBoundingClientRect()
      const y = r.top - panelRect.top + r.height / 2
      if (pos[n] === undefined || r.top < pos[n].rawTop) {
        pos[n] = { y, rawTop: r.top }
      }
    })

    setPositions(pos)
    const ys = Object.values(pos).map((p) => p.y)
    if (ys.length) setContainerH(Math.max(...ys) + 70)
  }, [treePanelRef])

  // Re-measure when tree re-renders, zoom changes, or panel scrolls
  useEffect(() => {
    const t = setTimeout(measure, 150)
    return () => clearTimeout(t)
  }, [renderKey, zoom, measure])

  useEffect(() => {
    window.addEventListener('resize', measure)
    const panel = treePanelRef.current
    if (panel) panel.addEventListener('scroll', measure)
    return () => {
      window.removeEventListener('resize', measure)
      if (panel) panel.removeEventListener('scroll', measure)
    }
  }, [measure, treePanelRef])

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerUr}>نسل</div>
        <div className={styles.headerEn}>GENERATION</div>
      </div>

      {/* Labels container */}
      <div className={styles.labelsContainer} style={{ minHeight: containerH / zoom }}>
        {/* Spine line */}
        <div className={styles.spine} />

        {/* Dynamically positioned labels */}
        {NASL_CONFIG.map(({ n, ur, eng, color }) => {
          const pos = positions[n]
          if (!pos) return null
          return (
            <div
              key={n}
              className={styles.label}
              style={{
                top: pos.y / zoom,
                borderLeftColor: color,
                background: `${color}18`,
              }}
            >
              {/* Glow dot */}
              <div
                className={styles.dot}
                style={{ background: color, boxShadow: `0 0 8px ${color}cc` }}
              />
              {/* Text */}
              <div className={styles.labelText}>
                <div className={styles.labelUr}>{ur}</div>
                <div className={styles.labelEn} style={{ color }}>
                  {eng} Gen.
                </div>
              </div>
              {/* Number circle */}
              <div
                className={styles.labelNum}
                style={{ background: color, boxShadow: `0 0 6px ${color}99` }}
              >
                {n}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div>سلسلہ نسب مہارشریف</div>
        <div className={styles.footerDua}>دعا گو: صاحبزادہ ابو مودود مہاروی</div>
      </div>
    </aside>
  )
}
