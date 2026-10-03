import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'
import { openUrl } from '@tauri-apps/plugin-opener'
import { OUTPUT_URL } from '../services/api'

// ── Icons ─────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" fill="#4285F4" />
      <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z" fill="#34A853" />
      <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" fill="#FBBC05" />
      <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" fill="#EA4335" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ButtonSpinner() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      strokeLinecap="round" aria-hidden="true" className="btn-spinner">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

// ── Sign In Form ───────────────────────────────────────────────

function SignInForm() {
  const { login }     = useAuth()
  const navigate      = useNavigate()
  const [email,       setEmail]         = useState('')
  const [password,    setPassword]      = useState('')
  const [error,       setError]         = useState('')
  const [loading,     setLoading]       = useState(false)
  const [googleLoad,  setGoogleLoad]    = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/all')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoad(true)
    await openUrl(OUTPUT_URL + '/api/OAuth/google/redirect')
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field">
        <label htmlFor="signin-email" className="auth-field-label">Email</label>
        <input
          id="signin-email" className="auth-field-input" type="email"
          placeholder="maya@example.com" value={email}
          onChange={e => setEmail(e.target.value)} required autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="signin-password" className="auth-field-label">Password</label>
        <PasswordInput
          id="signin-password" className="auth-field-input" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          required autoComplete="current-password"
        />
      </div>

      <button id="signin-submit-btn" className="auth-submit-btn" type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in →'}
      </button>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-label">or continue with</span>
        <div className="auth-divider-line" />
      </div>

      <button id="signin-google-btn" className="auth-google-btn" type="button" onClick={handleGoogle} disabled={googleLoad}>
        {googleLoad ? <ButtonSpinner /> : <GoogleLogo />}
        <span>{googleLoad ? 'Redirecting…' : 'Continue with Google'}</span>
      </button>

      <p className="auth-forgot">Forgot password? <a href="#forgot">Reset it</a></p>
    </form>
  )
}

// ── Sign Up Form ───────────────────────────────────────────────

function SignUpForm() {
  const { register }  = useAuth()
  const navigate      = useNavigate()
  const [firstName,   setFirstName]     = useState('')
  const [lastName,    setLastName]      = useState('')
  const [email,       setEmail]         = useState('')
  const [password,    setPassword]      = useState('')
  const [error,       setError]         = useState('')
  const [loading,     setLoading]       = useState(false)
  const [googleLoad,  setGoogleLoad]    = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ firstName, lastName, first_name: firstName, last_name: lastName, email, password })
      navigate('/all')
    } catch (err: any) {
      const errors = err.response?.data?.errors
      const msg    = errors
        ? Object.values(errors).flat().join(' ')
        : (err.response?.data?.message || err.message || 'Could not create account.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoad(true)
    await openUrl(OUTPUT_URL + '/api/OAuth/google/redirect')
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field-row">
        <div className="auth-field">
          <label htmlFor="signup-firstname" className="auth-field-label">First Name</label>
          <input
            id="signup-firstname" className="auth-field-input" type="text"
            placeholder="Maya" value={firstName}
            onChange={e => setFirstName(e.target.value)} required autoComplete="given-name"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="signup-lastname" className="auth-field-label">Last Name</label>
          <input
            id="signup-lastname" className="auth-field-input" type="text"
            placeholder="Chen" value={lastName}
            onChange={e => setLastName(e.target.value)} autoComplete="family-name"
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="signup-email" className="auth-field-label">Email</label>
        <input
          id="signup-email" className="auth-field-input" type="email"
          placeholder="maya@example.com" value={email}
          onChange={e => setEmail(e.target.value)} required autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="signup-password" className="auth-field-label">Password</label>
        <PasswordInput
          id="signup-password" className="auth-field-input" placeholder="Create a strong password"
          value={password} onChange={e => setPassword(e.target.value)}
          required autoComplete="new-password" minLength={8}
        />
      </div>

      <button id="signup-submit-btn" className="auth-submit-btn" type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account →'}
      </button>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-label">or continue with</span>
        <div className="auth-divider-line" />
      </div>

      <button id="signup-google-btn" className="auth-google-btn" type="button" onClick={handleGoogle} disabled={googleLoad}>
        {googleLoad ? <ButtonSpinner /> : <GoogleLogo />}
        <span>{googleLoad ? 'Redirecting…' : 'Continue with Google'}</span>
      </button>
    </form>
  )
}

// ── Auth Page ──────────────────────────────────────────────────

type Tab = 'signin' | 'signup'

export default function AuthPage() {
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('signin')

  return (
    <div className="auth-page">
      {/* Warm background blobs */}
      <div className="auth-blob" style={{
        top: '-8rem', left: '-6rem', width: '28rem', height: '28rem',
        backgroundColor: theme === 'dark' ? 'rgba(192,141,48,0.07)' : 'rgba(255,200,100,0.25)',
      }} />
      <div className="auth-blob" style={{
        bottom: '-8rem', right: '-6rem', width: '22rem', height: '22rem',
        backgroundColor: theme === 'dark' ? 'rgba(192,141,48,0.05)' : 'rgba(255,180,80,0.15)',
      }} />

      {/* Topbar */}
      <header className="auth-topbar">
        <button
          id="auth-theme-toggle"
          className="auth-topbar-icon-btn"
          onClick={toggleTheme}
          type="button"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </header>

      {/* Main */}
      <main className="auth-main">
        {/* Branding */}
        <div className="auth-branding">
          <p className="auth-brand-label">Unsticky Notes</p>
          <h1 className="auth-headline">Think clearly.<br />Write freely.</h1>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Tab switcher */}
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              id="auth-tab-signin"
              className={`auth-tab${activeTab === 'signin' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'signin'}
              onClick={() => setActiveTab('signin')}
              type="button"
            >
              Sign in
            </button>
            <button
              id="auth-tab-signup"
              className={`auth-tab${activeTab === 'signup' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'signup'}
              onClick={() => setActiveTab('signup')}
              type="button"
            >
              Create account
            </button>
          </div>

          {/* Form */}
          {activeTab === 'signin' ? <SignInForm /> : <SignUpForm />}
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-footer">
        Unsticky Notes v1.0 · {typeof window !== 'undefined' && navigator.userAgent.includes('Win') ? 'Windows' : 'Desktop'}
      </footer>

      {/* Help */}
      {/* <button className="help-btn" type="button" title="Help" aria-label="Help">?</button> */}
    </div>
  )
}
