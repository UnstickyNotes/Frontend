import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useSettings, type FontSize, type FontFamily } from '../contexts/SettingsContext'
import * as CollectionService from '../services/CollectionService'
import type { Collection } from '../types'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { fontSize, setFontSize, fontFamily, setFontFamily } = useSettings()

  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    CollectionService.getCollections()
      .then(res => setCollections((res as { data?: Collection[] }).data ?? []))
      .catch(console.error)
  }, [])

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User'

  const topbarLeft = (
    <>
      <span className="breadcrumb-item" onClick={() => navigate('/all')}>Account</span>
      <span className="breadcrumb-separator">›</span>
      <span className="breadcrumb-current">Settings</span>
    </>
  )

  return (
    <AppLayout collections={collections} userName={fullName} topbarLeft={topbarLeft}>
      <div className="main-scroll settings-main-scroll">
        <div className="settings-container">
          <h1 className="settings-page-title">Settings</h1>

          <div className="settings-section-label">Appearance</div>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-label">Theme</div>
              <div className="settings-option-group">
                <button
                  className={`settings-option-btn${theme === 'light' ? ' active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  Light
                </button>
                <button
                  className={`settings-option-btn${theme === 'dark' ? ' active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </button>
                <button
                  className={`settings-option-btn${theme === 'system' ? ' active' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  System
                </button>
              </div>
            </div>
          </div>

          <div className="settings-section-label">Typography</div>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-label">Font Family</div>
              <div className="settings-option-group">
                {(['plus-jakarta', 'inter', 'lato', 'georgia'] as FontFamily[]).map(ff => (
                  <button
                    key={ff}
                    className={`settings-option-btn${fontFamily === ff ? ' active' : ''}`}
                    onClick={() => setFontFamily(ff)}
                  >
                    {ff === 'plus-jakarta' ? 'Jakarta' :
                     ff === 'inter' ? 'Inter' :
                     ff === 'lato' ? 'Lato' : 'Serif'}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-row-label">Font Size</div>
              <div className="settings-option-group">
                {(['small', 'medium', 'large'] as FontSize[]).map(fs => (
                  <button
                    key={fs}
                    className={`settings-option-btn${fontSize === fs ? ' active' : ''}`}
                    onClick={() => setFontSize(fs)}
                  >
                    {fs.charAt(0).toUpperCase() + fs.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
