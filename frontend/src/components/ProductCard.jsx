import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoryIcon } from '../utils/categories'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { id, name, category, location, days_left, status, remind_days_before } = product

  const badgeText = days_left < 0
    ? `${days_left} дн.`
    : `${days_left} дн.`

  return (
    <div className="product-card" onClick={() => navigate(`/product/${id}`)}>
      <div className={`product-icon ${category}`}>
        {getCategoryIcon(category)}
      </div>
      <div className="product-info">
        <div className="product-name">{name}</div>
        <div className="product-meta">{location} · {category === 'food' ? 'Еда' : category === 'medicine' ? 'Лекарства' : category === 'chemistry' ? 'Химия' : 'Другое'}</div>
      </div>
      <span className={`badge ${status}`}>{badgeText}</span>
    </div>
  )
}
