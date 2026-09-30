/** Stable color palette for collections, assigned by index */
export const COLLECTION_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#f97316', // orange
  '#22c55e', // green
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#eab308', // yellow
  '#14b8a6', // teal
  '#6366f1', // indigo
]

/** Gray for Unsorted notes */
export const UNSORTED_COLOR = '#9ca3af'

/**
 * Returns a stable accent color for a collection based on its position
 * in the ordered list of real (non-unsorted) collections.
 */
export function getCollectionColor(
  collectionId: string | number | null | undefined,
  collections: { id: string | number | null }[]
): string {
  if (!collectionId || collectionId === -1 || String(collectionId) === '-1') {
    return UNSORTED_COLOR
  }
  const realCols = collections.filter(c => c.id !== -1 && String(c.id) !== '-1')
  const index = realCols.findIndex(c => String(c.id) === String(collectionId))
  if (index === -1) return UNSORTED_COLOR
  return COLLECTION_COLORS[index % COLLECTION_COLORS.length]
}

/** Returns a color by direct index (useful when you already have the index) */
export function getCollectionColorByIndex(index: number): string {
  return COLLECTION_COLORS[index % COLLECTION_COLORS.length]
}
