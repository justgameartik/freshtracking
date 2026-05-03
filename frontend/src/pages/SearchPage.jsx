import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'
import BottomNav from '../components/BottomNav'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.products.list()
      .then(p => setAll(p || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = query
    ? all.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.location.toLowerCase().includes(query.toLowerCase()))
    : all

  return (
    <div className="app-shell">
      <div className="search-header">
        <div style={{ paddingTop: 16, paddingBottom: 8 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            Поиск
          </div>
          <div className="search-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              placeholder="Молоко, шкаф..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="products-scroll" style={{ paddingTop: 8 }}>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🔍</div>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте другой запрос</p>
          </div>
        ) : (
          <>
            <div className="section-label">{filtered.length} {filtered.length === 1 ? 'продукт' : 'продуктов'}</div>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
