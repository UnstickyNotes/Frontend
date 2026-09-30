import { useState, useEffect } from 'react'
import Modal from './Modal'
import type { Collection } from '../types'
import { getCollectionColorByIndex } from '../utils/collectionColors'

function XIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface NewCollectionModalProps {
  isOpen:       boolean
  collections?: Collection[]
  onClose:      () => void
  onSubmit:     (name: string) => Promise<void> | void
}

export default function NewCollectionModal({
  isOpen,
  collections = [],
  onClose,
  onSubmit,
}: NewCollectionModalProps) {
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (isOpen) { setName(''); setError(''); setLoading(false) }
  }, [isOpen])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter a collection name.'); return }
    setLoading(true)
    setError('')
    try {
      await onSubmit(trimmed)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not create collection.')
    } finally {
      setLoading(false)
    }
  }

  const realCols = collections.filter(c => c.id !== -1 && String(c.id) !== '-1')
  const accentColor = getCollectionColorByIndex(realCols.length)

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
          <h3 className="modal-title">New Collection</h3>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="modal-field">
          <label htmlFor="modal-collection-name" className="modal-label">Collection Name</label>
          <input
            id="modal-collection-name"
            className="modal-input"
            type="text"
            placeholder="e.g. Work, Ideas, Recipes…"
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
          <button className="btn-save" type="submit" disabled={loading || !name.trim()} style={{ flex: 1 }}>
            {loading ? 'Creating…' : 'Create Collection'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
