import { useState, useEffect } from 'react'
import Modal from './Modal'
import { COLLECTION_COLORS, UNSORTED_COLOR, getCollectionColor } from '../utils/collectionColors'
import type { Collection } from '../types'

function XIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface NoteModalProps {
  isOpen:               boolean
  mode:                 'create' | 'edit'
  initialTitle?:        string
  initialBody?:         string
  initialCollectionId?: number
  collections?:         Collection[]
  onClose:              () => void
  onSubmit:             (data: { title?: string; body?: string; collectionId?: number }) => Promise<void> | void
}

export default function NoteModal({
  isOpen,
  mode,
  initialTitle        = '',
  initialBody         = '',
  initialCollectionId,
  collections         = [],
  onClose,
  onSubmit,
}: NoteModalProps) {
  const [title,               setTitle]               = useState(initialTitle)
  const [body,                setBody]                = useState(initialBody)
  const [selectedColId,       setSelectedColId]       = useState<number | undefined>(initialCollectionId)
  const [loading,             setLoading]             = useState(false)
  const [error,               setError]               = useState('')

  // Reset every time modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setBody(initialBody)
      setSelectedColId(initialCollectionId)
      setError('')
      setLoading(false)
    }
  }, [isOpen, initialTitle, initialBody, initialCollectionId])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimTitle = title.trim()
    const trimBody  = body.trim()
    if (!trimTitle && !trimBody) {
      setError('Please enter a note title or content.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({
        title:        trimTitle || undefined,
        body:         trimBody  || undefined,
        collectionId: selectedColId,
      })
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not save the note.')
    } finally {
      setLoading(false)
    }
  }

  const isEdit      = mode === 'edit'
  const hasContent  = Boolean(title.trim() || body.trim())
  const isUnchanged = isEdit
    && title.trim() === initialTitle
    && body.trim()  === initialBody
    && selectedColId === initialCollectionId

  // Real collections (no Unsorted in the list — Unsorted is a separate chip)
  const realCollections = collections.filter(c => c.id !== -1 && String(c.id) !== '-1')
  const accentColor = getCollectionColor(selectedColId, collections)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => handleSubmit()}
      maxWidth="510px"
      showAccentBar
      accentColor={accentColor}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit note' : 'New note'}</h3>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* Title */}
        <div className="modal-field">
          <label htmlFor="note-modal-title" className="modal-label">Title</label>
          <input
            id="note-modal-title"
            className="modal-input"
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
            autoFocus
          />
        </div>

        {/* Content */}
        <div className="modal-field">
          <label htmlFor="note-modal-body" className="modal-label">Content</label>
          <textarea
            id="note-modal-body"
            className="modal-input modal-textarea"
            placeholder="Start writing..."
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
        </div>

        {/* Collection chips */}
        {realCollections.length > 0 && (
          <div className="modal-field">
            <label className="modal-label">Collection</label>
            <div className="modal-chips">
              {/* Unsorted */}
              <button
                type="button"
                className={`collection-chip${!selectedColId || selectedColId === -1 ? ' active' : ''}`}
                onClick={() => setSelectedColId(-1)}
              >
                <span className="chip-dot" style={{ background: UNSORTED_COLOR }} />
                Unsorted
              </button>

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
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button className="btn-cancel" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-save"
            type="submit"
            disabled={loading || !hasContent || isUnchanged}
            style={{ flex: 1 }}
          >
            {loading
              ? (isEdit ? 'Saving…' : 'Creating…')
              : (isEdit ? 'Save changes' : 'Save note')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
