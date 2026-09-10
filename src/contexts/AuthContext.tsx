import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { User, LoginCredentials, RegisterCredentials } from '../types'
import * as AuthService from '../services/AuthService'
import * as ProfileService from '../services/ProfileService'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (creds: LoginCredentials) => Promise<void>
  register: (creds: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // On first load also check for ?token= in the URL — this is how the backend
  // returns the token after a successful Google OAuth redirect.
  const [token, setToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthToken = params.get('token')
    if (oauthToken) {
      localStorage.setItem('un-token', oauthToken)
      // Remove the token from the URL so it doesn't linger in browser history
      window.history.replaceState({}, '', window.location.pathname)
      return oauthToken
    }
    return localStorage.getItem('un-token')
  })

  const [isLoading, setIsLoading] = useState(true)

  // On mount, if token exists try to load profile
  useEffect(() => {
    if (token && !user) {
      ProfileService.getProfile()
        .then(res => {
          const userData = (res as any)?.data ?? res
          if (userData && (userData.id || userData.email)) {
            setUser(userData)
          }
        })
        .catch(() => {
          localStorage.removeItem('un-token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token, user])

  const login = async (creds: LoginCredentials) => {
    const res = await AuthService.login(creds)
    const tok = res.data?.token ?? (res as any)?.token
    if (!tok) {
      throw new Error(res.message || 'Login failed: no token received')
    }
    localStorage.setItem('un-token', tok)
    setToken(tok)

    try {
      const profileRes = await ProfileService.getProfile()
      const userData = (profileRes as any)?.data ?? profileRes
      if (userData && (userData.id || userData.email)) {
        setUser(userData)
      }
    } catch {
      // Profile can be fetched by useEffect if needed
    }
  }

  const register = async (creds: RegisterCredentials) => {
    await AuthService.register(creds)
    await login({ email: creds.email, password: creds.password })
  }

  const logout = async () => {
    try { await AuthService.logout() } catch { /* ignore */ }
    localStorage.removeItem('un-token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await ProfileService.getProfile()
      const userData = (res as any)?.data ?? res
      if (userData && (userData.id || userData.email)) {
        setUser(userData)
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
