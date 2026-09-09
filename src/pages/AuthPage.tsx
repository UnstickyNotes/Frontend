import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'

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
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Sign In Form ──────────────────────────────────────────────

function SignInForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form-title">Sign in</h2>
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-input-group">
        <input id="signin-email" className="auth-input" type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <PasswordInput id="signin-password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      <a className="auth-forgot" href="#forgot">Forgot your password?</a>
      <button className="auth-submit-btn" type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-label">or sign in with</span>
        <div className="auth-divider-line" />
      </div>
      <button className="auth-google-btn" type="button">
        <GoogleLogo /><span>Continue with Google</span>
      </button>
    </form>
  )
}

// ── Sign Up Form ──────────────────────────────────────────────

function SignUpForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        firstName,
        lastName,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      })
      navigate('/')
    } catch (err: any) {
      const errors = err.response?.data?.errors
      let msg = err.response?.data?.message
      if (errors) {
        msg = Object.values(errors).flat().join(' ')
      }
      setError(msg || err.message || 'Could not create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form-title">Create Account</h2>
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-input-group">
        <div className="auth-input-row">
          <input id="signup-firstname" className="auth-input" type="text" placeholder="First Name"
            value={firstName} onChange={e => setFirstName(e.target.value)} required autoComplete="given-name" />
          <input id="signup-lastname" className="auth-input" type="text" placeholder="Last Name"
            value={lastName} onChange={e => setLastName(e.target.value)} required autoComplete="family-name" />
        </div>
        <input id="signup-email" className="auth-input" type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <PasswordInput id="signup-password" placeholder="Create password"
          value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} />
      </div>
      <button className="auth-submit-btn" type="submit" style={{ marginTop: '0.75rem' }} disabled={loading}>
        {loading ? 'Creating…' : 'Sign Up'}
      </button>
      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-label">or fast access</span>
        <div className="auth-divider-line" />
      </div>
      <button className="auth-google-btn" type="button">
        <GoogleLogo /><span>Continue with Google</span>
      </button>
    </form>
  )
}

// ── Auth Page ─────────────────────────────────────────────────

export default function AuthPage() {
  const { theme, toggleTheme } = useTheme()
  const [signUpActive, setSignUpActive] = useState(false)

  return (
    <div className={`auth-page${theme === 'dark' ? ' dark-auth' : ''}`}>
      <header className="auth-topbar">
        <button id="auth-theme-toggle" className="theme-toggle-btn" onClick={toggleTheme} type="button"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <><MoonIcon /> Dark</> : <><SunIcon /> Light</>}
        </button>
      </header>

      <main className="auth-main">
        <div className="auth-bg-blob" style={{
          top: '-6rem', left: '-6rem', width: '24rem', height: '24rem',
          backgroundColor: theme === 'dark' ? 'rgba(18,84,79,0.12)' : 'rgba(139,154,110,0.08)',
        }} />
        <div className="auth-bg-blob" style={{
          bottom: '-6rem', right: '-6rem', width: '24rem', height: '24rem',
          backgroundColor: theme === 'dark' ? 'rgba(42,131,95,0.08)' : 'rgba(139,154,110,0.06)',
        }} />

        <div id="auth-container" className={`auth-container${signUpActive ? ' signup-active' : ''}`}>
          <div className="auth-form-panel auth-signup-panel"><SignUpForm /></div>
          <div className="auth-form-panel auth-signin-panel"><SignInForm /></div>

          <div className="auth-overlay-container" aria-hidden="true">
            <div className="auth-overlay">
              <div className="auth-overlay-panel auth-overlay-left">
                <h2 className="auth-overlay-title">Welcome Back!</h2>
                <p className="auth-overlay-text">To keep connected, please login with your personal info.</p>
                <button id="overlay-signin-btn" className="auth-overlay-btn" type="button" onClick={() => setSignUpActive(false)}>Sign In</button>
              </div>
              <div className="auth-overlay-panel auth-overlay-right">
                <h2 className="auth-overlay-title">Hello, Friend!</h2>
                <p className="auth-overlay-text">Enter your personal details and start your journey with us.</p>
                <button id="overlay-signup-btn" className="auth-overlay-btn" type="button" onClick={() => setSignUpActive(true)}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="auth-footer">
        © {new Date().getFullYear()} UnstickyNotes. Your personal note-taking workspace.
      </footer>
    </div>
  )
}
