import { useState } from 'react'
import Modal from './Modal'

function XIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface ConfirmModalProps {
  isOpen:         boolean
  onClose:        () => void
  onConfirm:      () => Promise<void> | void
  title:          string
  message:        string
  confirmText?:   string
  cancelText?:    string
  isDestructive?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText   = 'Confirm',
  cancelText    = 'Cancel',
  isDestructive = false,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // retain open on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} onConfirm={handleConfirm} maxWidth="400px">
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close">
          <XIcon />
        </button>
      </div>

      <p className="modal-subtitle">{message}</p>

      <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
        <button className="btn-cancel" type="button" onClick={onClose} disabled={loading}>
          {cancelText}
        </button>
        <button
          className={isDestructive ? 'btn-destructive' : 'btn-primary'}
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? 'Please wait…' : confirmText}
        </button>
      </div>
    </Modal>
  )
}
