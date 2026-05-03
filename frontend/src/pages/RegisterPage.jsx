import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useStore } from '../store'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useStore(s => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    if (form.password.length < 6) { setError('Минимум 6 символов'); return }
    setLoading(true); setError('')
    try {
      const data = await api.auth.register(form)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">🧊 FreshTrack</div>
      <div className="auth-subtitle">Контролируй сроки годности</div>
      <div className="auth-card">
        <h2>Регистрация</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Имя</label>
            <input className="form-input" placeholder="Иван Иванов" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input className="form-input" type="password" placeholder="Минимум 6 символов" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button className="auth-btn" disabled={loading}>{loading ? 'Создаём...' : 'Зарегистрироваться'}</button>
        </form>
        <div className="auth-link">
          Уже есть аккаунт? <a onClick={() => navigate('/login')}>Войти</a>
        </div>
      </div>
    </div>
  )
}
