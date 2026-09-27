import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { requestPull, requestPush } from '../syncServices/SyncManager'
import type { User, LoginCredentials, RegisterCredentials } from '../types'
import * as AuthService from '../services/AuthService'
import * as ProfileService from '../services/ProfileService'
import { onOpenUrl } from '@tauri-apps/plugin-deep-link'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  pulled: boolean
  login: (creds: LoginCredentials) => Promise<void>
  register: (creds: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  pulled:false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [pulled, setPulled] = useState<boolean>(false)
  const [token, setToken] = useState<string | null>(() => {
    // extract token from the url
    const params = new URLSearchParams(window.location.search)
    const oauthToken = params.get('token')
    if (oauthToken) {
      localStorage.setItem('un-token', oauthToken)
      // Remove the token from the URL so it doesn't linger in browser history
      window.history.replaceState({}, '', window.location.pathname)
      return oauthToken
    }
    localStorage.setItem('user', JSON.stringify(user));
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
            localStorage.setItem('user_id', userData.id)
            AuthService.register_user_offline(userData)
            requestPull()
              .then((res) => {
                if(res){
                  setPulled(res)
                }
              })
              .catch((err) => console.log(err));
          }
        })
        .catch(() => {
          localStorage.removeItem('un-token')
          setToken(null)
          setUser(null)
        })
        .finally(() => {
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [token, user, pulled])

useEffect(() => {
  if (!user) return;

  let timerId: ReturnType<typeof setTimeout>;
  let isCancelled = false;

  const runPushLoop = async () => {
    try {
      await requestPush();
    } catch (error) {
      console.error("Auto push failed:", error);
    } finally {
      // Schedule the next run 5 seconds after the current one finishes
      if (!isCancelled) {
        timerId = setTimeout(runPushLoop, 50000);
      }
    }
  };

  runPushLoop();

  return () => {
    isCancelled = true;
    clearTimeout(timerId);
  };
}, [user]); // Re-runs ONLY if 'user' state changes

useEffect(() => {
  let unlisten: () => void
    const processUrl = async(url:string) => {
      try{
        const parsedUrl = new URL(url)
        if(parsedUrl.host == 'callback' || parsedUrl.pathname.includes('callback')){
          const token = parsedUrl.searchParams.get('token')
          if(token){
            localStorage.setItem('un-token', token)
            setToken(token)
          }
        }
      }catch(err){
        console.error("Error: " + err)
      }
    }

    const listner = async () => {
      unlisten = await onOpenUrl((urls) => {
        if(urls.length > 0){
          processUrl(urls[0])
        }
      })
    }
    listner()
    return () => {
      if(unlisten) unlisten()
    }
},[setToken])

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
        localStorage.setItem('user_id', userData.id)
        requestPull()
          .then((res) => {
            setPulled(res)
          })
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
    try { 
      await requestPush()
      await AuthService.logout()
     } catch { /* ignore */ }
    localStorage.removeItem('un-token')
    localStorage.removeItem('user_id')
    setToken(null)
    setUser(null)
    setPulled(false)
  }

  const refreshUser = async () => {
    try {
      const res = await ProfileService.getProfile()
      const userData = (res as any)?.data ?? res
      if (userData && (userData.id || userData.email)) {
        setUser(userData)
        localStorage.setItem('user_id', userData.id)
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, pulled, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
