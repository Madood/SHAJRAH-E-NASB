import { useState, useRef, useCallback, useEffect } from 'react'

const MIN_SCALE = 0.10
const MAX_SCALE = 3.0
const ZOOM_STEP = 0.04

export function usePanZoom() {
  const [scale,  setScale]  = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const isPanning  = useRef(false)
  const lastPos    = useRef({ x: 0, y: 0 })
  const lastDist   = useRef(null)
  const containerRef = useRef(null)
  const wrapperRef   = useRef(null)

  // containerReady triggers the listener useEffect to re-run after the DOM el is assigned
  const [containerReady, setContainerReady] = useState(false)

  const setContainerRef = useCallback((el) => {
    containerRef.current = el
    setContainerReady(!!el)
  }, [])

  // ── Auto-fit: scale to width, align tree to top with 5% margin ──
  const fitToPanel = useCallback(() => {
    const container = containerRef.current
    const wrapper   = wrapperRef.current
    if (!container || !wrapper) return

    const cW = container.clientWidth
    const cH = container.clientHeight
    const wW = wrapper.scrollWidth
    const wH = wrapper.scrollHeight
    if (wW === 0 || wH === 0) return

    const margin   = 0.05
    const scaleX   = (cW * (1 - margin * 2)) / wW
    const scaleY   = (cH * (1 - margin * 2)) / wH
    const newScale = Math.min(scaleX, scaleY, 1)

    const scaledW = wW * newScale
    // Center horizontally; align to top (5% margin) vertically
    const newX = (cW - scaledW) / 2
    const newY = cH * margin

    setScale(parseFloat(newScale.toFixed(3)))
    setOffset({ x: newX, y: newY })
  }, [])

  useEffect(() => {
    const t = setTimeout(fitToPanel, 120)
    return () => clearTimeout(t)
  }, [fitToPanel])

  useEffect(() => {
    window.addEventListener('resize', fitToPanel)
    return () => window.removeEventListener('resize', fitToPanel)
  }, [fitToPanel])

  const resetView = useCallback(() => fitToPanel(), [fitToPanel])

  // ── Mouse ──
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    if (e.target.closest('[data-nasl-node]')) return
    if (e.target.closest('button')) return
    isPanning.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!isPanning.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
  }, [])

  const onMouseUp = useCallback(() => {
    isPanning.current = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }, [])

  // ── Scroll wheel zoom (centered on cursor) ──
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect   = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const normalized = Math.abs(e.deltaY) > 100 ? e.deltaY / 10 : e.deltaY
    const delta = normalized > 0 ? -ZOOM_STEP : ZOOM_STEP
    setScale(prev => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, parseFloat((prev + delta).toFixed(3))))
      setOffset(o => ({
        x: mouseX - (mouseX - o.x) * (next / prev),
        y: mouseY - (mouseY - o.y) * (next / prev),
      }))
      return next
    })
  }, [])

  // ── Touch ──
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      isPanning.current = true
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      isPanning.current = false
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastDist.current = Math.hypot(dx, dy)
    }
  }, [])

  const onTouchMove = useCallback((e) => {
    e.preventDefault()
    if (e.touches.length === 1 && isPanning.current) {
      const dx = e.touches[0].clientX - lastPos.current.x
      const dy = e.touches[0].clientY - lastPos.current.y
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    } else if (e.touches.length === 2 && lastDist.current !== null) {
      const dx   = e.touches[0].clientX - e.touches[1].clientX
      const dy   = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const diff = (dist - lastDist.current) * 0.003
      lastDist.current = dist
      setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, parseFloat((prev + diff).toFixed(3)))))
    }
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) lastDist.current = null
    if (e.touches.length === 0) isPanning.current = false
  }, [])

  // ── Attach non-passive listeners — re-runs when containerReady changes ──
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel',      onWheel,      { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true  })
    return () => {
      el.removeEventListener('wheel',      onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [containerReady, onWheel, onTouchStart, onTouchMove, onTouchEnd])

  // ── Programmatic zoom (buttons) — zoom toward panel center ──
  const zoomIn = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const cx = container.clientWidth  / 2
    const cy = container.clientHeight / 2
    setScale(prev => {
      const next = Math.min(MAX_SCALE, parseFloat((prev + ZOOM_STEP).toFixed(3)))
      setOffset(o => ({
        x: cx - (cx - o.x) * (next / prev),
        y: cy - (cy - o.y) * (next / prev),
      }))
      return next
    })
  }, [])

  const zoomOut = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const cx = container.clientWidth  / 2
    const cy = container.clientHeight / 2
    setScale(prev => {
      const next = Math.max(MIN_SCALE, parseFloat((prev - ZOOM_STEP).toFixed(3)))
      setOffset(o => ({
        x: cx - (cx - o.x) * (next / prev),
        y: cy - (cy - o.y) * (next / prev),
      }))
      return next
    })
  }, [])

  // ── Pan to center a DOM element inside the panel ──
  const panToNode = useCallback((el) => {
    const container = containerRef.current
    if (!container || !el) return
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    const dx = (cRect.left + cRect.width  / 2) - (eRect.left + eRect.width  / 2)
    const dy = (cRect.top  + cRect.height / 2) - (eRect.top  + eRect.height / 2)
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
  }, [])

  // ── Zoom + pan to center a DOM element at a minimum readable scale ──
  const zoomAndPanToNode = useCallback((el, targetScale = 0.72) => {
    const container = containerRef.current
    const wrapper   = wrapperRef.current
    if (!container || !wrapper || !el) return

    // Read current scale directly from the wrapper's inline style transform
    // (avoids stale-closure issues with state-updater functions)
    const m = (wrapper.style.transform || '').match(/scale\(([^)]+)\)/)
    const currentScale = m ? parseFloat(m[1]) : 1
    if (!(currentScale > 0)) return

    // Only zoom IN — never zoom out
    const newScale = Math.max(currentScale, targetScale)

    // Unscaled center of the element inside the panWrapper.
    // wrapper.getBoundingClientRect() already accounts for the current
    // translate+scale transform, so dividing the screen-space delta by
    // currentScale converts back to unscaled panWrapper coordinates.
    const wRect = wrapper.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    if (!eRect.width && !eRect.height) return  // element not in the DOM yet

    const px = (eRect.left + eRect.width  / 2 - wRect.left) / currentScale
    const py = (eRect.top  + eRect.height / 2 - wRect.top)  / currentScale

    const cW = container.clientWidth
    const cH = container.clientHeight

    // Apply both updates in the same React batch
    setScale(newScale)
    setOffset({ x: cW / 2 - px * newScale, y: cH / 2 - py * newScale })
  }, [])

  return {
    setContainerRef,
    wrapperRef,
    scale,
    offset,
    percent: Math.round(scale * 100),
    handlers: { onMouseDown, onMouseMove, onMouseUp },
    zoomIn,
    zoomOut,
    resetView,
    panToNode,
    zoomAndPanToNode,
  }
}
