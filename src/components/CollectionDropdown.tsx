import { useState, useEffect, useRef } from 'react'
import type { Collection } from '../types'

// ── Icons ─────────────────────────────────────────────────────

function FolderIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4a2 2 0 01-2-2V9a2 2 0 00-2-2h-4a2 2 0 00-2 2v2a2 2 0 01-2 2H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────

const UNSORTED: Collection = { id: -1, name: 'Unsorted' }

interface CollectionDropdownProps {
  /** All user collections (excluding the virtual Unsorted). */
  collections: Collection[]
  /** Currently selected collection id. -1 = Unsorted, undefined = nothing pre-selected. */
  value?: number
  onChange: (id: number) => void
  /** Placement hint — 'up' opens the list upward (useful when near page bottom). */
  placement?: 'down' | 'up'
}

export default function CollectionDropdown({
  collections,
  value,
  onChange,
  placement = 'down',
}: CollectionDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // All options = Unsorted first, then real collections
  const allOptions = [UNSORTED, ...collections.filter(c => c.id !== -1)]
  const selected = value !== undefined ? allOptions.find(c => c.id === value) : undefined

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div className="col-dropdown" ref={ref}>
      <button
        type="button"
        className={`col-dropdown-trigger${selected ? ' col-dropdown-trigger--selected' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select collection"
      >
        <span className="col-dropdown-trigger-icon">
          {selected?.id === -1 ? <InboxIcon /> : <FolderIcon />}
        </span>
        <span className="col-dropdown-trigger-label">
          {selected ? selected.name : 'Add to Collection'}
        </span>
        <span className={`col-dropdown-chevron${open ? ' col-dropdown-chevron--open' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div
          className={`col-dropdown-menu${placement === 'up' ? ' col-dropdown-menu--up' : ''}`}
          role="listbox"
          aria-label="Collections"
        >
          {collections.length === 0 ? (
            // No real collections — show Unsorted as the only option + empty hint
            <>
              <button
                type="button"
                role="option"
                aria-selected={value === -1}
                className={`col-dropdown-item${value === -1 ? ' col-dropdown-item--active' : ''}`}
                onClick={() => { onChange(-1); setOpen(false) }}
              >
                <span className="col-dropdown-item-icon"><InboxIcon /></span>
                <span>Unsorted</span>
                {value === -1 && <span className="col-dropdown-item-check"><CheckIcon /></span>}
              </button>
              <p className="col-dropdown-empty">You have no collections yet</p>
            </>
          ) : (
            allOptions.map(col => (
              <button
                key={col.id}
                type="button"
                role="option"
                aria-selected={value === col.id}
                className={`col-dropdown-item${value === col.id ? ' col-dropdown-item--active' : ''}`}
                onClick={() => { onChange(col.id); setOpen(false) }}
              >
                <span className="col-dropdown-item-icon">
                  {col.id === -1 ? <InboxIcon /> : <FolderIcon />}
                </span>
                <span className="col-dropdown-item-name">{col.name}</span>
                {value === col.id && (
                  <span className="col-dropdown-item-check"><CheckIcon /></span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
