// ═══════════════════════════════════════════════
// SHAJRA APP — TreeNode (recursive)
// ═══════════════════════════════════════════════

import React from 'react'
import NodeCard from './NodeCard'
import styles from '../styles/TreeNode.module.css'
import { BRANCH_COLORS } from '../constants/config'

export default function TreeNode({
  node,
  expanded,
  editMode,
  searchHits,
  searchActive,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  depth = 0,
}) {
  const children   = node.children || []
  const hasChildren = children.length > 0
  const isExpanded  = expanded.has(node.id)
  const colors      = BRANCH_COLORS[node.branch] || BRANCH_COLORS.default
  const lineColor   = colors.border

  return (
    <div className={styles.nodeWrap}>
      {/* Card */}
      <NodeCard
        node={node}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        editMode={editMode}
        isMatch={searchHits.has(node.id)}
        searchActive={searchActive}
        onToggle={onToggle}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className={styles.childrenSection}>
          {/* Vertical stem */}
          <div
            className={styles.stemLine}
            style={{
              height: editMode ? 32 : 22,
              background: lineColor,
            }}
          />

          {/* Children row */}
          <div className={styles.childrenRow}>
            {children.map((child, i) => {
              const childColors = BRANCH_COLORS[child.branch] || BRANCH_COLORS.default
              const isFirst  = i === 0
              const isLast   = i === children.length - 1
              const isSingle = children.length === 1

              return (
                <div key={child.id} className={styles.childCol}>
                  {/* Horizontal bar segment */}
                  {!isSingle && (
                    <div
                      className={styles.hBar}
                      style={{
                        left:  isFirst ? '50%' : 0,
                        right: isLast  ? '50%' : 0,
                        background: lineColor,
                      }}
                    />
                  )}

                  {/* Vertical drop to child */}
                  <div
                    className={styles.dropLine}
                    style={{
                      background: `linear-gradient(to bottom, ${lineColor}, ${childColors.border})`,
                    }}
                  />

                  {/* Recurse */}
                  <TreeNode
                    node={child}
                    expanded={expanded}
                    editMode={editMode}
                    searchHits={searchHits}
                    searchActive={searchActive}
                    onToggle={onToggle}
                    onAdd={onAdd}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    depth={depth + 1}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
