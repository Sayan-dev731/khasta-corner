import { useState, useEffect, useCallback } from 'react'
import { getCurrentUser, loginUser as loginApi, logoutUser as logoutApi } from '../api/userApi'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }
      const res = await getCurrentUser()
      setUser(res.data)
    } catch {
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (credentials) => {
    const res = await loginApi(credentials)
    const { accessToken, refreshToken, user: loggedInUser } = res.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(loggedInUser)
    return res
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // Even if API fails, clear local state
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  )
}
