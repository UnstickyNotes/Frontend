import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppLayout from '../components/AppLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import { getCollectionColor, UNSORTED_COLOR } from '../utils/collectionColors'
import * as CollectionService from '../services/CollectionService'
import * as NoteService from '../services/NoteService'
import type { Collection, Note } from '../types'

function PencilIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function NoteDetailPage() {
  const { collectionId, noteId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [collections, setCollections] = useState<Collection[]>([])
  const [note, setNote] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User'

  useEffect(() => {
    CollectionService.getCollections()
      .then(res => {
        const cols = (res as { data?: Collection[] }).data ?? []
        setCollections(cols)
      })
      .catch(console.error)
  }, [collectionId])

  useEffect(() => {
    if (!noteId) return
    NoteService.getNote(Number(noteId))
      .then(res => setNote((res as { data?: Note }).data ?? null))
      .catch(console.error)
  }, [noteId])

  const handleDelete = async () => {
    if (!note) return
    setDeleting(true)
    try {
      await NoteService.deleteNote(note.id)
      navigate(`/${collectionId || 'all'}`)
    } finally {
      setDeleting(false)
    }
  }

  // Determine actual note collection
  const realCollections = collections.filter(c => c.id !== -1 && String(c.id) !== '-1')
  const actualColId = note?.collection_id ?? note?.collectionId
  const actualCol = actualColId !== null && actualColId !== undefined && actualColId !== -1
    ? realCollections.find(c => String(c.id) === String(actualColId))
    : null
  const collectionName = actualCol?.name ?? 'Unsorted'
  const collectionColor = actualCol ? getCollectionColor(actualCol.id, realCollections) : UNSORTED_COLOR

  const topbarLeft = (
    <>
      <button className="topbar-back-btn" onClick={() => navigate(`/${collectionId || 'all'}`)}>
        <ChevronLeftIcon /> <span>Back</span>
      </button>
    </>
  )

  const topbarRight = (
    <>
      <button className="topbar-icon-btn" onClick={() => navigate(`/${collectionId || 'all'}/${noteId}/edit`)} aria-label="Edit">
        <PencilIcon />
      </button>
      <button className="topbar-icon-btn" style={{ color: 'var(--destructive-text)' }} onClick={() => setDeleteModal(true)} disabled={deleting} aria-label="Delete">
        <TrashIcon />
      </button>
    </>
  )

  return (
    <AppLayout collections={collections} userName={userName} topbarLeft={topbarLeft} topbarRight={topbarRight}>
      <div className="main-scroll" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="note-detail-content" style={{ width: '100%' }}>
          {note ? (
            <>
              <h1 className="note-detail-title">{note.title}</h1>
              <div className="note-detail-meta">
                <span className="chip-dot" style={{ background: collectionColor }} />
                <span>{collectionName}</span>
                {note.created_at && (
                  <>
                    <span className="note-card-sep">·</span>
                    <span>{new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </>
                )}
              </div>
              {note.body && <p className="note-detail-body">{note.body}</p>}
            </>
          ) : (
            <div className="loading-screen">Loading…</div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete note"
        message={`Delete "${note?.title}"? This cannot be undone.`}
        confirmText="Delete"
        isDestructive
        accentColor={collectionColor}
      />
    </AppLayout>
  )
}
