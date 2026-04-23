import { useState, useEffect } from 'react'
import { LogOut, Truck, Users as UsersIcon, CheckCircle, XCircle, Clock, UserPlus, RefreshCw, Shield } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
}

const STATUS_ICONS = {
  active: CheckCircle,
  pending: Clock,
  suspended: XCircle,
}

function UserRow({ user, onApprove, onSuspend, onReactivate }) {
  const StatusIcon = STATUS_ICONS[user.status] || Clock
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-white text-sm font-semibold">
              {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            {user.role === 'superadmin' && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-medium">
                <Shield size={10} /> Superadmin
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
          <p className="text-xs text-gray-500">{user.company} · {user.phone}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4 shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[user.status]}`}>
          <StatusIcon size={11} />
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
        <span className="text-xs text-gray-500">{user.createdAt}</span>

        <div className="flex items-center gap-1">
          {user.status === 'pending' && (
            <button
              onClick={() => onApprove(user.id)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Approve
            </button>
          )}
          {user.status === 'active' && user.role !== 'platform_admin' && (
            <button
              onClick={() => onSuspend(user.id)}
              className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Suspend
            </button>
          )}
          {user.status === 'suspended' && (
            <button
              onClick={() => onReactivate(user.id)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Users() {
  const { currentAdmin, logout, getRegisteredUsers, approveUser, suspendUser, reactivateUser } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = () => setUsers(getRegisteredUsers())

  useEffect(() => { load() }, [])

  const filtered = users.filter(u => {
    if (filter !== 'all' && u.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.company?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = {
    all: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  }

  const handleApprove = (id) => {
    const updated = approveUser(id)
    setUsers(updated)
  }
  const handleSuspend = (id) => {
    const updated = suspendUser(id)
    setUsers(updated)
  }
  const handleReactivate = (id) => {
    const updated = reactivateUser(id)
    setUsers(updated)
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
              <p className="text-xs font-medium text-white">{currentAdmin?.name}</p>
              <p className="text-xs text-gray-500">Platform Admin</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Registered Users</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage business accounts and superadmin access
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: counts.all, color: 'text-white' },
            { label: 'Active', value: counts.active, color: 'text-green-400' },
            { label: 'Pending', value: counts.pending, color: 'text-amber-400' },
            { label: 'Suspended', value: counts.suspended, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-0.5 gap-0.5">
            {['all', 'active', 'pending', 'suspended'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f} ({counts[f]})
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name, email or company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Users list */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-6">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <UsersIcon size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No users found</p>
              {counts.pending === 0 && counts.all === 0 && (
                <p className="text-gray-600 text-xs mt-1">
                  Users will appear here after they register on the main website
                </p>
              )}
            </div>
          ) : (
            filtered.map(user => (
              <UserRow
                key={user.id}
                user={user}
                onApprove={handleApprove}
                onSuspend={handleSuspend}
                onReactivate={handleReactivate}
              />
            ))
          )}
        </div>

        {counts.all === 0 && (
          <div className="mt-6 bg-blue-950 border border-blue-900 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <UserPlus size={18} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-300">No registrations yet</p>
                <p className="text-xs text-blue-400 mt-1">
                  When users sign up on the main website (mylogestic), they&apos;ll appear here for approval.
                  This admin portal and the main website share the same browser storage — open both on the same browser for the data to sync.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
