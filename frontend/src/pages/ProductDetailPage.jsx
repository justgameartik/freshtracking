import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { getCategoryIcon, CATEGORY_LABELS } from '../utils/categories'
import AddProductModal from '../components/AddProductModal'
import BottomNav from '../components/BottomNav'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    api.products.get(id)
      .then(setProduct)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm('Удалить продукт?')) return
    await api.products.delete(id)
    navigate('/')
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>
  if (!product) return null

  const expires = new Date(product.expires_at)
  const expiresStr = format(expires, 'd MMMM yyyy', { locale: ru })

  const statusColors = { expired: 'var(--red)', soon: 'var(--amber)', ok: 'var(--green)' }
  const statusLabels = { expired: 'Просрочено', soon: 'Скоро истекает', ok: 'В порядке' }

  return (
    <div className="app-shell">
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Назад
        </button>
      </div>

      <div className="detail-page">
        <div className="detail-hero">
          <div className="detail-icon-big">{getCategoryIcon(product.category)}</div>
          <div>
            <div className="detail-name">{product.name}</div>
            <div className="detail-sub">{product.location} · {CATEGORY_LABELS[product.category]}</div>
            <div style={{ marginTop: 10 }}>
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                color: statusColors[product.status],
                padding: '5px 12px',
                borderRadius: 50, fontSize: 12, fontWeight: 700
              }}>
                {statusLabels[product.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-row">
            <span className="info-key">Срок годности</span>
            <span className="info-val">{expiresStr}</span>
          </div>
          <div className="info-row">
            <span className="info-key">Осталось дней</span>
            <span className="info-val" style={{ color: statusColors[product.status] }}>
              {product.days_left < 0 ? `${Math.abs(product.days_left)} дн. назад` : `${product.days_left} дн.`}
            </span>
          </div>
          <div className="info-row">
            <span className="info-key">Напоминание</span>
            <span className="info-val">За {product.remind_days_before} дн.</span>
          </div>
          {product.notes && (
            <div className="info-row">
              <span className="info-key">Заметки</span>
              <span className="info-val">{product.notes}</span>
            </div>
          )}
        </div>

        <button className="btn-edit" onClick={() => setShowEdit(true)}>✏️ Редактировать</button>
        <button className="btn-delete" onClick={handleDelete}>🗑 Удалить</button>
      </div>

      <BottomNav />

      {showEdit && (
        <AddProductModal
          product={product}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false)
            api.products.get(id).then(setProduct)
          }}
        />
      )}
    </div>
  )
}
