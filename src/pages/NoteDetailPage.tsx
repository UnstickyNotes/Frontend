import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppLayout from '../components/AppLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import * as CollectionService from '../services/CollectionService'
import * as NoteService from '../services/NoteService'
import type { Collection, Note } from '../types'

function PencilIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
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
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState(false)

  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const userHandle = user?.email?.split('@')[0] ?? ''

  useEffect(() => {
    CollectionService.getCollections()
      .then((res) => {
        const cols = res.data ?? []
        setCollections(cols)
        if (collectionId === '-1') {
          setCurrentCollection({ id: -1, name: 'Unsorted' })
        } else {
          setCurrentCollection(cols.find(c => String(c.id) === collectionId) ?? null)
        }
      })
      .catch(console.error)
  }, [collectionId])

  useEffect(() => {
    if (!noteId) return
    NoteService.getNote(Number(noteId))
      .then(res => setNote((res as { data?: Note }).data ?? null))
      .catch(console.error)
  }, [noteId])

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!note) return
    setDeleting(true)
    try {
      await NoteService.deleteNote(note.id)
      navigate(`/${collectionId}`)
    } finally {
      setDeleting(false)
    }
  }

  const collectionName = currentCollection?.name ?? (collectionId === '-1' ? 'Unsorted' : 'Collection')
  const noteTitle = note?.title ?? '…'

  const topbarLeft = (
    <>
      <span className="breadcrumb-item" onClick={() => navigate(`/${collectionId}`)}
        role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate(`/${collectionId}`)}>
        {collectionName}
      </span>
      <span className="breadcrumb-separator">›</span>
      <span className="breadcrumb-current">{noteTitle}</span>
    </>
  )

  return (
    <AppLayout collections={collections} userName={userName} userHandle={userHandle} topbarLeft={topbarLeft}>
      <div className="main-scroll">
        {note ? (
          <>
            <div className="note-header-row">
              <h1 className="note-detail-title">{note.title}</h1>
              <div className="note-header-actions">
                <button id="note-edit-btn" className="icon-btn" type="button" title="Edit note"
                  onClick={() => navigate(`/${collectionId}/${noteId}/edit`)} aria-label="Edit note">
                  <PencilIcon />
                </button>
                <button id="note-delete-btn" className="icon-btn destructive" type="button" title="Delete note"
                  onClick={() => setDeleteModalOpen(true)} disabled={deleting} aria-label="Delete note">
                  <TrashIcon />
                </button>
                <button id="note-back-btn" className="icon-btn" type="button" title="Go back"
                  onClick={() => navigate(-1)} aria-label="Go back">
                  <ChevronLeftIcon />
                </button>
              </div>
            </div>
            {note.body && <p className="note-detail-body">{note.body}</p>}
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Card"
        message={`Are you sure you want to delete "${note?.title}"? This cannot be undone.`}
        confirmText="Delete Card"
        isDestructive
      />
    </AppLayout>
  )
}
