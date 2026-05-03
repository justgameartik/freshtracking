import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import { format } from 'date-fns'

const REMIND_OPTIONS = [1, 3, 7, 14, 30]

function formatDateForInput(date) {
  return format(date, 'yyyy-MM-dd')
}

export default function AddProductModal({ onClose, onSaved, product }) {
  const isEdit = !!product
  const defaultExpiry = new Date()
  defaultExpiry.setDate(defaultExpiry.getDate() + 7)

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'food',
    location: product?.location || 'Холодильник',
    expires_at: product?.expires_at
      ? formatDateForInput(new Date(product.expires_at))
      : formatDateForInput(defaultExpiry),
    remind_days_before: product?.remind_days_before || 3,
    notes: product?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!form.name.trim()) { setError('Введите название'); return }
    if (!form.expires_at) { setError('Укажите срок годности'); return }
    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        expires_at: new Date(form.expires_at + 'T12:00:00').toISOString(),
        remind_days_before: Number(form.remind_days_before),
      }
      if (isEdit) {
        await api.products.update(product.id, payload)
      } else {
        await api.products.create(payload)
      }
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-drawer">
        <div className="drawer-handle" />
        <div className="drawer-header">
          <button className="btn-back" onClick={onClose}>← Отмена</button>
          <div className="drawer-title">{isEdit ? 'Редактировать' : 'Новый продукт'}</div>
          <button className="btn-save" onClick={handleSave} disabled={loading}>
            {loading ? '...' : 'Сохранить'}
          </button>
        </div>
        <div className="form-body">
          <button className="scan-btn" type="button">
            📷 Скан штрихкода / фото
          </button>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Название</label>
            <input
              className="form-input"
              placeholder="Молоко 3,2%"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="food">🥗 Еда</option>
                <option value="medicine">💊 Лекарства</option>
                <option value="chemistry">🧴 Химия</option>
                <option value="other">📦 Другое</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Место хранения</label>
              <select className="form-select" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
                <option>Холодильник</option>
                <option>Морозилка</option>
                <option>Шкаф</option>
                <option>Аптечка</option>
                <option>Кладовая</option>
                <option>Другое</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Срок годности</label>
            <input
              className="form-input"
              type="date"
              value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Напомнить за (дней до истечения)</label>
            <div className="remind-options">
              {REMIND_OPTIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  className={`remind-chip ${form.remind_days_before === d ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, remind_days_before: d }))}
                >
                  {d} {d === 1 ? 'день' : d < 5 ? 'дня' : 'дней'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Заметки</label>
            <input
              className="form-input"
              placeholder="Необязательно"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
