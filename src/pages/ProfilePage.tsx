import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import AppLayout from '../components/AppLayout'
import ConfirmModal from '../components/ConfirmModal'
import Modal from '../components/Modal'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../contexts/AuthContext'
import * as CollectionService from '../services/CollectionService'
import * as ProfileService from '../services/ProfileService'
import { AvatarCacheService } from '../services/AvatarCacheService'
import type { Collection } from '../types'

function PencilIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
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

function CameraIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.[0]?.toUpperCase() ?? ''
  const l = lastName?.[0]?.toUpperCase() ?? ''
  return f + l
}

// ── Inline edit field ─────────────────────────────────────────

interface InlineEditProps {
  label: string
  value: string
  onSave: (val: string) => Promise<void>
  type?: string
}

function InlineEditField({ label, value, onSave, type = 'text' }: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  // Password fields always start blank
  const [draft, setDraft] = useState(type === 'password' ? '' : value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Belt-and-suspenders: clear draft every time the edit panel opens for passwords.
  // Some browsers (Firefox-based) autofill type="password" inputs after mount,
  // overriding the initial state — this useEffect fires after render and wins.
  useEffect(() => {
    if (editing && type === 'password') {
      setDraft('')
      setError('')
    }
  }, [editing, type])

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return }
    setSaving(true)
    setError('')
    try {
      await onSave(draft)
      setEditing(false)
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.message && err.message.toLowerCase().includes('network')
          ? 'Network Error'
          : err.message) ||
        'Network Error'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setError('')
    setDraft(type === 'password' ? '' : value)
  }

  if (editing) {
    return (
      <div
        className="profile-field-row"
        data-field={label.toLowerCase().replace(' ', '-')}
        onCopy={type === 'password' ? e => e.preventDefault() : undefined}
        onCut={type === 'password' ? e => e.preventDefault() : undefined}
        onContextMenu={type === 'password' ? e => e.preventDefault() : undefined}
      >
        <div style={{ flex: 1 }}>
          <div className="profile-field-label">{label}</div>
          {error && (
            <div className="auth-error" style={{ marginTop: '0.375rem', marginBottom: '0.375rem', maxWidth: '280px' }}>
              {error}
            </div>
          )}
          {type === 'password' ? (
            <PasswordInput
              id={`profile-field-${label.toLowerCase().replace(' ', '-')}`}
              value={draft}
              onChange={e => {
                setDraft(e.target.value)
                if (error) setError('')
              }}
              autoComplete="new-password"
              autoFocus
              preventCopy={true}
              style={{ marginTop: '0.25rem', maxWidth: '260px' }}
            />
          ) : (
            <input
              className="auth-input"
              type={type}
              value={draft}
              onChange={e => {
                setDraft(e.target.value)
                if (error) setError('')
              }}
              autoFocus
              style={{ marginTop: '0.25rem', maxWidth: '260px' }}
            />
          )}
          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
            <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
              onClick={handleSave} disabled={saving} type="button">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              onClick={handleCancel} type="button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="profile-field-row"
      data-field={label.toLowerCase().replace(' ', '-')}
      onCopy={type === 'password' ? e => e.preventDefault() : undefined}
      onCut={type === 'password' ? e => e.preventDefault() : undefined}
      onContextMenu={type === 'password' ? e => e.preventDefault() : undefined}
    >
      <div>
        <div className="profile-field-label">{label}</div>
        <div
          className="profile-field-value"
          style={type === 'password' ? { userSelect: 'none', WebkitUserSelect: 'none' } : undefined}
          onCopy={type === 'password' ? e => e.preventDefault() : undefined}
        >
          {value || '—'}
        </div>
      </div>
      <button className="icon-btn" type="button" aria-label={`Edit ${label}`}
        onClick={() => setEditing(true)}>
        <PencilIcon />
      </button>
    </div>
  )
}

// ── Profile Page ──────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [signingOut, setSigningOut] = useState(false)
  const [signOutModalOpen, setSignOutModalOpen] = useState(false)

  // Avatar states
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [imageError, setImageError] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [deletePfpModalOpen, setDeletePfpModalOpen] = useState(false)
  const [deletingPfp, setDeletingPfp] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarContainerRef = useRef<HTMLDivElement>(null)

  // Delete account state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    CollectionService.getCollections()
      .then((res) => setCollections(res.data ?? []))
      .catch(console.error)
  }, [])

  // Close avatar dropdown menu on outside click or Escape
  useEffect(() => {
    if (!avatarMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarContainerRef.current && !avatarContainerRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAvatarMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [avatarMenuOpen])

  // Set avatar from local cache if custom-uploaded, or use user's remote URL
  useEffect(() => {
    if (!user?.id) {
      setAvatarSrc(null)
      setImageError(false)
      return
    }

    // 1. Check if user previously uploaded a custom avatar saved in local cache
    const customCached = AvatarCacheService.getCachedAvatar(user.id)
    if (customCached) {
      setAvatarSrc(customCached)
      setImageError(false)
      return
    }

    // 2. Otherwise, use remote avatar URL returned with user (e.g. Google OAuth or backend)
    const raw = user?.avatar_url || user?.avatarUrl || user?.avatar || null
    if (!raw) {
      setAvatarSrc(null)
      setImageError(false)
      return
    }

    // Resolve relative storage path if needed (e.g. /storage/... -> http://localhost:8000/storage/...)
    const resolvedUrl =
      raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')
        ? raw
        : raw.startsWith('/')
          ? `http://localhost:8000${raw}`
          : `http://localhost:8000/${raw}`

    setAvatarSrc(resolvedUrl)
    setImageError(false)
  }, [user?.id, user?.avatar_url, user?.avatarUrl, user?.avatar])

  useEffect(() => {
    if (deleteModalOpen) {
      setDeletePassword('')
      setDeleteError('')
      const timer = setTimeout(() => {
        setDeletePassword('')
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [deleteModalOpen])

  const handleSignOutConfirm = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate('/login')
    } finally {
      setSigningOut(false)
    }
  }

  // File selection for avatar with type & 5MB size validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // Reset so user can re-select same file

    // 1. Check if it's an image
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file.')
      return
    }

    // 2. Check max size of 5MB
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      setAvatarError('Image size must be less than 5MB.')
      return
    }

    setAvatarError('')
    setAvatarLoading(true)

    try {
      // Read file as base64 data URL for immediate preview and persistent storage
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      setAvatarSrc(dataUrl)
      setImageError(false)

      // Save to local cache
      if (user?.id) {
        await AvatarCacheService.setCachedAvatar(user.id, dataUrl)
      }

      // Send API request to backend
      try {
        await ProfileService.setPfp(file)
        await refreshUser()
      } catch (apiErr) {
        // Backend not implemented yet as per instructions
        console.warn('Backend setPfp API call (backend not implemented yet):', apiErr)
      }
    } catch {
      setAvatarError('Failed to process selected image.')
    } finally {
      setAvatarLoading(false)
    }
  }

  // Delete profile picture
  const handleDeletePfpConfirm = async () => {
    setDeletingPfp(true)
    setAvatarError('')
    try {
      // 1. Clear local cache
      if (user?.id) {
        await AvatarCacheService.deleteCachedAvatar(user.id)
      }
      // 2. Reset state to show initials
      setAvatarSrc(null)
      setImageError(false)

      // 3. Send API request to backend
      try {
        await ProfileService.deletePfp()
        await refreshUser()
      } catch (apiErr) {
        console.warn('Backend deletePfp API call (backend not implemented yet):', apiErr)
      }
    } catch {
      setAvatarError('Failed to delete profile picture.')
    } finally {
      setDeletingPfp(false)
      setDeletePfpModalOpen(false)
    }
  }

  const handleOpenDeleteModal = () => {
    setDeletePassword('')
    setDeleteError('')
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    if (deleting) return
    setDeleteModalOpen(false)
    setDeletePassword('')
    setDeleteError('')
  }

  const handleDeleteAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!deletePassword) return

    setDeleting(true)
    setDeleteError('')
    try {
      await ProfileService.deleteAccount(deletePassword)
      await logout()
      navigate('/login')
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.message && err.message.toLowerCase().includes('network')
          ? 'Network Error'
          : err.message) ||
        'Failed to delete account. Please verify your password.'
      setDeleteError(msg)
    } finally {
      setDeleting(false)
    }
  }

  const saveFirstName = async (val: string) => {
    await ProfileService.updateProfile({ first_name: val, firstName: val })
    await refreshUser()
  }

  const saveLastName = async (val: string) => {
    await ProfileService.updateProfile({ last_name: val, lastName: val })
    await refreshUser()
  }

  const savePassword = async (val: string) => {
    await ProfileService.updateProfile({ password: val })
  }

  const initials = getInitials(user?.first_name, user?.last_name)
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const handle = user?.email?.split('@')[0] ?? ''

  const topbarLeft = (
    <>
      <span className="breadcrumb-item" onClick={() => navigate('/')}
        role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate('/')}>
        Account
      </span>
      <span className="breadcrumb-separator">›</span>
      <span className="breadcrumb-current">Profile</span>
    </>
  )

  return (
    <AppLayout collections={collections} userName={fullName || 'User'} userHandle={handle} topbarLeft={topbarLeft}>
      <div className="main-scroll profile-main-scroll">
        <div className="profile-container">
          <h1 className="profile-title">Profile</h1>

          {/* Identity card */}
          <section className="profile-identity-card" aria-label="User identity">
            <div className="profile-avatar-container" ref={avatarContainerRef}>
              <div
                id="profile-avatar-btn"
                className={`profile-avatar${avatarLoading ? ' profile-avatar--loading' : ''}`}
                onClick={() => setAvatarMenuOpen(prev => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setAvatarMenuOpen(prev => !prev)}
                aria-label="Change profile picture"
                title="Click to manage profile picture"
              >
                {avatarSrc && !imageError ? (
                  <img
                    src={avatarSrc}
                    alt={fullName || 'Avatar'}
                    className="profile-avatar-img"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="profile-avatar-initials">{initials || '?'}</span>
                )}

                {/* Camera badge indicating clickable avatar */}
                <div className="profile-avatar-badge" aria-hidden="true">
                  <CameraIcon />
                </div>
              </div>

              {/* Dropdown menu */}
              {avatarMenuOpen && (
                <div className="profile-avatar-dropdown" role="menu">
                  <button
                    id="set-pfp-btn"
                    className="profile-avatar-dropdown-item"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAvatarMenuOpen(false)
                      fileInputRef.current?.click()
                    }}
                  >
                    <CameraIcon />
                    <span>Set Profile Picture</span>
                  </button>

                  <button
                    id="delete-pfp-btn"
                    className="profile-avatar-dropdown-item profile-avatar-dropdown-item--destructive"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAvatarMenuOpen(false)
                      setDeletePfpModalOpen(true)
                    }}
                  >
                    <TrashIcon />
                    <span>Delete Profile Picture</span>
                  </button>
                </div>
              )}

              {/* Hidden file input: only allow images */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {avatarError && (
              <div className="auth-error" style={{ maxWidth: '320px', marginTop: '0.5rem', marginBottom: 0 }}>
                {avatarError}
              </div>
            )}

            <div className="profile-identity-info">
              <p className="profile-name">{fullName || 'User'}</p>
              {user?.id && (
                <div className="profile-id-badge">#ID-{user.id}</div>
              )}
            </div>
          </section>

          {/* Profile fields */}
          <section className="profile-fields-card" aria-label="Profile information">
            <div className="profile-fields-header" style={{ justifyContent: 'center' }}>
              <span className="profile-fields-header-title">Profile Info</span>
            </div>

            <InlineEditField label="First Name" value={user?.first_name ?? ''} onSave={saveFirstName} />
            <InlineEditField label="Last Name" value={user?.last_name ?? ''} onSave={saveLastName} />

            {/* Email — read-only (grayed out row + lock icon, no text badge) */}
            <div className="profile-field-row profile-field-row--readonly" data-field="email">
              <div>
                <div className="profile-field-label">Email</div>
                <div className="profile-field-value muted">{user?.email ?? '—'}</div>
              </div>
              <div className="icon-btn" style={{ cursor: 'default', color: 'var(--text-muted)' }}
                title="Email cannot be edited" aria-label="Email is read-only">
                <LockIcon />
              </div>
            </div>

            <InlineEditField label="Password" value="••••••••••••" onSave={savePassword} type="password" />
          </section>

          {/* Sign out */}
          <button
            id="signout-btn"
            className="signout-btn"
            type="button"
            onClick={() => setSignOutModalOpen(true)}
            disabled={signingOut}
            aria-label="Sign out"
          >
            <LogOutIcon />
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>

          {/* Delete account */}
          <button
            id="delete-account-btn"
            className="delete-account-btn"
            type="button"
            onClick={handleOpenDeleteModal}
            aria-label="Delete account"
          >
            <TrashIcon />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete profile picture confirmation modal */}
      <ConfirmModal
        isOpen={deletePfpModalOpen}
        onClose={() => !deletingPfp && setDeletePfpModalOpen(false)}
        onConfirm={handleDeletePfpConfirm}
        title="Delete Profile Picture"
        message="Are you sure you want to delete your profile picture? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />

      {/* Sign out confirmation */}
      <ConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={handleSignOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDestructive
      />

      {/* Delete account confirmation modal */}
      <Modal isOpen={deleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="420px">
        <form onSubmit={handleDeleteAccount} noValidate autoComplete="off">
          <div className="modal-header">
            <h3 className="modal-title">Delete Account</h3>
            <p className="modal-subtitle">
              you are deleting your account and you cant undo this. if you are sure you want to delete your account enter your password
            </p>
          </div>

          {deleteError && (
            <div className="auth-error" style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>
              {deleteError}
            </div>
          )}

          <div style={{ marginTop: '1.25rem' }}>
            <PasswordInput
              id="delete-account-password"
              name="delete_account_verification_token"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={e => {
                setDeletePassword(e.target.value)
                if (deleteError) setDeleteError('')
              }}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              preventAutofill={true}
              preventCopy={true}
              autoFocus
              required
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '1.75rem' }}>
            <button
              className="btn-cancel"
              type="button"
              onClick={handleCloseDeleteModal}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              id="confirm-delete-account-btn"
              className="btn-destructive"
              type="submit"
              disabled={deleting || !deletePassword}
            >
              {deleting ? 'Deleting…' : 'Delete Account'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
