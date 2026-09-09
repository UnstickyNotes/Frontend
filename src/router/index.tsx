import { createBrowserRouter, Navigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import AuthPage from '../pages/AuthPage'
import CollectionsPage from '../pages/CollectionsPage'
import NoteDetailPage from '../pages/NoteDetailPage'
import NoteCreatePage from '../pages/NoteCreatePage'
import NoteEditPage from '../pages/NoteEditPage'
import ProfilePage from '../pages/ProfilePage'
import type { ReactNode } from 'react'

// ── Route Guards ──────────────────────────────────────────────

function RequireAuth({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth()
  if (isLoading) return <div className="loading-screen">Loading…</div>
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireGuest({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth()
  if (isLoading) return <div className="loading-screen">Loading…</div>
  if (token) return <Navigate to="/" replace />
  return <>{children}</>
}

// ── Router ────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    path: '/login',
    element: <RequireGuest><AuthPage /></RequireGuest>,
  },
  {
    path: '/',
    element: <RequireAuth><CollectionsPage /></RequireAuth>,
  },
  {
    path: '/profile',
    element: <RequireAuth><ProfilePage /></RequireAuth>,
  },
  {
    path: '/:collectionId',
    element: <RequireAuth><CollectionsPage /></RequireAuth>,
  },
  {
    path: '/:collectionId/new',
    element: <RequireAuth><NoteCreatePage /></RequireAuth>,
  },
  {
    path: '/:collectionId/:noteId',
    element: <RequireAuth><NoteDetailPage /></RequireAuth>,
  },
  {
    path: '/:collectionId/:noteId/edit',
    element: <RequireAuth><NoteEditPage /></RequireAuth>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
