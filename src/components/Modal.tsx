import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  isOpen:         boolean
  onClose:        () => void
  onConfirm?:     () => void
  children:       ReactNode
  maxWidth?:      string
  /** Renders the green accent bar at the very top of the modal */
  showAccentBar?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  children,
  maxWidth      = '440px',
  showAccentBar = false,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Auto-focus inside the modal when it opens so focus is never left on elements behind it
    const focusTimer = setTimeout(() => {
      if (!containerRef.current) return
      const focusable = containerRef.current.querySelector<HTMLElement>(
        'input:not([disabled]), textarea:not([disabled]), button.btn-destructive:not([disabled]), button.btn-primary:not([disabled]), button.btn-save:not([disabled])'
      )
      if (focusable) {
        focusable.focus()
      } else {
        containerRef.current.focus()
      }
    }, 20)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        onClose()
      } else if (e.key === 'Enter') {
        const target = e.target as HTMLElement
        // If user is in a textarea and holds Shift, allow normal newline insertion
        if (target?.tagName === 'TEXTAREA' && e.shiftKey) {
          return
        }

        // If user has focused the Cancel button specifically, let Enter activate Cancel
        if (target?.tagName === 'BUTTON' && target.classList.contains('btn-cancel')) {
          return
        }

        // Stop propagation in capture phase so background elements (like NoteCard) NEVER receive Enter
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        if (onConfirm) {
          onConfirm()
        } else {
          // Look for submit or confirm button
          const submitBtn = containerRef.current?.querySelector<HTMLButtonElement>(
            'button[type="submit"], button.btn-save, button.btn-primary, button.btn-destructive'
          )
          if (submitBtn && !submitBtn.disabled) {
            submitBtn.click()
          }
        }
      }
    }

    // Attach in capture phase so it intercepts before reaching any focused background elements
    window.addEventListener('keydown', handleKeyDown, true)
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, onConfirm])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={containerRef}
        className="modal-container"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {showAccentBar && <div className="modal-accent-bar" />}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
