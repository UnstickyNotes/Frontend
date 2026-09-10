import { useState } from 'react'

// ── Eye Icons ─────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string
  /** Extra wrapper class (e.g. to match a grid row). */
  wrapperClassName?: string
  /** Whether to prevent copying or cutting the password value */
  preventCopy?: boolean
  /** Whether to prevent browser password manager / autofill popup */
  preventAutofill?: boolean
}

/**
 * A styled password input with an inline show/hide toggle button.
 * Uses the same `.auth-input` class as every other input in the app.
 */
export default function PasswordInput({
  id,
  className = 'auth-input',
  wrapperClassName,
  style,
  preventCopy = false,
  preventAutofill = false,
  onCopy,
  onCut,
  onContextMenu,
  onDragStart,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  const isWebkitSecuritySupported =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('-webkit-text-security', 'disc')

  // When preventAutofill is true, use type="text" with -webkit-text-security: disc
  // on Chromium/WebKit to bypass browser password manager autofill heuristics.
  const inputType =
    preventAutofill && isWebkitSecuritySupported
      ? 'text'
      : visible
        ? 'text'
        : 'password'

  const textSecurityStyle: React.CSSProperties =
    preventAutofill && isWebkitSecuritySupported
      ? ({ WebkitTextSecurity: visible ? 'none' : 'disc' } as React.CSSProperties)
      : {}

  return (
    <div className={`pwd-input-wrapper${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <input
        id={id}
        type={inputType}
        className={`${className}${preventAutofill ? (visible ? ' no-autofill-password--visible' : ' no-autofill-password') : ''}`}
        style={{
          paddingRight: '2.75rem',
          ...(preventCopy ? { userSelect: 'none', WebkitUserSelect: 'none' } : {}),
          ...textSecurityStyle,
          ...style,
        }}
        onCopy={preventCopy ? e => { e.preventDefault(); onCopy?.(e) } : onCopy}
        onCut={preventCopy ? e => { e.preventDefault(); onCut?.(e) } : onCut}
        onContextMenu={preventCopy ? e => { e.preventDefault(); onContextMenu?.(e) } : onContextMenu}
        onDragStart={preventCopy ? e => { e.preventDefault(); onDragStart?.(e) } : onDragStart}
        {...props}
      />
      <button
        type="button"
        className="pwd-toggle-btn"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-controls={id}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}
