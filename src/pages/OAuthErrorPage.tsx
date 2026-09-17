import { useNavigate, useSearchParams } from 'react-router'
import { useTheme } from '../contexts/ThemeContext'

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

function WarningIcon() {
  return (
    <svg
      className="oauth-error-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

// Human-readable labels for common OAuth error codes
const ERROR_LABELS: Record<string, string> = {
  access_denied:            'You cancelled the sign-in with Google.',
  interaction_required:     'Google requires additional action to complete sign-in.',
  temporarily_unavailable:  'Google sign-in is temporarily unavailable. Please try again shortly.',
  server_error:             'Something went wrong on the server during sign-in.',
}

export default function OAuthErrorPage() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const errorCode = params.get('error') ?? ''
  const errorMessage =
    ERROR_LABELS[errorCode] ??
    (errorCode ? `Sign-in failed: ${errorCode.replace(/_/g, ' ')}.` : 'Google sign-in could not be completed.')

  return (
    <div className={`auth-page${theme === 'dark' ? ' dark-auth' : ''}`}>
      <header className="auth-topbar">
        <button
          id="oauth-error-theme-toggle"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          type="button"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </header>

      <main className="auth-main">
        {/* Ambient blobs — same as AuthPage */}
        <div className="auth-bg-blob" style={{
          top: '-6rem', left: '-6rem', width: '24rem', height: '24rem',
          backgroundColor: theme === 'dark' ? 'rgba(18,84,79,0.12)' : 'rgba(139,154,110,0.08)',
        }} />
        <div className="auth-bg-blob" style={{
          bottom: '-6rem', right: '-6rem', width: '24rem', height: '24rem',
          backgroundColor: theme === 'dark' ? 'rgba(42,131,95,0.08)' : 'rgba(139,154,110,0.06)',
        }} />

        <div className="oauth-error-card" role="alert" aria-live="assertive">
          <WarningIcon />
          <h1 className="oauth-error-title">Sign-in failed</h1>
          <p className="oauth-error-message">{errorMessage}</p>
          <div className="oauth-error-actions">
            <button
              id="oauth-error-retry-btn"
              className="auth-submit-btn oauth-error-retry-btn"
              type="button"
              onClick={() => navigate('/login', { replace: true })}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </main>

      <footer className="auth-footer">
        © {new Date().getFullYear()} UnstickyNotes. Your personal note-taking workspace.
      </footer>
    </div>
  )
}
