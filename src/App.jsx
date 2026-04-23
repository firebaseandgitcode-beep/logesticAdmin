import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import AdminLogin from './pages/AdminLogin'
import Users from './pages/Users'

function AppRoutes() {
  const { currentAdmin } = useAdminAuth()
  return (
    <Routes>
      <Route
        path="/"
        element={currentAdmin ? <Navigate to="/users" replace /> : <AdminLogin />}
      />
      <Route
        path="/users"
        element={currentAdmin ? <Users /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
