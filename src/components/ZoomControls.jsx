import React from 'react'
import styles from '../styles/ZoomControls.module.css'

export default function ZoomControls({ percent, onZoomIn, onZoomOut, onReset }) {
  return (
    <div className={styles.wrap}>
      <button className={styles.btn} onClick={onZoomIn}  title="Zoom in"   >＋</button>
      <button className={styles.pct} onClick={onReset}   title="Reset view">{percent}%</button>
      <button className={styles.btn} onClick={onZoomOut} title="Zoom out"  >－</button>
    </div>
  )
}
