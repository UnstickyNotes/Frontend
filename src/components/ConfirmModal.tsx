import { useState } from 'react'
import Modal from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // Retain open on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-subtitle">{message}</p>
        </div>

        <div className="modal-actions" style={{ marginTop: '1.75rem' }}>
          <button className="btn-cancel" type="button" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={isDestructive ? 'btn-destructive' : 'btn-primary'}
            type="button"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
