import { create } from 'zustand'

export const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('ft_user') || 'null'),
  token: localStorage.getItem('ft_token') || null,
  products: [],
  stats: { expired: 0, soon: 0, ok: 0 },
  activeCategory: 'all',
  loading: false,

  setAuth: (user, token) => {
    localStorage.setItem('ft_user', JSON.stringify(user))
    localStorage.setItem('ft_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('ft_user')
    localStorage.removeItem('ft_token')
    set({ user: null, token: null, products: [], stats: { expired: 0, soon: 0, ok: 0 } })
  },

  setProducts: (products) => set({ products }),
  setStats: (stats) => set({ stats }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setLoading: (loading) => set({ loading }),
}))
