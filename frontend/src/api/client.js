const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const token = localStorage.getItem('ft_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  auth: {
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  },
  products: {
    list: (category) => request(`/api/products${category && category !== 'all' ? `?category=${category}` : ''}`),
    create: (body) => request('/api/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
    get: (id) => request(`/api/products/${id}`),
  },
  stats: () => request('/api/stats'),
}
