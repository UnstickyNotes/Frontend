import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { getCollectionColor, UNSORTED_COLOR } from '../utils/collectionColors'
import type { Collection } from '../types'

// ── Icons ─────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MoreVertIcon() {
  return (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="12" cy="19" r="1.75" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CloseOrCollapseIcon() {
  return (
    <>
      <span className="sidebar-icon-desktop" aria-hidden="true">
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          <path d="M9 3v18" strokeWidth={2} />
          <path d="M15 9l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </span>
      <span className="sidebar-icon-mobile" aria-hidden="true">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    </>
  )
}

import { AvatarCacheService } from '../services/AvatarCacheService'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

function resolveAvatarUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw
  const base = 'https://unstickynotes-api.onrender.com'
  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`
}

// ── Props ──────────────────────────────────────────────────────

const UNSORTED_COLLECTION: Collection = { id: -1, name: 'Unsorted' }

export interface SidebarProps {
  collections:           Collection[]
  noteCounts?:           Record<string, number>
  totalNoteCount?:       number
  userName?:             string
  onNewNote?:            () => void
  onNewCollection?:      () => void
  onEditCollection?:     (col: Collection) => void
  onDeleteCollection?:   (col: Collection) => void
  onClose?:              () => void
}

// ── Component ──────────────────────────────────────────────────

export default function Sidebar({
  collections,
  noteCounts      = {},
  totalNoteCount  = 0,
  userName        = 'User',
  onNewNote,
  onNewCollection,
  onEditCollection,
  onDeleteCollection,
  onClose,
}: SidebarProps) {
  const navigate              = useNavigate()
  const { collectionId }      = useParams()
  const { user }              = useAuth()
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null)
  const [avatarVersion, setAvatarVersion] = useState(0)
  const [imgError, setImgError]           = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const initials   = getInitials(userName)
  const userEmail  = user?.email ?? ''

  // Listen for avatar changes
  useEffect(() => {
    const onAvatarChange = () => { setAvatarVersion(v => v + 1); setImgError(false) }
    window.addEventListener('avatar-changed', onAvatarChange)
    return () => window.removeEventListener('avatar-changed', onAvatarChange)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (openMenuId === null) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMenuId])

  const cachedAvatar = user?.id ? (AvatarCacheService?.getCachedAvatar(user.id) ?? null) : null
  const rawUrl       = user?.avatar_url || user?.avatarUrl || user?.avatar || null
  const avatarSrc    = cachedAvatar || resolveAvatarUrl(rawUrl)

  const realCollections  = collections.filter(c => c.id !== -1 && String(c.id) !== '-1')
  const allCollectionsList: Collection[] = [UNSORTED_COLLECTION, ...realCollections]

  const isAllActive       = collectionId === 'all' || !collectionId
  const getCount = (col: Collection) =>
    col.id === -1 ? (noteCounts['-1'] ?? 0) : (noteCounts[String(col.id)] ?? 0)

  const handleNav = (action: () => void) => {
    action()
    if (window.innerWidth <= 768) {
      onClose?.()
    }
  }

  return (
    <aside className="sidebar">
      {/* Logo & Collapse / Close */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-brand">
          <div className="sidebar-logo-mark">N</div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-name">Unsticky Notes</div>
            <div className="sidebar-logo-sub">workspace</div>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onClose}
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <CloseOrCollapseIcon />
        </button>
      </div>

      {/* New Note */}
      <button 
        id="sidebar-new-note-btn" 
        className="sidebar-new-note-btn" 
        onClick={() => handleNav(() => onNewNote?.())} 
        type="button"
      >
        <PlusIcon />
        <span>New Note</span>
      </button>

      {/* Nav */}
      <div className="sidebar-nav-scroll">
        {/* Library */}
        <p className="sidebar-section-label">Library</p>
        <nav className="sidebar-nav">
          <div
            id="sidebar-all-notes"
            className={`sidebar-nav-item${isAllActive ? ' active' : ''}`}
            onClick={() => handleNav(() => navigate('/all'))}
            role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleNav(() => navigate('/all'))}
            aria-current={isAllActive ? 'page' : undefined}
          >
            <div className="sidebar-nav-item-left">
              <span className="sidebar-col-dot" style={{ background: '#9ca3af' }} />
              <span className="sidebar-nav-item-name">All Notes</span>
            </div>
            <div className="sidebar-item-right">
              <span className="sidebar-count-badge">{totalNoteCount}</span>
              <div className="sidebar-item-more-placeholder" />
            </div>
          </div>
        </nav>

        {/* Collections */}
        <p className="sidebar-section-label">Collections</p>
        <nav className="sidebar-nav" aria-label="Collections">
          {allCollectionsList.map((col) => {
            const active      = String(col.id) === collectionId
            const isUnsorted  = col.id === -1 || String(col.id) === '-1'
            const isMenuOpen  = openMenuId === col.id
            const color       = isUnsorted
              ? UNSORTED_COLOR
              : getCollectionColor(col.id, realCollections)
            const count       = getCount(col)

            return (
              <div
                key={String(col.id)}
                id={`sidebar-col-${col.id}`}
                className={`sidebar-nav-item${active ? ' active' : ''}${isMenuOpen ? ' menu-open' : ''}`}
                onClick={() => { setOpenMenuId(null); handleNav(() => navigate(`/${col.id}`)) }}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleNav(() => navigate(`/${col.id}`))}
                aria-current={active ? 'page' : undefined}
              >
                <div className="sidebar-nav-item-left">
                  <span className="sidebar-col-dot" style={{ background: color }} />
                  <span className="sidebar-nav-item-name">{col.name}</span>
                </div>

                <div className="sidebar-item-right">
                  <span className="sidebar-count-badge">{count}</span>

                  {!isUnsorted ? (
                    <div
                      className="sidebar-item-menu-wrapper"
                      ref={isMenuOpen ? menuRef : null}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="sidebar-item-more-btn"
                        type="button"
                        aria-label={`Options for ${col.name}`}
                        onClick={e => {
                          e.stopPropagation()
                          setOpenMenuId(prev => prev === col.id ? null : col.id)
                        }}
                      >
                        <MoreVertIcon />
                      </button>

                      {isMenuOpen && (
                        <div className="sidebar-dropdown-menu" onClick={e => e.stopPropagation()}>
                          <button
                            className="sidebar-dropdown-item" type="button"
                            onClick={() => { setOpenMenuId(null); onEditCollection?.(col) }}
                          >
                            <PencilIcon /><span>Rename</span>
                          </button>
                          <button
                            className="sidebar-dropdown-item destructive" type="button"
                            onClick={() => { setOpenMenuId(null); onDeleteCollection?.(col) }}
                          >
                            <TrashIcon /><span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="sidebar-item-more-placeholder" />
                  )}
                </div>
              </div>
            )
          })}
        </nav>

        {/* New collection */}
        <button
          id="sidebar-new-collection-btn"
          className="sidebar-new-collection-btn"
          onClick={onNewCollection}
          type="button"
        >
          <PlusIcon /><span>New Collection</span>
        </button>
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <Link 
          to="/settings" 
          className="sidebar-bottom-link" 
          id="sidebar-settings-link"
          onClick={() => { if (window.innerWidth <= 768) onClose?.() }}
        >
          <SettingsIcon /><span>Settings</span>
        </Link>
        <div
          id="sidebar-user-row"
          className="sidebar-user-row"
          onClick={() => handleNav(() => navigate('/profile'))}
          role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleNav(() => navigate('/profile'))}
          aria-label="Go to profile"
        >
          <div className="sidebar-user-avatar">
            {avatarSrc && !imgError ? (
              <img
                key={`${avatarSrc}-${avatarVersion}`}
                src={avatarSrc}
                alt={userName}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-email">{userEmail}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
