import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import Sidebar from './Sidebar'
import NewCollectionModal from './NewCollectionModal'
import EditCollectionModal from './EditCollectionModal'
import ConfirmModal from './ConfirmModal'
import { type Collection } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import * as CollectionService from '../services/CollectionService'

function MoonIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface AppLayoutProps {
  children: ReactNode
  collections: Collection[]
  userName?: string
  userHandle?: string
  onNewCollection?: () => void
  onCollectionCreated?: (collection: Collection) => void
  onCollectionUpdated?: (collection: Collection) => void
  onCollectionDeleted?: (collectionId: string | number | null) => void
  /** Extra controls to render in the topbar right slot (e.g. icon buttons) */
  topbarLeft?: ReactNode
  topbarRight?: ReactNode
}

export default function AppLayout({
  children,
  collections,
  userName,
  userHandle,
  onNewCollection,
  onCollectionCreated,
  onCollectionUpdated,
  onCollectionDeleted,
  topbarLeft,
  topbarRight,
}: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null)

  const [currentCollections, setCurrentCollections] = useState<Collection[]>(collections)

  useEffect(() => {
    setCurrentCollections(collections)
  }, [collections])

  const handleOpenNewCollection = () => {
    if (onNewCollection) {
      onNewCollection()
    } else {
      setModalOpen(true)
    }
  }

  const handleCreateCollection = async (name: string) => {
    const res = await CollectionService.addCollection({ name })
    const created = (res as { data?: Collection }).data
    if (created) {
      setCurrentCollections(prev => [...prev, created])
      if (onCollectionCreated) {
        onCollectionCreated(created)
      }
      navigate(`/${created.id}`)
    }
  }

  const handleUpdateCollection = async (newName: string) => {
    if (!editingCollection) return
    const res = await CollectionService.updateCollection({ name: newName }, String(editingCollection.id))
    const updated = (res as { data?: Collection }).data ?? { ...editingCollection, name: newName }
    setCurrentCollections(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    if (onCollectionUpdated) {
      onCollectionUpdated(updated)
    }
    setEditingCollection(null)
  }

  const handleDeleteCollection = async () => {
    if (!deletingCollection) return
    const idToDelete = deletingCollection.id
    await CollectionService.deleteCollection(String(idToDelete))
    setCurrentCollections(prev => prev.filter(c => c.id !== idToDelete))
    if (onCollectionDeleted) {
      onCollectionDeleted(idToDelete)
    }
    setDeletingCollection(null)

    // If current path matches or starts with the deleted collection, navigate to Unsorted
    const currentPath = window.location.pathname
    if (currentPath === `/${idToDelete}` || currentPath.startsWith(`/${idToDelete}/`)) {
      navigate('/-1')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        collections={currentCollections}
        userName={userName}
        userHandle={userHandle}
        onNewCollection={handleOpenNewCollection}
        onEditCollection={col => setEditingCollection(col)}
        onDeleteCollection={col => setDeletingCollection(col)}
      />
      <div className="main-content">
        {/* Shared topbar — contains breadcrumb/left slot, theme toggle, and extra right controls */}
        <div className="main-topbar">
          <div className="main-topbar-left">
            {topbarLeft}
          </div>
          <div className="main-topbar-right">
            {topbarRight}
            <button
              id="app-theme-toggle"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              type="button"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
        {children}
      </div>

      <NewCollectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateCollection}
      />

      <EditCollectionModal
        isOpen={Boolean(editingCollection)}
        initialName={editingCollection?.name}
        onClose={() => setEditingCollection(null)}
        onSubmit={handleUpdateCollection}
      />

      <ConfirmModal
        isOpen={Boolean(deletingCollection)}
        onClose={() => setDeletingCollection(null)}
        onConfirm={handleDeleteCollection}
        title="Delete Collection"
        message={`Are you sure you want to delete "${deletingCollection?.name}"? Notes inside will become unsorted.`}
        confirmText="Delete Collection"
        isDestructive
      />
    </div>
  )
}
