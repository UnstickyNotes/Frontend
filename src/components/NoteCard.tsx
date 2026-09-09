import { type Note } from '../types'

function PencilIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface NoteCardProps {
  note: Note
  onClick?: () => void
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
}

export default function NoteCard({ note, onClick, onEdit, onDelete }: NoteCardProps) {
  return (
    <article
      className="note-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      aria-label={`Open note: ${note.title}`}
    >
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title}</h3>
        <div className="note-card-actions" onClick={e => e.stopPropagation()}>
          <button
            className="note-card-action-btn"
            type="button"
            title="Edit note"
            aria-label={`Edit ${note.title}`}
            onClick={e => {
              e.stopPropagation()
              onEdit?.(note)
            }}
          >
            <PencilIcon />
          </button>
          <button
            className="note-card-action-btn destructive"
            type="button"
            title="Delete note"
            aria-label={`Delete ${note.title}`}
            onClick={e => {
              e.stopPropagation()
              onDelete?.(note)
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      {note.body && <p className="note-card-body">{note.body}</p>}
    </article>
  )
}
