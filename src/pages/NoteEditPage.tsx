import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppLayout from '../components/AppLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import { COLLECTION_COLORS, UNSORTED_COLOR, getCollectionColor } from '../utils/collectionColors'
import * as CollectionService from '../services/CollectionService'
import * as NoteService from '../services/NoteService'
import type { Collection, Note } from '../types'

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

export default function NoteEditPage() {
  const { collectionId, noteId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [collections, setCollections] = useState<Collection[]>([])
  const [originalNote, setOriginalNote] = useState<Note | null>(null)
  
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedColId, setSelectedColId] = useState<number | undefined>(undefined)
  
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [error, setError] = useState('')

  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User'

  useEffect(() => {
    CollectionService.getCollections()
      .then(res => setCollections((res as { data?: Collection[] }).data ?? []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!noteId) return
    NoteService.getNote(Number(noteId))
      .then(res => {
        const n = (res as { data?: Note }).data
        if (n) {
          setOriginalNote(n)
          setTitle(n.title || '')
          setBody(n.body ?? '')
          const cId = n.collection_id ?? n.collectionId
          setSelectedColId(cId != null ? cId : -1)
        }
      })
      .catch(console.error)
  }, [noteId])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!title.trim() && !body.trim()) { setError('Please enter a title or content.'); return }
    setSaving(true)
    setError('')
    try {
      await NoteService.updateNote(Number(noteId), {
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        collection_id: selectedColId === -1 ? undefined : selectedColId,
      })
      navigate(`/${collectionId || 'all'}/${noteId}`)
    } catch {
      setError('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!originalNote) return
    setDeleting(true)
    try {
      await NoteService.deleteNote(Number(noteId))
      navigate(`/${collectionId || 'all'}`)
    } finally {
      setDeleting(false)
    }
  }

  const realCollections = collections.filter(c => c.id !== -1 && String(c.id) !== '-1')

  const topbarLeft = (
    <button className="topbar-back-btn" onClick={() => navigate(`/${collectionId || 'all'}/${noteId}`)}>
      <ChevronLeftIcon /> <span>Cancel</span>
    </button>
  )

  const topbarRight = (
    <>
      <button className="topbar-icon-btn" style={{ color: 'var(--destructive-text)' }} onClick={() => setDeleteModal(true)} disabled={deleting} aria-label="Delete">
        <TrashIcon />
      </button>
      <button className="topbar-new-note-btn" onClick={() => handleSave()} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </>
  )

  return (
    <AppLayout collections={collections} userName={userName} topbarLeft={topbarLeft} topbarRight={topbarRight}>
      <div className="main-scroll" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="note-edit-wrap" style={{ width: '100%' }}>
          {originalNote ? (
            <form onSubmit={handleSave} noValidate>
              {error && <div className="note-edit-error">{error}</div>}
              
              <input
                className="note-editor-title"
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
              
              <textarea
                className="note-editor-body"
                placeholder="Start writing..."
                value={body}
                onChange={e => setBody(e.target.value)}
              />

              {realCollections.length > 0 && (
                <div className="note-editor-collection-row">
                  <span className="note-editor-col-label">Collection</span>
                  <div className="modal-chips">
                    <button
                      type="button"
                      className={`collection-chip${!selectedColId || selectedColId === -1 ? ' active' : ''}`}
                      onClick={() => setSelectedColId(-1)}
                    >
                      <span className="chip-dot" style={{ background: UNSORTED_COLOR }} />
                      Unsorted
                    </button>
                    {realCollections.map((col, idx) => (
                      <button
                        key={String(col.id)}
                        type="button"
                        className={`collection-chip${Number(selectedColId) === Number(col.id) ? ' active' : ''}`}
                        onClick={() => setSelectedColId(Number(col.id))}
                      >
                        <span className="chip-dot" style={{ background: COLLECTION_COLORS[idx % COLLECTION_COLORS.length] }} />
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
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
        message={`Delete "${originalNote?.title}"? This cannot be undone.`}
        confirmText="Delete"
        isDestructive
        accentColor={getCollectionColor(selectedColId, collections)}
      />
    </AppLayout>
  )
}
