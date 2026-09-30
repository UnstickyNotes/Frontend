import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { listen } from '@tauri-apps/api/event'
import Sidebar from './Sidebar'
import NewCollectionModal from './NewCollectionModal'
import EditCollectionModal from './EditCollectionModal'
import ConfirmModal from './ConfirmModal'
import QuickNoteModal from './QuickNoteModal'
import { type Collection } from '../types'
import { getCollectionColor } from '../utils/collectionColors'
import * as CollectionService from '../services/CollectionService'
import * as NoteService from '../services/NoteService'

function ShowSidebarIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
      <path d="M9 3v18" strokeWidth={2} />
      <path d="M13 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  )
}

interface AppLayoutProps {
  children: ReactNode
  collections: Collection[]
  noteCounts?: Record<string, number>
  totalNoteCount?: number
  userName?: string
  /** Called when sidebar "+ New Note" is clicked — caller opens the modal */
  onNewNote?: () => void
  onCollectionCreated?: (collection: Collection) => void
  onCollectionUpdated?: (collection: Collection) => void
  onCollectionDeleted?: (collectionId: string | number | null) => void
  /** Topbar left slot — e.g. back button + title, or breadcrumb */
  topbarLeft?: ReactNode
  /** Topbar right slot — e.g. search + new-note button */
  topbarRight?: ReactNode
}

const MIN_WIDTH = 200
const MAX_WIDTH = 600
const COLLAPSE_THRESHOLD = 90
const SPEED_RATIO = 0.85

export default function AppLayout({
  children,
  collections,
  noteCounts = {},
  totalNoteCount = 0,
  userName,
  onNewNote,
  onCollectionCreated,
  onCollectionUpdated,
  onCollectionDeleted,
  topbarLeft,
  topbarRight,
}: AppLayoutProps) {
  const navigate = useNavigate()
  const [newColOpen, setNewColOpen] = useState(false)
  const [editingCol, setEditingCol] = useState<Collection | null>(null)
  const [deletingCol, setDeletingCol] = useState<Collection | null>(null)
  const [currentCollections, setCurrentCollections] = useState<Collection[]>(collections)

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem('sidebarWidth') || '260', 10)
    return isNaN(saved) ? 260 : Math.min(Math.max(saved, MIN_WIDTH), MAX_WIDTH)
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const [isDragging, setIsDragging] = useState(false)
  const [isResisting, setIsResisting] = useState(false)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const [quickNoteOpen, setQuickNoteOpen] = useState(false)

  useEffect(() => { setCurrentCollections(collections) }, [collections])

  // Listen for global shortcut ("Ctrl+Shift+Alt+;") emitted from Tauri lib.rs
  useEffect(() => {
    const unlistenPromise = listen<string>('open_modal', () => {
      setQuickNoteOpen(true)
    })
    return () => {
      unlistenPromise.then(fn => fn()).catch(() => { })
    }
  }, [])

  const handleQuickNoteSubmit = async (body: string, collectionId?: number) => {
    const title = 'Untitled Quick Note'
    await NoteService.addNote({
      title,
      body,
      collection_id: collectionId,
    })
    window.dispatchEvent(new CustomEvent('notes-updated'))
  }

  useEffect(() => {
    let lastWidth = window.innerWidth
    const handleResize = () => {
      const currentWidth = window.innerWidth
      if (lastWidth > 768 && currentWidth <= 768) {
        setIsSidebarOpen(false)
      } else if (lastWidth <= 768 && currentWidth > 768) {
        setIsSidebarOpen(true)
      }
      lastWidth = currentWidth
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    startXRef.current = e.clientX
    startWidthRef.current = sidebarWidth
    isDraggingRef.current = true
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    document.body.classList.add('resizing-sidebar')

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return

      const deltaX = (e.clientX - startXRef.current) * SPEED_RATIO
      const targetWidth = Math.round(startWidthRef.current + deltaX)

      if (targetWidth < COLLAPSE_THRESHOLD) {
        // User deliberately pulled far past the minimum width: snap closed
        setIsSidebarOpen(false)
        setIsResisting(false)
      } else if (targetWidth < MIN_WIDTH) {
        // Resistance / elastic tension zone: sidebar fights the mouse!
        setIsSidebarOpen(true)
        setIsResisting(true)
        const overshoot = MIN_WIDTH - targetWidth
        const resistedWidth = Math.round(MIN_WIDTH - overshoot * 0.15)
        setSidebarWidth(resistedWidth)
      } else if (targetWidth > MAX_WIDTH) {
        // Resistance at max width
        setIsSidebarOpen(true)
        setIsResisting(false)
        const overshoot = targetWidth - MAX_WIDTH
        const resistedWidth = Math.min(Math.round(MAX_WIDTH + overshoot * 0.1), MAX_WIDTH + 30)
        setSidebarWidth(resistedWidth)
      } else {
        // Normal smooth resizing
        setIsSidebarOpen(true)
        setIsResisting(false)
        setSidebarWidth(targetWidth)
        localStorage.setItem('sidebarWidth', targetWidth.toString())
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      setIsDragging(false)
      setIsResisting(false)
      document.body.classList.remove('resizing-sidebar')

      // Snap back to bounds if released in resistance zone
      setSidebarWidth(prev => {
        let settled = prev
        if (prev < MIN_WIDTH) settled = MIN_WIDTH
        else if (prev > MAX_WIDTH) settled = MAX_WIDTH
        localStorage.setItem('sidebarWidth', settled.toString())
        return settled
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('resizing-sidebar')
    }
  }, [isDragging])

  const handleCreateCollection = async (name: string) => {
    const res = await CollectionService.addCollection({ name })
    const created = (res as { data?: Collection }).data
    if (created) {
      setCurrentCollections(prev => [...prev, created])
      onCollectionCreated?.(created)
      navigate(`/${created.id}`)
    }
  }

  const handleUpdateCollection = async (newName: string) => {
    if (!editingCol) return
    const res = await CollectionService.updateCollection({ name: newName }, String(editingCol.id))
    const updated = (res as { data?: Collection }).data ?? { ...editingCol, name: newName }
    setCurrentCollections(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    onCollectionUpdated?.(updated)
    setEditingCol(null)
  }

  const handleDeleteCollection = async () => {
    if (!deletingCol) return
    const idToDelete = deletingCol.id
    await CollectionService.deleteCollection(String(idToDelete))
    setCurrentCollections(prev => prev.filter(c => c.id !== idToDelete))
    onCollectionDeleted?.(idToDelete)
    setDeletingCol(null)
    const currentPath = window.location.pathname
    if (currentPath === `/${idToDelete}` || currentPath.startsWith(`/${idToDelete}/`)) {
      navigate('/all')
    }
  }

  return (
    <div
      className={`app-layout ${!isSidebarOpen ? 'sidebar-closed' : ''}`}
      style={{ '--sidebar-width': `${isSidebarOpen ? sidebarWidth : 0}px` } as React.CSSProperties}
    >
      <div
        className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'} ${isDragging ? 'resizing' : ''} ${isResisting ? 'resisting-min' : ''}`}
        style={{ width: isSidebarOpen ? sidebarWidth : 0 }}
      >
        <Sidebar
          collections={currentCollections}
          noteCounts={noteCounts}
          totalNoteCount={totalNoteCount}
          userName={userName}
          onNewNote={onNewNote}
          onNewCollection={() => setNewColOpen(true)}
          onEditCollection={col => setEditingCol(col)}
          onDeleteCollection={col => setDeletingCol(col)}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="sidebar-resizer" onMouseDown={handleMouseDown} />
      </div>

      {isSidebarOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="main-content">
        <div className="main-topbar">
          <div className="main-topbar-left">
            {!isSidebarOpen && (
              <button
                className="icon-btn sidebar-toggle-btn"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
                title="Open sidebar"
              >
                <ShowSidebarIcon />
              </button>
            )}
            {topbarLeft}
          </div>
          <div className="main-topbar-right">{topbarRight}</div>
        </div>
        {children}
      </div>

      <NewCollectionModal
        isOpen={newColOpen}
        collections={currentCollections}
        onClose={() => setNewColOpen(false)}
        onSubmit={handleCreateCollection}
      />
      <EditCollectionModal
        isOpen={Boolean(editingCol)}
        initialName={editingCol?.name}
        collectionId={editingCol?.id}
        collections={currentCollections}
        onClose={() => setEditingCol(null)}
        onSubmit={handleUpdateCollection}
      />
      <ConfirmModal
        isOpen={Boolean(deletingCol)}
        onClose={() => setDeletingCol(null)}
        onConfirm={handleDeleteCollection}
        title="Delete Collection"
        message={`Delete "${deletingCol?.name}"? Notes inside will become unsorted.`}
        confirmText="Delete"
        isDestructive
        accentColor={getCollectionColor(deletingCol?.id, currentCollections)}
      />
      <QuickNoteModal
        isOpen={quickNoteOpen}
        onClose={() => setQuickNoteOpen(false)}
        onSubmit={handleQuickNoteSubmit}
        collections={currentCollections}
      />
    </div>
  )
}
