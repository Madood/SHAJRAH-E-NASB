// ═══════════════════════════════════════════════
// SHAJRA APP — NodeCard Component
// ═══════════════════════════════════════════════

import React, { useState } from 'react'
import styles from '../styles/NodeCard.module.css'
import { NASL_CONFIG, BRANCH_COLORS } from '../constants/config'
import { countDescendants } from '../utils/treeOps'

export default function NodeCard({
  node,
  isExpanded,
  hasChildren,
  editMode,
  isMatch,
  searchActive,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}) {
  const isRoot = node.id === 'root'
  const colors = BRANCH_COLORS[node.branch] || BRANCH_COLORS.default
  const naslCfg = NASL_CONFIG.find((x) => x.n === node.nasl)
  const descCount = countDescendants(node)

  const cardWidth =
    isRoot ? 188 :
    node.nasl <= 2 ? 168 :
    node.nasl <= 4 ? 150 :
    node.nasl <= 6 ? 136 :
    node.nasl <= 8 ? 124 : 114

  const cardStyle = {
    width: cardWidth,
    background: colors.bg,
    borderColor: isMatch && searchActive ? '#ff6600' : colors.border,
    boxShadow: isRoot
      ? `0 0 0 3px #1a3a1a, 0 0 0 5px ${colors.border}, 0 8px 28px rgba(0,0,0,0.35)`
      : isMatch && searchActive
        ? `0 0 0 3px rgba(255,102,0,0.35), 0 4px 14px rgba(0,0,0,0.15)`
        : `0 3px 12px rgba(0,0,0,0.14)`,
  }

  const badgeStyle = {
    background: isRoot ? '#c8a032' : colors.border,
  }

  const descStyle = {
    color: colors.border,
    borderColor: colors.border,
    background: `${colors.border}18`,
  }

  const toggleStyle = {
    background: colors.border,
  }

  return (
    <div className={styles.wrap}>
      {/* ── CARD ── */}
      <div
        className={`${styles.card} ${isRoot ? styles.cardRoot : ''}`}
        style={cardStyle}
        data-nasl-node={node.nasl}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        {/* Nasl badge */}
        <div className={styles.badge} style={badgeStyle}>
          {naslCfg ? naslCfg.ur : `نسل ${node.nasl}`}
        </div>

        {/* Descendant count */}
        {descCount > 0 && (
          <div className={styles.descCount} style={descStyle}>
            {descCount}
          </div>
        )}

        {/* English name */}
        <div
          className={styles.nameEn}
          style={{
            color: isRoot ? '#f0dfa0' : colors.text,
            fontSize: isRoot ? 12 : node.nasl <= 2 ? 11.5 : node.nasl <= 4 ? 10.5 : 10,
          }}
        >
          {node.name}
        </div>

        {/* Urdu / Arabic name */}
        {node.nameAr && (
          <div
            className={styles.nameAr}
            style={{
              color: isRoot ? '#c8a032' : colors.border,
              fontSize: isRoot ? 12 : node.nasl <= 3 ? 10.5 : 9.5,
            }}
          >
            {node.nameAr}
          </div>
        )}

        {/* RA */}
        {node.ra && (
          <div
            className={styles.ra}
            style={{ color: isRoot ? 'rgba(200,160,50,0.65)' : 'rgba(80,40,0,0.45)' }}
          >
            رحمۃ اللہ علیہ
          </div>
        )}

        {/* Notes */}
        {node.notes && (
          <div className={styles.notes} style={{ color: colors.sub }}>
            {node.notes}
          </div>
        )}

        {/* Expand / collapse toggle */}
        {hasChildren && (
          <button
            className={styles.toggleBtn}
            style={toggleStyle}
            onClick={(e) => { e.stopPropagation(); onToggle(node.id) }}
            title={isExpanded ? `Collapse (${descCount})` : `Expand (${descCount})`}
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>

      {/* ── EDIT BUTTONS ── */}
      {editMode && (
        <div className={styles.editBtns}>
          <button
            className={`${styles.editBtn} ${styles.editBtnAdd}`}
            style={{ background: colors.border }}
            onClick={() => onAdd(node.id, node.nasl, node.branch)}
          >
            ＋ Child
          </button>
          <button
            className={`${styles.editBtn} ${styles.editBtnEdit}`}
            onClick={() => onEdit(node)}
          >
            ✎
          </button>
          {node.id !== 'root' && (
            <button
              className={`${styles.editBtn} ${styles.editBtnDelete}`}
              onClick={() => onDelete(node.id, node.name)}
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  )
}
