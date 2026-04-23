import { useState, useEffect, useCallback } from 'react'
import {
  LogOut, Truck, Users as UsersIcon, CheckCircle, XCircle, Clock,
  RefreshCw, Shield, UserPlus, AlertCircle,
} from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi } from '../lib/api'

const STATUS_STYLES = {
  active:    'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  rejected:  'bg-gray-100 text-gray-500',
}
const STATUS_ICONS = {
  active:    CheckCircle,
  pending:   Clock,
  suspended: XCircle,
  rejected:  XCircle,
}

function UserRow({ user, onAction }) {
  const StatusIcon = STATUS_ICONS[user.status] || Clock
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-semibold">
            {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
          <p className="text-xs text-gray-500">{user.company} · {user.phone}</p>
          {user.approvedByName && (
            <p className="text-xs text-green-500 mt-0.5">
              Approved by {user.approvedByName} · {user.approvedAt?.slice(0, 10)}
            </p>
          )}
          {user.suspendedByName && (
            <p className="text-xs text-red-400 mt-0.5">
              Suspended · {user.suspendedAt?.slice(0, 10)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4 shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[user.status]}`}>
          <StatusIcon size={11} />
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
        <span className="text-xs text-gray-500 hidden sm:block">{user.createdAt?.slice(0, 10)}</span>

        <div className="flex items-center gap-1">
          {user.status === 'pending' && (
            <>
              <button onClick={() => onAction(user.id, 'approve')}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                Approve
              </button>
              <button onClick={() => onAction(user.id, 'reject')}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors">
                Reject
              </button>
            </>
          )}
          {user.status === 'active' && (
            <button onClick={() => onAction(user.id, 'suspend')}
              className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg font-medium transition-colors">
              Suspend
            </button>
          )}
          {(user.status === 'suspended' || user.status === 'rejected') && (
            <button onClick={() => onAction(user.id, 'reactivate')}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors">
              Reactivate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Users() {
  const { currentAdmin, logout } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const load = useCallback(async () => {
    setLoadingUsers(true)
    setError('')
    try {
      const data = await adminApi.getUsers()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async (userId, action) => {
    setActionLoading(userId + action)
    try {
      if (action === 'approve')    await adminApi.approveUser(userId)
      if (action === 'suspend')    await adminApi.suspendUser(userId)
      if (action === 'reject')     await adminApi.rejectUser(userId)
      if (action === 'reactivate') await adminApi.reactivateUser(userId)
      await load()
    } catch (err) {
      setError(err.message || `Failed to ${action} user`)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(u => {
    if (filter !== 'all' && u.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.company?.toLowerCase().includes(q)
    }
    return true
  })

  const counts = {
    all:       users.length,
    active:    users.filter(u => u.status === 'active').length,
    pending:   users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    rejected:  users.filter(u => u.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">mylogestic</p>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-medium text-white">{currentAdmin?.displayName}</p>
              {currentAdmin?.isSuperAdmin && (
                <p className="text-xs text-blue-400 flex items-center gap-1 justify-end">
                  <Shield size={10} /> Superadmin
                </p>
              )}
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Registered Users</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage business accounts and access</p>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
            <RefreshCw size={14} className={loadingUsers ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',     value: counts.all,       color: 'text-white' },
            { label: 'Active',    value: counts.active,    color: 'text-green-400' },
            { label: 'Pending',   value: counts.pending,   color: 'text-amber-400' },
            { label: 'Suspended', value: counts.suspended, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Filters + Search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-0.5 gap-0.5 flex-wrap">
            {['all', 'active', 'pending', 'suspended', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}>
                {f} ({counts[f] ?? users.filter(u => u.status === f).length})
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 bg-gray-900 border border-gray-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Users list */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-6">
          {loadingUsers ? (
            <div className="py-16 text-center">
              <RefreshCw size={24} className="text-gray-600 mx-auto mb-3 animate-spin" />
              <p className="text-gray-500 text-sm">Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <UsersIcon size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No users found</p>
              {counts.all === 0 && (
                <p className="text-gray-600 text-xs mt-1">
                  Users appear here after they register on the main website
                </p>
              )}
            </div>
          ) : (
            filtered.map(user => (
              <UserRow key={user.id} user={user}
                onAction={actionLoading ? () => {} : handleAction} />
            ))
          )}
        </div>

        {counts.pending > 0 && (
          <div className="mt-4 bg-amber-950 border border-amber-900 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-400 shrink-0" />
              <p className="text-sm text-amber-300">
                <span className="font-bold">{counts.pending}</span> user{counts.pending > 1 ? 's' : ''} waiting for approval
              </p>
            </div>
          </div>
        )}

        {/* Admin account management */}
        {currentAdmin?.isSuperAdmin && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-blue-400" />
              <h2 className="text-sm font-bold text-white">Admin Accounts</h2>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-500">
                To create additional admin accounts, use the API endpoint{' '}
                <code className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-xs">
                  POST /admin/admins
                </code>{' '}
                with a valid superadmin JWT.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
