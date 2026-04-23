import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext(null)

// The platform owner credentials (Sujay - the one who manages all registered businesses)
const PLATFORM_ADMIN = {
  id: 'PLATFORM_ADMIN',
  name: 'Sujay G P',
  email: 'sujaygp001@gmail.com',
  password: 'Admin@1234',
}

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem('admin_portal_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  useEffect(() => {
    if (currentAdmin) {
      sessionStorage.setItem('admin_portal_user', JSON.stringify(currentAdmin))
    } else {
      sessionStorage.removeItem('admin_portal_user')
    }
  }, [currentAdmin])

  const login = (email, password) => {
    if (
      email === PLATFORM_ADMIN.email &&
      password === PLATFORM_ADMIN.password
    ) {
      setCurrentAdmin(PLATFORM_ADMIN)
      return { success: true }
    }
    return { error: 'Invalid credentials' }
  }

  const logout = () => setCurrentAdmin(null)

  // Read registered users from the main website's localStorage
  const getRegisteredUsers = () => {
    try {
      const saved = localStorage.getItem('logestic_users')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  }

  // Update a user's status and/or role in the main website's localStorage
  const updateUser = (userId, updates) => {
    const users = getRegisteredUsers()
    const updated = users.map(u => u.id === userId ? { ...u, ...updates } : u)
    localStorage.setItem('logestic_users', JSON.stringify(updated))
    return updated
  }

  // Approve a pending user and grant them superadmin access
  const approveUser = (userId) => {
    return updateUser(userId, { role: 'superadmin', status: 'active' })
  }

  // Suspend a user
  const suspendUser = (userId) => {
    return updateUser(userId, { status: 'suspended' })
  }

  // Reactivate a suspended user
  const reactivateUser = (userId) => {
    return updateUser(userId, { status: 'active' })
  }

  return (
    <AdminAuthContext.Provider value={{
      currentAdmin,
      login,
      logout,
      getRegisteredUsers,
      approveUser,
      suspendUser,
      reactivateUser,
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
