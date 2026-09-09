interface NewCardPlaceholderProps {
  onClick?: () => void
}

export default function NewCardPlaceholder({ onClick }: NewCardPlaceholderProps) {
  return (
    <div
      className="new-card-placeholder"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      aria-label="Create new note"
    >
      <svg
        className="new-card-icon"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="new-card-label">New Card</span>
    </div>
  )
}
