import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { UserResponse } from '@/lib/api'
import {
  apiGetMe,
  apiLogin as apiLoginFn,
} from '@/lib/api'

const TOKEN_KEY = 'loofcloud-token'

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

const LOGOUT_TRANSITION_MS = 320

interface AuthContextValue {
  token: string | null
  user: UserResponse | null
  loading: boolean
  isLoggingOut: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  loading: true,
  isLoggingOut: false,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setLoggingOut] = useState(false)

  const refreshUser = useCallback(async () => {
    const t = getStoredToken()
    if (!t) {
      setUser(null)
      return
    }
    try {
      const u = await apiGetMe(t)
      setUser(u)
    } catch {
      setStoredToken(null)
      setToken(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const t = getStoredToken()
    setToken(t)
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }
    apiGetMe(t)
      .then(setUser)
      .catch(() => {
        setStoredToken(null)
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      const { access_token } = await apiLoginFn(username, password)
      setStoredToken(access_token)
      setToken(access_token)
      await refreshUser()
    },
    [refreshUser]
  )

  const logout = useCallback(() => {
    setLoggingOut(true)
    const t = setTimeout(() => {
      setStoredToken(null)
      setToken(null)
      setUser(null)
      setLoggingOut(false)
    }, LOGOUT_TRANSITION_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isLoggingOut,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
