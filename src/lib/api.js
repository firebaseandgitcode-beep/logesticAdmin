const BASE = import.meta.env.VITE_API_URL ||
  'https://us-central1-mylogestic1.cloudfunctions.net/api'

async function request(path, options = {}) {
  const token = sessionStorage.getItem('admin_token')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data })
  return data
}

export const adminApi = {
  login:          (body)   => request('/admin/login', { method: 'POST', body: JSON.stringify(body) }),
  me:             ()       => request('/admin/me'),

  getUsers:       (status) => request(`/admin/users${status ? `?status=${status}` : ''}`),
  approveUser:    (id)     => request(`/admin/users/${id}/approve`,    { method: 'PUT' }),
  suspendUser:    (id)     => request(`/admin/users/${id}/suspend`,    { method: 'PUT' }),
  rejectUser:     (id)     => request(`/admin/users/${id}/reject`,     { method: 'PUT' }),
  reactivateUser: (id)     => request(`/admin/users/${id}/reactivate`, { method: 'PUT' }),

  getAdmins:      ()       => request('/admin/admins'),
  createAdmin:    (body)   => request('/admin/admins', { method: 'POST', body: JSON.stringify(body) }),
  updateAdmin:    (id, b)  => request(`/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
}
