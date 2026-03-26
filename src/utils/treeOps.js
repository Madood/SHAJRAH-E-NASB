// ═══════════════════════════════════════════════
// SHAJRA APP — Tree Operations (pure functions)
// ═══════════════════════════════════════════════

let _seq = 1000
export const generateId = () => `n${++_seq}_${Math.random().toString(36).slice(2, 5)}`

/** Deep clone a node */
export const cloneTree = (node) => JSON.parse(JSON.stringify(node))

/** Collect all IDs in the subtree */
export const getAllIds = (node, set = new Set()) => {
  set.add(node.id)
  ;(node.children || []).forEach((c) => getAllIds(c, set))
  return set
}

/** Collect IDs of nodes whose nasl < maxNasl so those nodes render as expanded,
 *  making their children (at maxNasl) visible but not expanded further. */
export const getIdsUpToNasl = (node, maxNasl, set = new Set()) => {
  if ((node.nasl || 1) < maxNasl) {
    set.add(node.id)
    ;(node.children || []).forEach((c) => getIdsUpToNasl(c, maxNasl, set))
  }
  return set
}

/** Count all descendants */
export const countDescendants = (node) =>
  (node.children || []).reduce((s, c) => s + 1 + countDescendants(c), 0)

/** Find a node by id, return it or null */
export const findNode = (node, id) => {
  if (node.id === id) return node
  for (const c of node.children || []) {
    const found = findNode(c, id)
    if (found) return found
  }
  return null
}

/** Immutably add a child to a parent */
export const addChild = (tree, parentId, child) => {
  if (tree.id === parentId) {
    return { ...tree, children: [...(tree.children || []), child] }
  }
  return {
    ...tree,
    children: (tree.children || []).map((c) => addChild(c, parentId, child)),
  }
}

/** Immutably remove a node by id */
export const removeNode = (tree, id) => ({
  ...tree,
  children: (tree.children || [])
    .filter((c) => c.id !== id)
    .map((c) => removeNode(c, id)),
})

/** Immutably update a node's data */
export const updateNode = (tree, id, data) => {
  if (tree.id === id) return { ...tree, ...data }
  return {
    ...tree,
    children: (tree.children || []).map((c) => updateNode(c, id, data)),
  }
}

/** Collect IDs matching a search query */
export const searchNodes = (node, query) => {
  const hits = new Set()
  if (!query.trim()) return hits
  const lq = query.toLowerCase()
  const walk = (n) => {
    const match =
      n.name.toLowerCase().includes(lq) || (n.nameAr || '').includes(query)
    if (match) hits.add(n.id)
    ;(n.children || []).forEach(walk)
  }
  walk(node)
  return hits
}

/** Find ancestor IDs for a set of node IDs */
export const findAncestors = (tree, targetIds) => {
  const ancestors = new Set()
  const dfs = (node, path) => {
    if (targetIds.has(node.id)) {
      path.forEach((id) => ancestors.add(id))
    }
    ;(node.children || []).forEach((c) => dfs(c, [...path, node.id]))
  }
  dfs(tree, [])
  return ancestors
}
