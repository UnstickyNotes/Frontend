import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppLayout from '../components/AppLayout'
import ConfirmModal from '../components/ConfirmModal'
import CollectionDropdown from '../components/CollectionDropdown'
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

export default function NoteEditPage() {
  const { collectionId, noteId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [collections, setCollections] = useState<Collection[]>([])
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null)
  const [originalNote, setOriginalNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

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
      .then(res => {
        const n = (res as { data?: Note }).data
        if (n) {
          setOriginalNote(n)
          setTitle(n.title)
          setBody(n.body ?? '')
          // Pre-select the note's current collection in the dropdown
          const colId = n.collection_id ?? n.collectionId
          setSelectedCollectionId(colId != null ? colId : -1)
        }
      })
      .catch(console.error)
  }, [noteId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() && !body.trim()) {
      setError('Please enter a title or note content.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await NoteService.updateNote(Number(noteId), {
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        collection_id: selectedCollectionId === -1 ? undefined : selectedCollectionId,
        collectionId: selectedCollectionId === -1 ? undefined : selectedCollectionId,
      })
      navigate(`/${collectionId}/${noteId}`)
    } catch {
      setError('Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!originalNote) return
    setDeleting(true)
    try {
      await NoteService.deleteNote(Number(noteId))
      navigate(`/${collectionId}`)
    } finally {
      setDeleting(false)
    }
  }

  const collectionName = currentCollection?.name ?? (collectionId === '-1' ? 'Unsorted' : 'Collection')
  const noteTitle = originalNote?.title ?? '…'

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
      <div className="main-scroll note-edit-main-scroll">
        <form className="note-edit-form" onSubmit={handleSave}>
          {error && <div className="auth-error note-edit-error">{error}</div>}
          <div className="note-header-row note-edit-header-row">
            <input
              id="edit-card-title"
              className="note-editor-title-input"
              type="text"
              placeholder="Card title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
            <div className="note-header-actions">
              <button id="edit-page-edit-btn" className="icon-btn active" type="button" title="Editing"
                aria-label="Currently editing">
                <PencilIcon />
              </button>
              <button id="edit-page-delete-btn" className="icon-btn destructive" type="button"
                title="Delete note" onClick={() => setDeleteModalOpen(true)} disabled={deleting} aria-label="Delete note">
                <TrashIcon />
              </button>
              <button id="edit-page-back-btn" className="icon-btn" type="button" title="Go back"
                onClick={() => navigate(-1)} aria-label="Go back">
                <ChevronLeftIcon />
              </button>
            </div>
          </div>
          <textarea
            id="edit-card-body"
            className="note-editor-body-input"
            placeholder="Write something…"
            value={body}
            onChange={e => setBody(e.target.value)}
          />

          {/* Collection picker */}
          <div className="note-editor-collection-row">
            <span className="note-editor-collection-label">Collection</span>
            <CollectionDropdown
              collections={collections.filter(c => c.id !== -1)}
              value={selectedCollectionId}
              onChange={(id) => setSelectedCollectionId(Number(id))}
              placement="up"
            />
          </div>

          <div className="note-editor-actions">
            <button className="btn-primary" type="submit" disabled={saving || (!title.trim() && !body.trim())}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn-cancel" type="button" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Card"
        message={`Are you sure you want to delete "${originalNote?.title}"? This cannot be undone.`}
        confirmText="Delete Card"
        isDestructive
      />
    </AppLayout>
  )
}
