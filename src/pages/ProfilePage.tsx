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
import { OUTPUT_URL } from '../services/api'

// ── Icons ─────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24" aria-hidden="true">
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

// ── Inline Edit Field ─────────────────────────────────────────

interface InlineEditProps {
  label:  string
  value:  string
  onSave: (val: string) => Promise<void>
  type?:  string
}

function InlineEditField({ label, value, onSave, type = 'text' }: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const {user} = useAuth()
  const [draft, setDraft]     = useState(type === 'password' ? '' : value)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (editing && type === 'password') {
      setDraft(''); setError('')
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
      setError(err.response?.data?.message || 'Error saving.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false); setError(''); setDraft(type === 'password' ? '' : value)
  }

  if (editing) {
    return (
      <div className="profile-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <div className="profile-field-label">{label}</div>
        {error && <div className="auth-error" style={{ margin: '0.25rem 0' }}>{error}</div>}
        {type === 'password' ? (
          <PasswordInput
            id={`edit-${label}`} value={draft}
            onChange={e => setDraft(e.target.value)}
            autoComplete="new-password" autoFocus
            style={{ width: '100%', maxWidth: '300px', marginTop: '0.25rem' }}
          />
        ) : (
          <input
            className="auth-input" type={type} value={draft}
            onChange={e => setDraft(e.target.value)} autoFocus
            style={{ width: '100%', maxWidth: '300px', marginTop: '0.25rem' }}
          />
        )}
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem' }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn-ghost" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-field-row">
      <div>
        <div className="profile-field-label">{label}</div>
        <div className="profile-field-value">{value || '—'}</div>
      </div>
      <button className="icon-btn" type="button" onClick={() => setEditing(true)} aria-label={`Edit ${label}`}>
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

  const [signOutModal, setSignOutModal] = useState(false)

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [deletePfpModal, setDeletePfpModal] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarContainerRef = useRef<HTMLDivElement>(null)

  const [deleteAccountModal, setDeleteAccountModal] = useState(false)
  const [deleteOAccountModal, setDeleteOAccountModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [deleteFlag, setDeleteFlag] = useState('')
  const deletingFlags = [
    'im a bitch',
    'imabitch',
    'im abitch',
    'i am a bitch',
    'im bitch',
    'i am bitch',
    'ima bitch',
  ]
  const isDeleteFlags = (input:string) => {
    console.log(user?.Oauth_provider)
    for(let f of deletingFlags){
      if (input.toLowerCase() === f) return true
    }
    return false
  }

  const usedOauth = (user?.Oauth_provider !== 'local') ? true : false
  
  useEffect(() => {
    CollectionService.getCollections()
      .then(res => setCollections((res as { data?: Collection[] }).data ?? []))
      .catch(console.error)
  }, [])

  // Avatar resolution
  useEffect(() => {
    if (!user?.id) { setAvatarSrc(null); setImgError(false); return }
    const cached = AvatarCacheService.getCachedAvatar(user.id)
    if (cached) { setAvatarSrc(cached); setImgError(false); return }
    const raw = user?.avatar_url || user?.avatarUrl || null
    if (!raw) { setAvatarSrc(null); setImgError(false); return }
    const url = raw.startsWith('http') || raw.startsWith('data:')
      ? raw : `${OUTPUT_URL}${raw.startsWith('/') ? '' : '/'}${raw}`
    setAvatarSrc(url)
    setImgError(false)
  }, [user])

  // Avatar menu outside click
  useEffect(() => {
    if (!avatarMenuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (avatarContainerRef.current && !avatarContainerRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [avatarMenuOpen])

  const handleSignOut = async () => {
    try { await logout(); navigate('/login') }
    catch { /* ignore */ }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    const dataUrl = await new Promise<string>((res, rej) => {
      reader.onload = () => res(reader.result as string)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
    setAvatarSrc(dataUrl)
    setImgError(false)
    if (user?.id) await AvatarCacheService.setCachedAvatar(user.id, dataUrl)
    try { await ProfileService.setPfp(file); await refreshUser() } catch { /* ignore */ }
  }

  const handleDeletePfp = async () => {
    if (user?.id) await AvatarCacheService.deleteCachedAvatar(user.id)
    setAvatarSrc(null)
    setImgError(false)
    try { await ProfileService.deletePfp(); await refreshUser() } catch { /* ignore */ }
    setDeletePfpModal(false)
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deletePassword) return
    setDeleting(true)
    try {
      await ProfileService.deleteAccount(usedOauth, deletePassword)
      await logout()
      navigate('/login')
    } catch {
      setDeleting(false)
    }
  }
  const handleDeleteOAccount = async() => {
    console.log('deleting')
    setDeleting(true)
    try {
      await ProfileService.deleteAccount(usedOauth)
      await logout()
      navigate('/login')
    } catch {
      setDeleting(false)
    }
    finally{setDeleting(false)}
  }

  const initials = getInitials(user?.first_name, user?.last_name)
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User'

  const topbarLeft = (
    <>
      <span className="breadcrumb-item" onClick={() => navigate('/all')}>Account</span>
      <span className="breadcrumb-separator">›</span>
      <span className="breadcrumb-current">Profile</span>
    </>
  )

  return (
    <AppLayout collections={collections} userName={fullName} topbarLeft={topbarLeft}>
      <div className="main-scroll profile-main-scroll">
        <div className="profile-container">

          {/* Identity */}
          <div className="profile-identity">
            <div className="profile-avatar-container" ref={avatarContainerRef}>
              <div
                className="profile-avatar"
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                role="button" tabIndex={0}
              >
                {avatarSrc && !imgError ? (
                  <img src={avatarSrc} alt={fullName} onError={() => setImgError(true)} />
                ) : initials || '?'}
                <div className="profile-avatar-badge"><CameraIcon /></div>
              </div>
              {avatarMenuOpen && (
                <div className="profile-avatar-dropdown">
                  <button className="profile-avatar-dropdown-item" onClick={() => { setAvatarMenuOpen(false); fileInputRef.current?.click() }}>
                    <CameraIcon /><span>Upload picture</span>
                  </button>
                  <button className="profile-avatar-dropdown-item profile-avatar-dropdown-item--destructive" onClick={() => { setAvatarMenuOpen(false); setDeletePfpModal(true) }}>
                    <TrashIcon /><span>Remove picture</span>
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
            <h2 className="profile-name">{fullName}</h2>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-email">ID - {user?.id ?? '—'}</p>
          </div>

          {/* Stats Row */}
          {/* <div className="profile-stats">
            <div className="profile-stat-card">
              <div className="profile-stat-value">{}</div>
              <div className="profile-stat-label">User ID</div>
            </div>
          </div> */}

          {/* Profile Fields */}
          <div className="profile-card">
            <div className="profile-card-header">Personal Information</div>
            <InlineEditField
              label="First Name"
              value={user?.first_name ?? ''}
              onSave={async val => { await ProfileService.updateProfile({ first_name: val, firstName: val }); await refreshUser() }}
            />
            <InlineEditField
              label="Last Name"
              value={user?.last_name ?? ''}
              onSave={async val => { await ProfileService.updateProfile({ last_name: val, lastName: val }); await refreshUser() }}
            />
            <div className="profile-field-row profile-field-row--readonly">
              <div>
                <div className="profile-field-label">Email</div>
                <div className="profile-field-value muted">{user?.email ?? '—'}</div>
              </div>
              <span className="readonly-badge"><LockIcon /> Read Only</span>
            </div>
          </div>
          { !usedOauth ? (
            <div className="profile-card">
              <div className="profile-card-header">Security</div>
              <InlineEditField
                label="Password"
                value="Change Password"
                type="password"
                onSave={async val => { await ProfileService.updateProfile({ password: val }) }}
              />
            </div>
            ) : (
               <div>
                {/* REMOVED SECURITY CARD WHEN USER USE OAuth TO SIGN UP */}
              </div>
            )
          }
          {/* Actions */}
          <button className="signout-btn" onClick={() => setSignOutModal(true)}>
            <LogOutIcon /> Sign Out
          </button>
          <button className="delete-account-btn" onClick={() => {
            usedOauth 
            ? setDeleteOAccountModal(true)
            : setDeleteAccountModal(true)
          }
            }>
            <TrashIcon /> Delete Account
          </button>

        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={signOutModal}
        onClose={() => setSignOutModal(false)}
        onConfirm={handleSignOut}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmText="Sign out"
        isDestructive
      />
      <ConfirmModal
        isOpen={deletePfpModal}
        onClose={() => setDeletePfpModal(false)}
        onConfirm={handleDeletePfp}
        title="Remove picture"
        message="Are you sure you want to remove your profile picture?"
        confirmText="Remove"
        isDestructive
      />
      <Modal isOpen={deleteAccountModal} onClose={() => setDeleteAccountModal(false)} maxWidth="400px">
        <form onSubmit={handleDeleteAccount}>
          <div className="modal-header">
            <h3 className="modal-title">Delete Account</h3>
          </div>
          <p className="modal-subtitle">This action is permanent and cannot be undone.</p>
          <div className="modal-field" style={{ marginTop: '1rem' }}>
            <label className="modal-label">Enter password to confirm</label>
            <PasswordInput
              id="delete-account-pwd"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              required autoFocus
            />
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" type="button" onClick={() => setDeleteAccountModal(false)}>Cancel</button>
            <button className="btn-destructive" type="submit" disabled={deleting || !deletePassword} style={{ flex: 1 }}>
              {deleting ? 'Deleting…' : 'Delete Account'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteOAccountModal} onClose={() => setDeleteOAccountModal(false)} maxWidth="400px">
        <form onSubmit={handleDeleteAccount}>
          <div className="modal-header">
            <h3 className="modal-title">Delete Account</h3>
          </div>
          <p className="modal-subtitle">This action is permanent and cannot be undone.</p>
          <div className="modal-field" style={{ marginTop: '1rem' }}>
            <label className="modal-label">Please, Write "Im a bitch" to delete your accout.</label>
            <input
            // value={usedOauth? 'true':'false'}
              onChange={e => setDeleteFlag(e.target.value)}
              required autoFocus
            />
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" type="button" onClick={() => setDeleteOAccountModal(false)}>Cancel</button>
            <button className="btn-destructive" onClick={(() => {
              handleDeleteOAccount
              setDeleteOAccountModal(false)
            })} disabled={deleting || !isDeleteFlags(deleteFlag)} style={{ flex: 1 }}>
              {deleting ? 'Deleting…' : 'Delete Account'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
