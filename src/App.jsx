// ═══════════════════════════════════════════════
// SHAJRA APP — Root App Component
// ═══════════════════════════════════════════════

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import styles from './styles/App.module.css'

import Header      from './components/Header'
import Toolbar     from './components/Toolbar'
import Legend      from './components/Legend'
import NaslSidebar from './components/NaslSidebar'
import TreeNode    from './components/TreeNode'
import Modal       from './components/Modal'
import ZoomControls from './components/ZoomControls'

import { useTree }    from './hooks/useTree'
import { useStorage } from './hooks/useStorage'
import { usePanZoom } from './hooks/usePanZoom'
import AdminLogin from './components/AdminLogin'

// ── Change this password to whatever you want ──
const ADMIN_PASSWORD = 'maharvi2025'

// Clear any leftover admin session from older versions of the app
sessionStorage.removeItem('shajra_admin')

const EMPTY_FORM = {
  name: '', nameAr: '', notes: '', nasl: 2, branch: 'samad', ra: true,
}

export default function App() {
  const treePanelRef = useRef(null)
  const [renderKey, setRenderKey] = useState(0)
  const [modal, setModal] = useState(null)
  const [form,  setForm]  = useState(EMPTY_FORM)

  const { savedAt } = useStorage()

  const {
    tree, expanded, editMode, search, ready, searchHits, saveMode,
    toggleNode, expandAll, collapseAll,
    addChildNode, editNode, deleteNode, resetTree,
    setEditMode, setSearch,
  } = useTree()

  // ── Pan / zoom ──
  const {
    setContainerRef, wrapperRef, scale, offset, percent,
    handlers, zoomIn, zoomOut, resetView, panToNode, zoomAndPanToNode,
  } = usePanZoom()

  // ── Admin auth ──
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  const handleAdminUnlock = useCallback((password, callback) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      setShowAdminLogin(false)
      callback(true)
    } else {
      callback(false)
    }
  }, [])

  const handleAdminLock = useCallback(() => {
    setIsAdmin(false)
    setEditMode(false)
  }, [setEditMode])

  // Force re-render key so NaslSidebar re-measures
  const bumpKey = useCallback(() => setRenderKey((k) => k + 1), [])

  // ── Toggle node ──
  const handleToggle = useCallback((id) => {
    toggleNode(id)
    setTimeout(bumpKey, 80)
  }, [toggleNode, bumpKey])

  const handleExpandAll = useCallback(() => {
    expandAll()
    setTimeout(bumpKey, 80)
    // Re-centre on root at current scale (tree is too wide to auto-fit readably)
    setTimeout(() => {
      const rootEl = document.querySelector('[data-node-id="root"]')
      if (rootEl) panToNode(rootEl)
    }, 400)
  }, [expandAll, bumpKey, panToNode])

  const handleCollapseAll = useCallback(() => {
    collapseAll()
    setTimeout(bumpKey, 80)
    setTimeout(resetView, 250)
  }, [collapseAll, bumpKey, resetView])

  // ── Modal helpers ──
  const openAdd = useCallback((parentId, parentNasl, branch) => {
    setForm({ ...EMPTY_FORM, nasl: (parentNasl || 1) + 1, branch: branch || 'samad' })
    setModal({ mode: 'add', parentId })
  }, [])

  const openEdit = useCallback((node) => {
    setForm({
      name:   node.name   || '',
      nameAr: node.nameAr || '',
      notes:  node.notes  || '',
      nasl:   node.nasl   || 1,
      branch: node.branch || 'default',
      ra:     !!node.ra,
    })
    setModal({ mode: 'edit', nodeId: node.id })
  }, [])

  const closeModal  = useCallback(() => setModal(null), [])

  const submitModal = useCallback(() => {
    if (!form.name.trim()) return
    if (modal.mode === 'add') {
      addChildNode(modal.parentId, form)
    } else {
      editNode(modal.nodeId, form)
    }
    closeModal()
    setTimeout(bumpKey, 100)
  }, [form, modal, addChildNode, editNode, closeModal, bumpKey])

  // ── Delete ──
  const handleDelete = useCallback((id, name) => {
    if (!window.confirm(`Remove "${name}" and ALL their descendants?\n\nThis cannot be undone.`)) return
    deleteNode(id)
    setTimeout(bumpKey, 80)
  }, [deleteNode, bumpKey])

  // ── Reset ──
  const handleReset = useCallback(() => {
    if (!window.confirm('Reset entire shajra to original data?\n\nAll additions and edits will be lost.')) return
    resetTree()
    setTimeout(bumpKey, 80)
  }, [resetTree, bumpKey])

  // ── Search ──
  const handleSearch = useCallback((q) => {
    setSearch(q)
    setTimeout(bumpKey, 120)
  }, [setSearch, bumpKey])

  // ── Match navigation ──
  const matchIds = useMemo(() => [...searchHits], [search, tree])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  useEffect(() => { setCurrentMatchIndex(0) }, [search])

  // Pan tree panel to center the active search match
  useEffect(() => {
    if (!matchIds.length) return
    const activeId = matchIds[currentMatchIndex]
    if (!activeId) return
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-node-id="${activeId}"]`)
      if (el) zoomAndPanToNode(el)
    }, 250)
    return () => clearTimeout(t)
  }, [matchIds, currentMatchIndex, zoomAndPanToNode])

  const handleNextMatch = useCallback(() => {
    setCurrentMatchIndex((i) => (i + 1) % matchIds.length)
  }, [matchIds.length])

  const handlePrevMatch = useCallback(() => {
    setCurrentMatchIndex((i) => (i - 1 + matchIds.length) % matchIds.length)
  }, [matchIds.length])

  // ── Export JSON ──
  const handleExport = useCallback(() => {
    const json = JSON.stringify(tree, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'shajra.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [tree])

  // ── Print ──
  const handlePrint = () => window.print()

  // ── Loading ──
  if (!ready) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <div className={styles.loadingText}>شجرہ لوڈ ہو رہا ہے…</div>
      </div>
    )
  }

  const searchActive = search.trim().length > 0

  return (
    <div className={styles.pageWrapper}>

      {/* ── HEADER ── */}
      <Header />

      {/* ── TOOLBAR ── */}
      <Toolbar
        editMode={editMode}
        isAdmin={isAdmin}
        search={search}
        savedAt={savedAt}
        saveMode={saveMode}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onToggleEdit={() => { setEditMode((m) => !m); bumpKey() }}
        onReset={handleReset}
        onRequestAdmin={() => setShowAdminLogin(true)}
        onAdminLock={handleAdminLock}
        onSearch={handleSearch}
        onPrint={handlePrint}
        onExport={handleExport}
      />

      {/* ── Search navigation bar ── */}
      {searchActive && (
        <div className={styles.searchNav}>
          {matchIds.length > 0 ? (
            <>
              <button
                className={styles.navArrow}
                onClick={handlePrevMatch}
                disabled={matchIds.length <= 1}
                title="Previous match"
              >‹</button>
              <span className={styles.navCount}>
                <span className={styles.navCurrent}>{currentMatchIndex + 1}</span>
                <span className={styles.navSep}> of </span>
                <span className={styles.navTotal}>{matchIds.length}</span>
                <span className={styles.navLabel}> found</span>
              </span>
              <button
                className={styles.navArrow}
                onClick={handleNextMatch}
                disabled={matchIds.length <= 1}
                title="Next match"
              >›</button>
            </>
          ) : (
            <span className={styles.searchCountNone}>No matches found</span>
          )}
        </div>
      )}

      {/* ── Edit mode banner ── */}
      {editMode && (
        <div className={styles.editBanner}>
          ✎ Edit Mode Active — Each card shows&nbsp;
          <strong>＋ Child</strong>,&nbsp;
          <strong>✎ Edit</strong>, and&nbsp;
          <strong>✕ Remove</strong> buttons
        </div>
      )}

      {/* ── LEGEND ── */}
      <Legend />

      {/* ── MAIN LAYOUT ── */}
      <div className={styles.mainLayout}>
        <div className={styles.chartWrapper}>

          {/* Nasl Sidebar */}
          <NaslSidebar treePanelRef={treePanelRef} renderKey={renderKey} scale={scale} wrapperRef={wrapperRef} />

          {/* Tree Panel — pan/zoom canvas */}
          <div
            className={styles.treePanel}
            ref={(el) => {
              treePanelRef.current = el
              setContainerRef(el)
            }}
            {...handlers}
          >
            {/* Pannable + zoomable canvas */}
            <div
              ref={wrapperRef}
              className={styles.panWrapper}
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            >
              <div className={styles.treeInner}>
                {tree && (
                  <TreeNode
                    node={tree}
                    expanded={expanded}
                    editMode={editMode}
                    searchHits={searchHits}
                    searchActive={searchActive}
                    search={search}
                    activeMatchId={matchIds[currentMatchIndex] || null}
                    onToggle={handleToggle}
                    onAdd={openAdd}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                )}
              </div>

              {/* Creator credit */}
              <div className={styles.creatorRow}>
                <div className={styles.creatorLine} />
                <div className={styles.creatorBox}>
                  <span className={styles.creatorLabel}>ترتیب و تخلیق</span>
                  <span className={styles.creatorDivider}>✦</span>
                  <span className={styles.creatorName}>Sahibzada Abu Madood Maharvi</span>
                  <span className={styles.creatorNameUr}>صاحبزادہ ابو مودود مہاروی</span>
                </div>
                <div className={styles.creatorLine} />
              </div>
            </div>{/* end panWrapper */}

            {/* Zoom controls — outside panWrapper so they stay fixed in corner */}
            <ZoomControls
              percent={percent}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onReset={resetView}
            />
          </div>{/* end treePanel */}

        </div>{/* end chartWrapper */}
      </div>{/* end mainLayout */}

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerDua}>
          اللهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ وَعَلٰى آلِهِ وَصَحْبِهِ أَجْمَعِينَ
        </div>
        Shajra-e-Nasab Mahr Shareef &nbsp;·&nbsp; Interactive Edition &nbsp;·&nbsp; Changes auto-saved
      </footer>

      {/* ── MODAL ── */}
      {modal && (
        <Modal
          mode={modal.mode}
          form={form}
          setForm={setForm}
          onSubmit={submitModal}
          onClose={closeModal}
        />
      )}

      {/* ── ADMIN LOGIN ── */}
      {showAdminLogin && (
        <AdminLogin
          onSuccess={handleAdminUnlock}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

    </div>
  )
}
