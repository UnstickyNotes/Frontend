import { useState, useEffect } from 'react'
import Modal from './Modal'

interface NewCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void> | void
}

export default function NewCollectionModal({ isOpen, onClose, onSubmit }: NewCollectionModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName('')
      setError('')
      setLoading(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a collection name.')
      return
    }
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-header">
          <h3 className="modal-title">New Collection</h3>
          <p className="modal-subtitle">Give your collection a name to organize your cards.</p>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="modal-collection-name" className="modal-label">
            Collection Name
          </label>
          <input
            id="modal-collection-name"
            className="auth-input"
            type="text"
            placeholder="e.g. Work, Ideas, Recipes…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Creating…' : 'Create Collection'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
