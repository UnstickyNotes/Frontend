import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppLayout from '../components/AppLayout'
import NoteCard from '../components/NoteCard'
import NoteModal from '../components/NoteModal'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import { getCollectionColor, UNSORTED_COLOR } from '../utils/collectionColors'
import * as CollectionService from '../services/CollectionService'
import * as NoteService from '../services/NoteService'
import type { Collection, Note } from '../types'

function SearchIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function CollectionsPage() {
  const { collectionId }   = useParams()
  const navigate           = useNavigate()
  const { user, pulled }   = useAuth()

  const [collections, setCollections]     = useState<Collection[]>([])
  const [allNotes, setAllNotes]           = useState<Note[]>([])
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null)
  const [loading, setLoading]             = useState(true)
  const [searchQuery, setSearchQuery]     = useState('')

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote]     = useState<Note | null>(null)
  const [deletingNote, setDeletingNote]   = useState<Note | null>(null)

  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')

  const isAllNotes = collectionId === 'all' || !collectionId

  // Load collections
  useEffect(() => {
    CollectionService.getCollections()
      .then(res => {
        const cols: Collection[] = (res as { data?: Collection[] }).data ?? []
        setCollections(cols)
        if (isAllNotes) {
          setCurrentCollection(null)
        } else if (collectionId === '-1') {
          setCurrentCollection({ id: -1, name: 'Unsorted' })
        } else {
          setCurrentCollection(cols.find(c => String(c.id) === collectionId) ?? null)
        }
      })
      .catch(console.error)
  }, [collectionId, pulled])

  // Load ALL notes (for counts + display)
  useEffect(() => {
    setLoading(true)
    NoteService.getAllNotes()
      .then(res => {
        const notes: Note[] = (res as { data?: Note[] }).data ?? []
        setAllNotes(notes)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [collectionId, pulled])

  // Listen for notes-updated event from QuickNoteModal
  useEffect(() => {
    const onNotesUpdated = async () => {
      const allRes = await NoteService.getAllNotes()
      setAllNotes((allRes as { data?: Note[] }).data ?? [])
    }
    window.addEventListener('notes-updated', onNotesUpdated)
    return () => window.removeEventListener('notes-updated', onNotesUpdated)
  }, [])

  // Compute displayed notes based on active collection + search
  const displayedNotes = useMemo(() => {
    let filtered: Note[]
    if (isAllNotes) {
      filtered = allNotes
    } else if (collectionId === '-1') {
      filtered = allNotes.filter(n => {
        const cId = n.collection_id ?? n.collectionId
        return cId === -1 || cId === null || cId === undefined
      })
    } else {
      filtered = allNotes.filter(n => {
        const cId = n.collection_id ?? n.collectionId
        return cId != null && String(cId) === collectionId
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [allNotes, collectionId, isAllNotes, searchQuery])

  // Compute per-collection note counts for sidebar badges
  const noteCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allNotes.forEach(n => {
      const cId = n.collection_id ?? n.collectionId
      const key = cId === null || cId === undefined || cId === -1 ? '-1' : String(cId)
      counts[key] = (counts[key] ?? 0) + 1
    })
    return counts
  }, [allNotes])

  // ── CRUD handlers ──────────────────────────────────────────────

  const handleCollectionUpdated = (updated: Collection) => {
    setCollections(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    if (String(currentCollection?.id) === String(updated.id)) setCurrentCollection(updated)
  }

  const handleCollectionDeleted = (id: string | number | null) => {
    setCollections(prev => prev.filter(c => c.id !== id))
    if (String(currentCollection?.id) === String(id)) setCurrentCollection(null)
  }

  const handleNewNote = () => {
    setEditingNote(null)
    setIsNoteModalOpen(true)
  }

  const handleEditNote  = (note: Note) => { setEditingNote(note); setIsNoteModalOpen(true) }
  const handleDeleteNote = (note: Note) => setDeletingNote(note)

  const handleNoteSubmit = async (data: { title?: string; body?: string; collectionId?: number }) => {
    if (editingNote) {
      const newColId = data.collectionId ?? editingNote.collection_id ?? editingNote.collectionId
      const res = await NoteService.updateNote(editingNote.id, {
        title:         data.title || undefined,
        body:          data.body  || undefined,
        collection_id: newColId === -1 ? undefined : newColId,
      })
      const updated = (res as { data?: Note }).data ?? {
        ...editingNote,
        title: data.title || editingNote.title || 'Untitled',
        body:  data.body,
        collection_id: newColId === -1 ? undefined : newColId,
      }
      setAllNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)))
    } else {
      const targetColId = data.collectionId ?? (collectionId && collectionId !== 'all' ? Number(collectionId) : -1)
      const res = await NoteService.addNote({
        title:         data.title || undefined,
        body:          data.body  || undefined,
        collection_id: targetColId === -1 ? undefined : targetColId,
      })
      const created = (res as { data?: Note }).data
      if (created) {
        setAllNotes(prev => [...prev, created])
      } else {
        // Refresh as fallback
        const allRes = await NoteService.getAllNotes()
        setAllNotes((allRes as { data?: Note[] }).data ?? [])
      }
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingNote) return
    await NoteService.deleteNote(deletingNote.id)
    setAllNotes(prev => prev.filter(n => n.id !== deletingNote.id))
    setDeletingNote(null)
  }

  // ── Topbar composition ─────────────────────────────────────────

  const pageTitle = isAllNotes
    ? 'All Notes'
    : (currentCollection?.name ?? (collectionId === '-1' ? 'Unsorted' : 'Notes'))

  const realCollections = collections.filter(c => c.id !== -1 && String(c.id) !== '-1')

  const topbarLeft = <span className="topbar-title">{pageTitle}</span>

  const topbarRight = (
    <>
      <div className="topbar-search">
        <span className="topbar-search-icon"><SearchIcon /></span>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search notes"
        />
      </div>
      <button
        id="topbar-new-note-btn"
        className="topbar-new-note-btn"
        onClick={handleNewNote}
        type="button"
      >
        <PlusIcon /><span>New Note</span>
      </button>
    </>
  )

  return (
    <AppLayout
      collections={collections}
      noteCounts={noteCounts}
      totalNoteCount={allNotes.length}
      userName={userName}
      onNewNote={handleNewNote}
      onCollectionCreated={col => setCollections(prev => [...prev, col])}
      onCollectionUpdated={handleCollectionUpdated}
      onCollectionDeleted={handleCollectionDeleted}
      topbarLeft={topbarLeft}
      topbarRight={topbarRight}
    >
      <div className="main-scroll">
        {/* Page header */}
        <div className="collections-header">
          <h1 className="collections-title">{pageTitle}</h1>
          <span className="collections-count">
            {loading ? '' : `${displayedNotes.length} note${displayedNotes.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Masonry grid */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
        ) : displayedNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p className="empty-state-title">
              {searchQuery ? 'No notes match your search' : 'No notes here yet'}
            </p>
            <p className="empty-state-sub">
              {searchQuery ? 'Try a different keyword' : 'Click "+ New Note" to create one'}
            </p>
          </div>
        ) : (
          <div className="notes-masonry">
            {displayedNotes.map(note => {
              const colId    = note.collection_id ?? note.collectionId
              const col      = colId !== null && colId !== undefined && colId !== -1
                ? realCollections.find(c => String(c.id) === String(colId))
                : null
              const colName  = col?.name ?? 'Unsorted'
              const colColor = col
                ? getCollectionColor(col.id, realCollections)
                : UNSORTED_COLOR

              return (
                <NoteCard
                  key={String(note.id)}
                  note={note}
                  collectionName={colName}
                  collectionColor={colColor}
                  onClick={() => navigate(`/${collectionId || 'all'}/${note.id}`)}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        mode={editingNote ? 'edit' : 'create'}
        initialTitle={editingNote?.title ?? ''}
        initialBody={editingNote?.body ?? ''}
        initialCollectionId={
          editingNote
            ? (editingNote.collection_id ?? editingNote.collectionId ?? -1)
            : (collectionId && collectionId !== 'all' ? Number(collectionId) : -1)
        }
        collections={collections}
        onClose={() => { setIsNoteModalOpen(false); setEditingNote(null) }}
        onSubmit={handleNoteSubmit}
      />

      <ConfirmModal
        isOpen={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        message={`Delete "${deletingNote?.title}"? This cannot be undone.`}
        confirmText="Delete"
        isDestructive
        accentColor={getCollectionColor(deletingNote?.collection_id ?? deletingNote?.collectionId, collections)}
      />

      {/* Help button */}
      <button className="help-btn" type="button" title="Help" aria-label="Help">?</button>
    </AppLayout>
  )
}
