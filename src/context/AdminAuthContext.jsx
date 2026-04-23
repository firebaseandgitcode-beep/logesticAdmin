import { createContext, useContext, useState } from 'react'
import { adminApi } from '../lib/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem('admin_portal_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    try {
      const data = await adminApi.login({ username, password })
      sessionStorage.setItem('admin_token', data.token)
      sessionStorage.setItem('admin_portal_user', JSON.stringify(data.admin))
      setCurrentAdmin(data.admin)
      return { success: true }
    } catch (err) {
      return { error: err.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_portal_user')
    setCurrentAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ currentAdmin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
