import { useState, useEffect } from 'react'
import Modal from './Modal'

interface EditCollectionModalProps {
  isOpen: boolean
  initialName?: string
  onClose: () => void
  onSubmit: (newName: string) => Promise<void> | void
}

export default function EditCollectionModal({
  isOpen,
  initialName = '',
  onClose,
  onSubmit,
}: EditCollectionModalProps) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setError('')
      setLoading(false)
    }
  }, [isOpen, initialName])

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
      setError(err?.response?.data?.message || err?.message || 'Could not update collection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-header">
          <h3 className="modal-title">Edit Collection</h3>
          <p className="modal-subtitle">Enter a new name for this collection.</p>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="edit-collection-name-input" className="modal-label">
            Collection Name
          </label>
          <input
            id="edit-collection-name-input"
            className="auth-input"
            type="text"
            placeholder="Collection name"
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
          <button className="btn-primary" type="submit" disabled={loading || !name.trim() || name.trim() === initialName}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
