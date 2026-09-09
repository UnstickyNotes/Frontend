import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import AppLayout from '../components/AppLayout'
import ConfirmModal from '../components/ConfirmModal'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../contexts/AuthContext'
import * as CollectionService from '../services/CollectionService'
import * as ProfileService from '../services/ProfileService'
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

  // Belt-and-suspenders: clear draft every time the edit panel opens for passwords.
  // Some browsers (Firefox-based) autofill type="password" inputs after mount,
  // overriding the initial state — this useEffect fires after render and wins.
  useEffect(() => {
    if (editing && type === 'password') {
      setDraft('')
    }
  }, [editing, type])

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return }
    setSaving(true)
    try { await onSave(draft); setEditing(false) }
    finally { setSaving(false) }
  }

  if (editing) {
    return (
      <div className="profile-field-row" data-field={label.toLowerCase().replace(' ', '-')}>
        <div style={{ flex: 1 }}>
          <div className="profile-field-label">{label}</div>
          {type === 'password' ? (
            <PasswordInput
              id={`profile-field-${label.toLowerCase().replace(' ', '-')}`}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoComplete="new-password"
              autoFocus
              style={{ marginTop: '0.25rem', maxWidth: '260px' }}
            />
          ) : (
            <input
              className="auth-input"
              type={type}
              value={draft}
              onChange={e => setDraft(e.target.value)}
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
              onClick={() => { setEditing(false); setDraft(type === 'password' ? '' : value) }} type="button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-field-row" data-field={label.toLowerCase().replace(' ', '-')}>
      <div>
        <div className="profile-field-label">{label}</div>
        <div className="profile-field-value">{value || '—'}</div>
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

  useEffect(() => {
    CollectionService.getCollections()
      .then((res: { data?: Collection[] }) => setCollections(res.data ?? []))
      .catch(console.error)
  }, [])

  const [signOutModalOpen, setSignOutModalOpen] = useState(false)

  const handleSignOutConfirm = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate('/login')
    } finally {
      setSigningOut(false)
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
            <div className="profile-avatar" aria-hidden="true">{initials || '?'}</div>
            <div className="profile-identity-info">
              <p className="profile-name">{fullName || 'User'}</p>
              {user?.id && (
                <div className="profile-id-badge">#{`ID-${String(user.id).padStart(6, '0')}`}</div>
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
        </div>
      </div>

      <ConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={handleSignOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDestructive
      />
    </AppLayout>
  )
}
