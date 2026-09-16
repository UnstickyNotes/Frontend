import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import * as CollectionService from '../services/CollectionService'
import * as NoteService from '../services/NoteService'
import type { Collection } from '../types'

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function NoteCreatePage() {
  const { collectionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [collections, setCollections] = useState<Collection[]>([])
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const userHandle = user?.email?.split('@')[0] ?? ''

  useEffect(() => {
    CollectionService.getCollections()
      .then((res) => {
        const cols = res.data ?? []
        setCollections(cols)
        if (collectionId === null) {
          setCurrentCollection({ id: null, name: 'Unsorted' })
        } else {
          setCurrentCollection(cols.find(c => String(c.id) === collectionId) ?? null)
        }
      })
      .catch(console.error)
  }, [collectionId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() && !body.trim()) {
      setError('Please enter a title or note content.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await NoteService.addNote({
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        collectionId: Number(collectionId) || undefined,
      })
      const newNote = (res as { data?: { id: number } }).data
      if (newNote) navigate(`/${collectionId}/${newNote.id}`)
      else navigate(`/${collectionId}`)
    } catch {
      setError('Could not save the card. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const collectionName = currentCollection?.name ?? (collectionId === '-1' ? 'Unsorted' : 'Collection')

  const topbarLeft = (
    <>
      <span className="breadcrumb-item" onClick={() => navigate(`/${collectionId}`)}
        role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate(`/${collectionId}`)}>
        {collectionName}
      </span>
      <span className="breadcrumb-separator">›</span>
      <span className="breadcrumb-current">New Card</span>
    </>
  )

  return (
    <AppLayout collections={collections} userName={userName} userHandle={userHandle} topbarLeft={topbarLeft}>
      <div className="main-scroll">
        <form onSubmit={handleSave}>
          {error && <div className="auth-error" style={{ maxWidth: '480px', marginBottom: '0.75rem' }}>{error}</div>}
          <div className="note-header-row">
            <input
              id="new-card-title"
              className="note-editor-title-input"
              type="text"
              placeholder="Card title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
            <div className="note-header-actions">
              <button id="new-card-back-btn" className="icon-btn" type="button" title="Go back"
                onClick={() => navigate(-1)} aria-label="Go back">
                <ChevronLeftIcon />
              </button>
            </div>
          </div>
          <textarea
            id="new-card-body"
            className="note-editor-body-input"
            placeholder="Write something…"
            value={body}
            onChange={e => setBody(e.target.value)}
          />
          <div className="note-editor-actions">
            <button className="btn-primary" type="submit" disabled={saving || (!title.trim() && !body.trim())}>
              {saving ? 'Saving…' : 'Save Card'}
            </button>
            <button className="btn-cancel" type="button" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
