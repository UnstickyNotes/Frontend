import { useState, useEffect } from 'react'
import Modal from './Modal'
import type { Collection } from '../types'
import { getCollectionColor } from '../utils/collectionColors'

function XIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface EditCollectionModalProps {
  isOpen:        boolean
  initialName?:  string
  collectionId?: string | number | null
  collections?:  Collection[]
  onClose:       () => void
  onSubmit:      (newName: string) => Promise<void> | void
}

export default function EditCollectionModal({
  isOpen,
  initialName = '',
  collectionId,
  collections = [],
  onClose,
  onSubmit,
}: EditCollectionModalProps) {
  const [name, setName]       = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (isOpen) { setName(initialName); setError(''); setLoading(false) }
  }, [isOpen, initialName])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter a collection name.'); return }
    if (trimmed === initialName) { onClose(); return }
    setLoading(true)
    setError('')
    try {
      await onSubmit(trimmed)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not update collection.')
    } finally {
      setLoading(false)
    }
  }

  const accentColor = getCollectionColor(collectionId, collections)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => handleSubmit()}
      maxWidth="420px"
      showAccentBar
      accentColor={accentColor}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-header">
          <h3 className="modal-title">Rename Collection</h3>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="modal-field">
          <label htmlFor="edit-collection-name-input" className="modal-label">Collection Name</label>
          <input
            id="edit-collection-name-input"
            className="modal-input"
            type="text"
            placeholder="Collection name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
            autoFocus
            required
          />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-save"
            type="submit"
            disabled={loading || !name.trim() || name.trim() === initialName}
            style={{ flex: 1 }}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
