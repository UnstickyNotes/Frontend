import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { AvatarCacheService } from '../services/AvatarCacheService'
import { type Collection } from '../types'

// ── Icons ─────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  )
}

function LightbulbIcon() {
  return (
    <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859A4 4 0 104 10a4 4 0 003.523 3.968c.27.213.462.519.477.86h4v-.828z" />
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4a2 2 0 01-2-2V9a2 2 0 00-2-2h-4a2 2 0 00-2 2v2a2 2 0 01-2 2H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MoreVerticalIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  )
}

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

// ── Helpers ───────────────────────────────────────────────────

function getCollectionIcon(col: Collection) {
  if (col.id === -1) return <InboxIcon />
  const lower = col.name.toLowerCase()
  if (lower.includes('favorite') || lower.includes('star')) return <StarIcon />
  if (lower.includes('friend') || lower.includes('heart') || lower.includes('love')) return <HeartIcon />
  if (lower.includes('idea') || lower.includes('light')) return <LightbulbIcon />
  if (lower.includes('unsorted') || lower.includes('inbox')) return <InboxIcon />
  return <FolderIcon />
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

const UNSORTED_COLLECTION: Collection = { id: -1, name: 'Unsorted' }

// ── Sidebar Component ─────────────────────────────────────────

interface SidebarProps {
  collections: Collection[]
  userName?: string
  userHandle?: string
  onNewCollection?: () => void
  onEditCollection?: (col: Collection) => void
  onDeleteCollection?: (col: Collection) => void
}

export default function Sidebar({
  collections,
  userName = 'User',
  userHandle = '',
  onNewCollection,
  onEditCollection,
  onDeleteCollection,
}: SidebarProps) {
  const navigate = useNavigate()
  const { collectionId } = useParams()
  const { user } = useAuth()
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const [avatarVersion, setAvatarVersion] = useState(0)
  const [imageError, setImageError] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const initials = getInitials(userName)

  // Listen for avatar updates (e.g. when uploaded or deleted in ProfilePage)
  useEffect(() => {
    const handleAvatarChange = () => {
      setAvatarVersion(v => v + 1)
      setImageError(false)
    }
    window.addEventListener('avatar-changed', handleAvatarChange)
    return () => window.removeEventListener('avatar-changed', handleAvatarChange)
  }, [])

  // 1. Check custom uploaded avatar from cache
  const customCached = user?.id ? AvatarCacheService.getCachedAvatar(user.id) : null

  // 2. Otherwise use remote avatar URL from user object
  const raw = user?.avatar_url || user?.avatarUrl || user?.avatar || null
  const resolvedUrl = raw
    ? raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')
      ? raw
      : raw.startsWith('/')
        ? `http://localhost:8000${raw}`
        : `http://localhost:8000/${raw}`
    : null

  const avatarSrc = customCached || resolvedUrl

  // Ensure "Unsorted" (id -1) is always at the top and only appears once
  const allCollections = [
    UNSORTED_COLLECTION,
    ...collections.filter(c => c.id !== -1),
  ]

  // Close dropdown menu when clicking anywhere outside
  useEffect(() => {
    if (activeMenuId === null) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenuId])

  return (
    <aside className="sidebar">
      {/* User identity — click to go to profile */}
      <div
        className="sidebar-user"
        onClick={() => navigate('/profile')}
        title="Profile Settings"
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate('/profile')}
        aria-label="Go to profile settings"
      >
        <div className="sidebar-avatar">
          {avatarSrc && !imageError ? (
            <img
              key={`${avatarSrc}-${avatarVersion}`}
              src={avatarSrc}
              alt={userName}
              className="sidebar-avatar-img"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <p className="sidebar-user-name">{userName}</p>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Collections section */}
      <p className="sidebar-section-label">Collections</p>

      <nav className="sidebar-nav" aria-label="Collections">
        {allCollections.map(col => {
          const isActive = String(col.id) === collectionId
          const isUnsorted = col.id === -1
          const isMenuOpen = activeMenuId === col.id

          return (
            <div
              key={col.id}
              className={`sidebar-nav-item${isActive ? ' active' : ''}${isMenuOpen ? ' menu-open' : ''}`}
              onClick={() => {
                setActiveMenuId(null)
                navigate(`/${col.id}`)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/${col.id}`)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="sidebar-nav-item-left">
                {getCollectionIcon(col)}
                <span className="sidebar-nav-item-name">{col.name}</span>
              </div>

              {/* 3-dot menu button for user collections (cannot edit/delete Unsorted) */}
              {!isUnsorted && (
                <div
                  className="sidebar-item-menu-wrapper"
                  ref={isMenuOpen ? menuRef : null}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="sidebar-item-more-btn"
                    type="button"
                    title={`Options for ${col.name}`}
                    aria-label={`Options for ${col.name}`}
                    onClick={e => {
                      e.stopPropagation()
                      setActiveMenuId(prev => (prev === col.id ? null : col.id))
                    }}
                  >
                    <MoreVerticalIcon />
                  </button>

                  {isMenuOpen && (
                    <div className="sidebar-dropdown-menu" onClick={e => e.stopPropagation()}>
                      <button
                        className="sidebar-dropdown-item"
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null)
                          onEditCollection?.(col)
                        }}
                      >
                        <PencilIcon />
                        <span>Edit</span>
                      </button>
                      <button
                        className="sidebar-dropdown-item destructive"
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null)
                          onDeleteCollection?.(col)
                        }}
                      >
                        <TrashIcon />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <button
        className="sidebar-new-collection"
        onClick={onNewCollection}
        type="button"
        aria-label="Create new collection"
      >
        <PlusIcon />
        <span>New Collection</span>
      </button>
    </aside>
  )
}
