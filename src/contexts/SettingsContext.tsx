import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useTheme } from './ThemeContext';
// import type { Theme } from './ThemeContext'

export type FontSize = 'small' | 'medium' | 'large'
export type FontFamily = 'plus-jakarta' | 'inter' | 'lato' | 'georgia'

const FONT_FAMILY_VALUES: Record<FontFamily, string> = {
  'plus-jakarta': "'Plus Jakarta Sans', system-ui, sans-serif",
  'inter':        "'Inter', system-ui, sans-serif",
  'lato':         "'Lato', system-ui, sans-serif",
  'georgia':      "Georgia, 'Times New Roman', serif",
}

const FONT_SIZE_VALUES: Record<FontSize, string> = {
  small:  '12px',
  medium: '14px',
  large:  '16px',
}

interface SettingsContextValue {
  fontSize:      FontSize
  fontFamily:    FontFamily
  setFontSize:   (size: FontSize) => void
  setFontFamily: (family: FontFamily) => void
}

const SettingsContext = createContext<SettingsContextValue>({
  fontSize:      'medium',
  fontFamily:    'plus-jakarta',
  setFontSize:   () => {},
  setFontFamily: () => {},
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [fontSize, setFontSizeState] = useState<FontSize>(
    () => (localStorage.getItem('un-font-size') as FontSize) || 'medium'
  )
  const [fontFamily, setFontFamilyState] = useState<FontFamily>(
    () => (localStorage.getItem('un-font-family') as FontFamily) || 'plus-jakarta'
  )
  // const [theme, setTheme] = useState<Theme>(
  //   () => (localStorage.getItem('un-theme') as Theme || 'system')
  // )

  // Apply font-size to <html>
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_VALUES[fontSize]
    localStorage.setItem('un-font-size', fontSize)
  }, [fontSize])

  // Apply font-family via CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--font-sans', FONT_FAMILY_VALUES[fontFamily])
    localStorage.setItem('un-font-family', fontFamily)
  }, [fontFamily])

  //Apply theme
  useEffect(() => {
    localStorage.setItem('un-theme', theme)
    setTheme(theme)
  },[theme])

  const setFontSize   = (s: FontSize)   => setFontSizeState(s)
  const setFontFamily = (f: FontFamily) => setFontFamilyState(f)

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize, fontFamily, setFontFamily }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
