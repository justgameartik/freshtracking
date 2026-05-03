import React, { useEffect, useState, useCallback } from 'react'
import { useStore } from '../store'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'
import AddProductModal from '../components/AddProductModal'
import BottomNav from '../components/BottomNav'
import { CATEGORY_LABELS } from '../utils/categories'

const TABS = ['all', 'food', 'medicine', 'chemistry']

export default function HomePage() {
  const { user, products, stats, activeCategory, setProducts, setStats, setActiveCategory } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [prods, st] = await Promise.all([
        api.products.list(activeCategory),
        api.stats(),
      ])
      setProducts(prods || [])
      setStats(st)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, setProducts, setStats])

  useEffect(() => { load() }, [load])

  const expired = products.filter(p => p.status === 'expired')
  const soon = products.filter(p => p.status === 'soon')
  const ok = products.filter(p => p.status === 'ok')

  const hasNotifs = stats.expired > 0 || stats.soon > 0

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-top">
          <div className="app-title">Мой холодильник</div>
          <button className="header-bell" aria-label="Уведомления">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {hasNotifs && <span className="dot" />}
          </button>
        </div>
        <div className="stats-row">
          <div className="stat-card expired">
            <div className="num">{stats.expired}</div>
            <div className="label">истекло</div>
          </div>
          <div className="stat-card soon">
            <div className="num">{stats.soon}</div>
            <div className="label">скоро</div>
          </div>
          <div className="stat-card">
            <div className="num">{stats.ok}</div>
            <div className="label">в порядке</div>
          </div>
        </div>
      </header>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab ${activeCategory === tab ? 'active' : ''}`}
            onClick={() => setActiveCategory(tab)}
          >
            {CATEGORY_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="products-scroll">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🧊</div>
            <h3>Пусто!</h3>
            <p>Добавьте первый продукт,<br/>чтобы начать отслеживание</p>
          </div>
        ) : (
          <>
            {expired.length > 0 && (
              <>
                <div className="section-label red">Просрочено</div>
                {expired.map(p => <ProductCard key={p.id} product={p} />)}
              </>
            )}
            {soon.length > 0 && (
              <>
                <div className="section-label amber">Скоро истекает</div>
                {soon.map(p => <ProductCard key={p.id} product={p} />)}
              </>
            )}
            {ok.length > 0 && (
              <>
                <div className="section-label">В порядке</div>
                {ok.map(p => <ProductCard key={p.id} product={p} />)}
              </>
            )}
          </>
        )}
      </div>

      <button className="fab" onClick={() => setShowModal(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Добавить продукт
      </button>

      <BottomNav />

      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
