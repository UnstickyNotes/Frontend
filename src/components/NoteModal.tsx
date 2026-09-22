import { useState, useEffect, type KeyboardEvent } from 'react'
import Modal from './Modal'
import CollectionDropdown from './CollectionDropdown'
import type { Collection } from '../types'

interface NoteModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialTitle?: string
  initialBody?: string
  /** Pre-select a collection when the modal opens. -1 = Unsorted. */
  initialCollectionId?: number
  /** Full list of the user's real collections (not including virtual Unsorted). */
  collections?: Collection[]
  onClose: () => void
  onSubmit: (data: { title?: string; body?: string; collectionId?: number }) => Promise<void> | void
}

export default function NoteModal({
  isOpen,
  mode,
  initialTitle = '',
  initialBody = '',
  initialCollectionId,
  collections = [],
  onClose,
  onSubmit,
}: NoteModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | undefined>(initialCollectionId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset fields every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setBody(initialBody)
      setSelectedCollectionId(initialCollectionId)
      setError('')
      setLoading(false)
      // window.addEventListener('keydown', (e)=>{
      //   if(e.key === 'Enter') onSubmit({
      //     title: initialTitle.trim(),
      //     body: initialBody.trim(),
      //     collectionId: initialCollectionId
      //   })
      // })
    }
  }, [isOpen, initialTitle, initialBody, initialCollectionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!trimmedTitle && !trimmedBody) {
      setError('Please enter a card title or content.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onSubmit({
        title: trimmedTitle || undefined,
        body: trimmedBody || undefined,
        collectionId: selectedCollectionId,
      })
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not save the card.')
    } finally {
      setLoading(false)
    }
  }

  const isEdit = mode === 'edit'
  const hasContent = Boolean(title.trim() || body.trim())
  const isUnchanged =
    isEdit &&
    title.trim() === initialTitle &&
    body.trim() === initialBody &&
    selectedCollectionId === initialCollectionId

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="480px">
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Card' : 'New Card'}</h3>
          <p className="modal-subtitle">
            {isEdit ? 'Update your card title and content.' : 'Add a new card to this collection.'}
          </p>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="note-modal-title" className="modal-label">
            Title
          </label>
          <input
            id="note-modal-title"
            className="auth-input"
            type="text"
            placeholder="Card title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="note-modal-body" className="modal-label">
            Content
          </label>
          <textarea
            id="note-modal-body"
            className="auth-input note-modal-textarea"
            placeholder="Write card content…"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
          />
        </div>

        {/* Collection picker */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="modal-label" style={{ display: 'block', marginBottom: '0.375rem' }}>
            Collection
          </label>
          <CollectionDropdown
            collections={collections}
            value={selectedCollectionId}
            onChange={(id) => setSelectedCollectionId(Number(id))}
            placement="up"
          />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            type="submit"
            disabled={loading || !hasContent || isUnchanged}
          >
            {loading ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save Changes' : 'Create Card'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
