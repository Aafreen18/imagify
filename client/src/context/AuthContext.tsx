import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { api } from '../api'

type AuthContextValue = {
  user: User | null
  setUser: (user: User | null) => void
  theme: string
  toggleTheme: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('imagify-user') || 'null') }
    catch { return null }
  })
  const [theme, setTheme] = useState(() => localStorage.getItem('imagify-theme') || 'light')

  const setUser = (next: User | null) => {
    setUserState(next)
    if (next) localStorage.setItem('imagify-user', JSON.stringify(next))
    else localStorage.removeItem('imagify-user')
  }
  const toggleTheme = () => setTheme((current) => {
    const next = current === 'light' ? 'dark' : 'light'
    localStorage.setItem('imagify-theme', next)
    return next
  })
  const logout = () => {
    localStorage.removeItem('imagify-token')
    setUser(null)
  }

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])

  useEffect(() => {
    if (!localStorage.getItem('imagify-token')) return
    api.get('/auth/me').then((response) => setUser(response.data.user)).catch(() => {})
  }, [])

  return <AuthContext.Provider value={{ user, setUser, theme, toggleTheme, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
