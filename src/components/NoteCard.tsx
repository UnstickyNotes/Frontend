import type { Note } from '../types'
import { UNSORTED_COLOR } from '../utils/collectionColors'

function PencilIcon() {
  return (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

interface NoteCardProps {
  note:            Note
  collectionName?: string
  collectionColor?: string
  onClick?:        () => void
  onEdit?:         (note: Note) => void
  onDelete?:       (note: Note) => void
}

export default function NoteCard({
  note,
  collectionName  = 'Unsorted',
  collectionColor = UNSORTED_COLOR,
  onClick,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const dateStr = formatDate(note.created_at)

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(note)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(note)
  }

  return (
    <div
      className="note-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      aria-label={`Note: ${note.title}`}
    >
      {/* Colored accent bar */}
      <div className="note-card-accent" style={{ backgroundColor: collectionColor }} />

      <div className="note-card-inner">
        {/* Header: title + action buttons */}
        <div className="note-card-header">
          <h3 className="note-card-title">{note.title}</h3>
          <div className="note-card-actions">
            {onEdit && (
              <button
                className="note-card-action-btn"
                type="button"
                title="Edit note"
                aria-label="Edit note"
                onClick={handleEdit}
              >
                <PencilIcon />
              </button>
            )}
            {onDelete && (
              <button
                className="note-card-action-btn destructive"
                type="button"
                title="Delete note"
                aria-label="Delete note"
                onClick={handleDelete}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>

        {/* Body preview */}
        {note.body && (
          <p className="note-card-content">{note.body}</p>
        )}

        {/* Footer: collection + date */}
        <div className="note-card-footer">
          <span className="note-card-col-dot" style={{ backgroundColor: collectionColor }} />
          <span className="note-card-col-name">{collectionName}</span>
          {dateStr && (
            <>
              <span className="note-card-sep">·</span>
              <span>{dateStr}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
