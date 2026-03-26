// ═══════════════════════════════════════════════
// SHAJRA APP — Root App Component
// ═══════════════════════════════════════════════

import React, { useState, useRef, useCallback, useEffect } from 'react'
import styles from './styles/App.module.css'

import Header      from './components/Header'
import Toolbar     from './components/Toolbar'
import Legend      from './components/Legend'
import NaslSidebar from './components/NaslSidebar'
import TreeNode    from './components/TreeNode'
import Modal       from './components/Modal'

import { useTree } from './hooks/useTree'
import { useStorage } from './hooks/useStorage'

const EMPTY_FORM = {
  name: '', nameAr: '', notes: '', nasl: 2, branch: 'samad', ra: true,
}

export default function App() {
  const treePanelRef   = useRef(null)
  const chartWrapperRef = useRef(null)
  const mainLayoutRef   = useRef(null)
  const [renderKey, setRenderKey] = useState(0)       // triggers sidebar re-measure
  const [modal, setModal] = useState(null)             // null | { mode:'add'|'edit', ... }
  const [form, setForm]   = useState(EMPTY_FORM)
  const [zoom, setZoom]   = useState(1)
  const { savedAt } = useStorage()

  const {
    tree, expanded, editMode, search, ready, searchHits, saveMode,
    toggleNode, expandAll, collapseAll,
    addChildNode, editNode, deleteNode, resetTree,
    setEditMode, setSearch,
  } = useTree()

  // Force re-render key so NaslSidebar re-measures
  const bumpKey = useCallback(() => setRenderKey((k) => k + 1), [])

  // ── Toggle node (and re-measure) ──
  const handleToggle = useCallback((id) => {
    toggleNode(id)
    setTimeout(bumpKey, 80)
  }, [toggleNode, bumpKey])

  const handleExpandAll = useCallback(() => {
    expandAll()
    setTimeout(bumpKey, 80)
  }, [expandAll, bumpKey])

  const handleCollapseAll = useCallback(() => {
    collapseAll()
    setTimeout(bumpKey, 80)
  }, [collapseAll, bumpKey])

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

  const closeModal = useCallback(() => setModal(null), [])

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

  // ── Zoom ──
  const zoomIn  = useCallback(() => { setZoom(z => Math.min(parseFloat((z + 0.15).toFixed(2)), 1.5)); setTimeout(bumpKey, 80) }, [bumpKey])
  const zoomOut = useCallback(() => { setZoom(z => Math.max(parseFloat((z - 0.15).toFixed(2)), 0.3)); setTimeout(bumpKey, 80) }, [bumpKey])

  // ── Auto-fit zoom on mobile so full chart is visible ──
  const fitMobileZoom = useCallback(() => {
    if (window.innerWidth > 768) return
    const wrapper  = chartWrapperRef.current
    const layout   = mainLayoutRef.current
    if (!wrapper || !layout) return
    const natural   = wrapper.offsetWidth   // layout px (transform never affects this)
    const available = layout.clientWidth
    if (natural > 0) {
      setZoom(parseFloat(Math.max(0.2, available / natural).toFixed(2)))
    }
  }, [])   // no bumpKey — adding it would cause renderKey→fitMobileZoom→bumpKey→renderKey loop

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(fitMobileZoom, 150)
    window.addEventListener('resize', fitMobileZoom)
    return () => { clearTimeout(t); window.removeEventListener('resize', fitMobileZoom) }
  }, [ready, renderKey, fitMobileZoom])


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
        search={search}
        savedAt={savedAt}
        saveMode={saveMode}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onToggleEdit={() => { setEditMode((m) => !m); bumpKey() }}
        onReset={handleReset}
        onSearch={handleSearch}
        onPrint={handlePrint}
        onExport={handleExport}
      />

      {/* ── Search result count ── */}
      {searchActive && (
        <div className={`${styles.searchCount} ${
          searchHits.size ? styles.searchCountFound : styles.searchCountNone
        }`}>
          {searchHits.size
            ? `${searchHits.size} person${searchHits.size > 1 ? 's' : ''} found — highlighted in orange`
            : 'No matches found'}
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
      <div className={styles.mainLayout} ref={mainLayoutRef}>

        {/* Chart wrapper — scaled as one unit */}
        <div
          className={styles.chartWrapper}
          ref={chartWrapperRef}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >

        {/* Nasl Sidebar */}
        <NaslSidebar treePanelRef={treePanelRef} renderKey={renderKey} zoom={zoom} />

        {/* Tree Panel */}
        <div className={styles.treePanel} ref={treePanelRef}>
          <div className={styles.treeInner}>
            {tree && (
              <TreeNode
                node={tree}
                expanded={expanded}
                editMode={editMode}
                searchHits={searchHits}
                searchActive={searchActive}
                onToggle={handleToggle}
                onAdd={openAdd}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* Creator credit — always visible at bottom of tree panel */}
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

        </div>

        </div>{/* end chartWrapper */}

      </div>

      {/* ── Floating chart controls — outside chartWrapper so position:fixed works ── */}
      <div className={styles.chartControls}>
        {/* Expand / Collapse toggle */}
        <button
          className={styles.ctrlBtn}
          onClick={() => expanded.size <= 1 ? handleExpandAll() : handleCollapseAll()}
          title={expanded.size <= 1 ? 'Expand All' : 'Collapse All'}
        >
          {expanded.size <= 1 ? '⊞' : '⊟'}
        </button>

        <div className={styles.ctrlSep} />

        {/* Zoom in */}
        <button
          className={styles.ctrlBtn}
          onClick={zoomIn}
          title="Zoom In"
          disabled={zoom >= 1.5}
        >
          ＋
        </button>

        {/* Zoom level */}
        <span className={styles.ctrlLabel}>{Math.round(zoom * 100)}%</span>

        {/* Zoom out */}
        <button
          className={styles.ctrlBtn}
          onClick={zoomOut}
          title="Zoom Out"
          disabled={zoom <= 0.3}
        >
          －
        </button>
      </div>

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

    </div>
  )
}
