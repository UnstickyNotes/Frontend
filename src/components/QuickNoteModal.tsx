import { useState, useEffect, useRef } from 'react'
import Modal from './Modal'
import type { Collection } from '../types'
import { COLLECTION_COLORS, UNSORTED_COLOR, getCollectionColor } from '../utils/collectionColors'

function XIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface QuickNoteModalProps {
  isOpen:       boolean
  onClose:      () => void
  onSubmit:     (body: string, collectionId?: number) => Promise<void> | void
  collections?: Collection[]
}

export default function QuickNoteModal({
  isOpen,
  onClose,
  onSubmit,
  collections = [],
}: QuickNoteModalProps) {
  const [body, setBody]                   = useState('')
  const [selectedColId, setSelectedColId] = useState<number>(-1)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const textareaRef                       = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setBody('')
      setError('')
      setLoading(false)
      setSelectedColId(-1)
      setTimeout(() => textareaRef.current?.focus(), 30)
    }
  }, [isOpen])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (loading) return
    const trimmed = body.trim()
    if (!trimmed) {
      // Empty string or only whitespaces: ignore submission cleanly
      onClose()
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit(trimmed, selectedColId !== -1 ? selectedColId : undefined)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not save the note.')
    } finally {
      setLoading(false)
    }
  }

  const realCollections = collections.filter(c => c.id !== -1 && String(c.id) !== '-1')
  const accentColor = getCollectionColor(selectedColId, collections)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => handleSubmit()}
      maxWidth="480px"
      showAccentBar
      accentColor={accentColor}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Quick Note</h3>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* Body Input */}
        <div className="modal-field" style={{ marginTop: '0.625rem' }}>
          <textarea
            ref={textareaRef}
            id="quick-note-body"
            className="modal-input modal-textarea"
            placeholder="Write your note here... (Enter to save, Shift+Enter for new line)"
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            rows={5}
            style={{ minHeight: '130px', resize: 'vertical', lineHeight: '1.6' }}
            autoFocus
          />
        </div>

        {/* Collections selector at the bottom of the text area */}
        <div className="modal-field" style={{ marginTop: '0.75rem' }}>
          <label className="modal-label" style={{ marginBottom: '0.375rem', display: 'block' }}>
            Collection
          </label>
          <div className="modal-chips" style={{ maxHeight: '90px', overflowY: 'auto' }}>
            {/* Unsorted chip (default) */}
            <button
              type="button"
              className={`collection-chip${selectedColId === -1 || !selectedColId ? ' active' : ''}`}
              onClick={() => setSelectedColId(-1)}
            >
              <span className="chip-dot" style={{ background: UNSORTED_COLOR }} />
              Unsorted
            </button>

            {/* Real collections */}
            {realCollections.map((col, idx) => (
              <button
                type="button"
                key={String(col.id)}
                className={`collection-chip${Number(selectedColId) === Number(col.id) ? ' active' : ''}`}
                onClick={() => setSelectedColId(Number(col.id))}
              >
                <span
                  className="chip-dot"
                  style={{ background: COLLECTION_COLORS[idx % COLLECTION_COLORS.length] }}
                />
                {col.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions: Cancel & Save */}
        <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
          <button className="btn-cancel" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-save"
            type="submit"
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Saving…' : 'Save Note'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
