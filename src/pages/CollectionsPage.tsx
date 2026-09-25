import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppLayout from '../components/AppLayout'
import NoteCard from '../components/NoteCard'
import NewCardPlaceholder from '../components/NewCardPlaceholder'
import NewCollectionModal from '../components/NewCollectionModal'
import NoteModal from '../components/NoteModal'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import * as CollectionService from '../services/CollectionService'
import * as NoteService from '../services/NoteService'
import type { Collection, Note } from '../types'
import { requestPull, requestPush } from '../syncServices/SyncManager'

export default function CollectionsPage() {
  const { collectionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [collections, setCollections] = useState<Collection[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)

  // Card modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deletingNote, setDeletingNote] = useState<Note | null>(null)

  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const userHandle = user?.email?.split('@')[0] ?? ''

  // Load collections on mount or when collectionId changes
  useEffect(() => {
    CollectionService.getCollections()
      .then((res) => {
        const cols: Collection[] = (res as { data?: Collection[] }).data ?? []
        setCollections(cols)
        if (collectionId) {
          if (collectionId == '-1') {
            setCurrentCollection({ id: -1, name: 'Unsorted' })
          } else {
            const found = cols.find(c => String(c.id) === collectionId) ?? null
            setCurrentCollection(found)
          }
        } else {
          // Default to Unsorted collection (id: -1)
          navigate('/-1', { replace: true })
        }
      })
      .catch(console.error)
  }, [collectionId, navigate])

  // Load notes for the active collection
  useEffect(() => {
    setLoading(true)
    NoteService.getAllNotes()
      .then((res) => {
        const allNotes: Note[] = (res as { data?: Note[] }).data ?? []
        if (collectionId) {
          const filtered = allNotes.filter(n => {
            const cId = n.collection_id
            if (collectionId === '-1') {
              return cId === -1 || cId === null || cId === undefined
            }
            return cId != null && String(cId) === collectionId
          })
          setNotes(filtered)
        } else {
          setNotes(allNotes)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [collectionId])

  const [newCollectionOpen, setNewCollectionOpen] = useState(false)

  const handleCreateCollection = async (name: string) => {
    const res = await CollectionService.addCollection({ name })
    const created = (res as { data?: Collection }).data
    if (created) {
      setCollections(prev => [...prev, created])
      navigate(`/${created.id}`)
    }
  }

  const handleCollectionUpdated = (updated: Collection) => {
    setCollections(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    if (String(currentCollection?.id) === String(updated.id)) {
      setCurrentCollection(updated)
    }
  }

  const handleCollectionDeleted = (id: string | number | null) => {
    setCollections(prev => prev.filter(c => c.id !== id))
    if (String(currentCollection?.id) === String(id)) {
      setCurrentCollection({ id: -1, name: 'Unsorted' })
    }
  }

  const handleNewCard = () => {
    setEditingNote(null)
    setIsNoteModalOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsNoteModalOpen(true)
  }

  const handleDeleteNote = (note: Note) => {
    setDeletingNote(note)
  }

  const handleNoteSubmit = async (data: { title?: string; body?: string; collectionId?: number }) => {
    if (editingNote) {
      // Determine collection for update: prefer modal selection, fall back to note's existing collection
      const newColId = data.collectionId ?? editingNote.collection_id ?? editingNote.collectionId
      const res = await NoteService.updateNote(editingNote.id, {
        title: data.title || undefined,
        body: data.body || undefined,
        collection_id: newColId === -1 ? undefined : newColId,
        // collectionId: newColId === -1 ? undefined : newColId,
      })
      const updated = (res as { data?: Note }).data ?? {
        ...editingNote,
        title: data.title || editingNote.title || 'Untitled',
        body: data.body,
        collection_id: newColId === -1 ? undefined : newColId,
      }
      // If the note was moved to a different collection, remove it from current view
      const currentViewColId = collectionId === '-1' ? -1 : Number(collectionId)
      const updatedColId = updated.collection_id ?? updated.collectionId ?? -1
      if (data.collectionId !== undefined && updatedColId !== currentViewColId) {
        setNotes(prev => prev.filter(n => n.id !== updated.id))
      } else {
        setNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)))
      }
    } else {
      // For create: use the collection chosen in the modal, fall back to the current URL collection
      const targetColId = data.collectionId ?? (collectionId ? Number(collectionId) : -1)
      const res = await NoteService.addNote({
        title: data.title || undefined,
        body: data.body || undefined,
        // collectionId: targetColId,
        collection_id: targetColId === -1 ? undefined : targetColId,
      })
      const created = (res as { data?: Note }).data
      // Only add to the current view if the note belongs to the current collection
      const currentViewColId = collectionId === '-1' ? -1 : Number(collectionId)
      if (created && (created.title || created.id) && targetColId === currentViewColId) {
        setNotes(prev => [
          ...prev,
          {
            id: created.id,
            title: created.title || data.title || 'Untitled',
            body: created.body ?? data.body,
            collection_id: created.collection_id ?? targetColId,
          },
        ])
      } else {
        // Fallback refresh (covers cross-collection creates)
        const allRes = await NoteService.getAllNotes()
        const allNotes: Note[] = (allRes as { data?: Note[] }).data ?? []
        if (collectionId) {
          setNotes(
            allNotes.filter(n => {
              const cId = n.collection_id ?? n.collectionId
              if (collectionId === '-1') {
                return cId === -1 || cId === null || cId === undefined
              }
              return cId != null && String(cId) === collectionId
            })
          )
        } else {
          setNotes(allNotes)
        }
      }
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingNote) return
    await NoteService.deleteNote(deletingNote.id)
    setNotes(prev => prev.filter(n => n.id !== deletingNote.id))
    setDeletingNote(null)
  }

  const title = currentCollection?.name ?? (collectionId === '-1' ? 'Unsorted' : 'All Notes')
  const noteCount = notes.length

  return (
    <AppLayout
      collections={collections}
      userName={userName}
      userHandle={userHandle}
      onNewCollection={() => setNewCollectionOpen(true)}
      onCollectionCreated={col => setCollections(prev => [...prev, col])}
      onCollectionUpdated={handleCollectionUpdated}
      onCollectionDeleted={handleCollectionDeleted}
      topbarLeft={
        <span className="breadcrumb-current">{title}</span>
      }
    >
      <div className="main-scroll">
        <h1 className="collections-title">{title}</h1>
        <button onClick={requestPush}>push</button>
        <button onClick={requestPull}>pull</button>
        <p className="collections-count">
          {loading ? 'Loading…' : noteCount === 0 ? 'No cards yet' : `${noteCount} card${noteCount !== 1 ? 's' : ''}`}
        </p>

        <div className="card-grid">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => navigate(`/${collectionId || '-1'}/${note.id}`)}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
          <NewCardPlaceholder onClick={handleNewCard} />
        </div>
      </div>

      <NewCollectionModal
        isOpen={newCollectionOpen}
        onClose={() => setNewCollectionOpen(false)}
        onSubmit={handleCreateCollection}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        mode={editingNote ? 'edit' : 'create'}
        initialTitle={editingNote?.title ?? ''}
        initialBody={editingNote?.body ?? ''}
        initialCollectionId={
          editingNote
            ? (editingNote.collection_id ?? editingNote.collectionId ?? -1)
            : (collectionId ? Number(collectionId) : -1)
        }
        collections={collections}
        onClose={() => {
          setIsNoteModalOpen(false)
          setEditingNote(null)
        }}
        onSubmit={handleNoteSubmit}
      />

      <ConfirmModal
        isOpen={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Card"
        message={`Are you sure you want to delete "${deletingNote?.title}"? This cannot be undone.`}
        confirmText="Delete Card"
        isDestructive
      />
    </AppLayout>
  )
}
