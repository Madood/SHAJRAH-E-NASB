// ═══════════════════════════════════════════════
// SHAJRA APP — NaslSidebar Component
// ═══════════════════════════════════════════════

import React, { useEffect, useRef, useState, useCallback } from 'react'
import styles from '../styles/NaslSidebar.module.css'
import { NASL_CONFIG } from '../constants/config'

export default function NaslSidebar({ treePanelRef, renderKey, scale = 1, wrapperRef }) {
  const [positions, setPositions] = useState({})
  const [containerH, setContainerH] = useState(400)
  const labelsContainerRef = useRef(null)

  const measure = useCallback(() => {
    const panel = treePanelRef.current
    const labelsContainer = labelsContainerRef.current
    if (!panel || !labelsContainer) return

    const wrapper = wrapperRef?.current
    const pos = {}

    if (wrapper) {
      // Compute positions in tree-space (independent of pan/zoom)
      // so all generations show even when some are off-screen
      const wRect = wrapper.getBoundingClientRect()
      const s = scale || 1
      panel.querySelectorAll('[data-nasl-node]').forEach((el) => {
        const n = parseInt(el.dataset.naslNode, 10)
        const r = el.getBoundingClientRect()
        const treeY = (r.top - wRect.top) / s
        if (pos[n] === undefined || treeY < pos[n].treeY) {
          pos[n] = { treeY }
        }
      })

      if (Object.keys(pos).length === 0) return

      // Map all tree-space Y values proportionally into the sidebar height
      const treeYs = Object.values(pos).map(p => p.treeY)
      const minY  = Math.min(...treeYs)
      const maxY  = Math.max(...treeYs)
      const treeH = maxY - minY || 1
      const panelH  = panel.getBoundingClientRect().height || 400
      const topPad  = panelH * 0.04
      const usableH = panelH * 0.90

      const mapped = {}
      Object.keys(pos).forEach(n => {
        const t = (pos[n].treeY - minY) / treeH
        mapped[parseInt(n)] = { y: topPad + t * usableH }
      })
      setPositions(mapped)
      setContainerH(panelH)
    } else {
      // Fallback: screen-relative positions (original behaviour)
      const labelsRect = labelsContainer.getBoundingClientRect()
      panel.querySelectorAll('[data-nasl-node]').forEach((el) => {
        const n = parseInt(el.dataset.naslNode, 10)
        const r = el.getBoundingClientRect()
        const y = r.top - labelsRect.top + r.height / 2
        if (pos[n] === undefined || r.top < pos[n].rawTop) {
          pos[n] = { y, rawTop: r.top }
        }
      })
      setPositions(pos)
      const ys = Object.values(pos).map(p => p.y)
      if (ys.length) setContainerH(Math.max(...ys) + 70)
    }
  }, [treePanelRef, scale, wrapperRef])

  // Re-measure when tree re-renders or panel scrolls
  useEffect(() => {
    const t = setTimeout(measure, 150)
    return () => clearTimeout(t)
  }, [renderKey, measure])

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
      <div ref={labelsContainerRef} className={styles.labelsContainer} style={{ minHeight: containerH }}>
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
                top: pos.y,
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
