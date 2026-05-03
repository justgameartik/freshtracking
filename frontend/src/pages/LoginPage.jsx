import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useStore } from '../store'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useStore(s => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await api.auth.login(form)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setForm({ email: 'demo@freshtrack.app', password: 'demo1234' })
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">🧊 FreshTrack</div>
      <div className="auth-subtitle">Контролируй сроки годности</div>
      <div className="auth-card">
        <h2>Вход</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button className="auth-btn" disabled={loading}>{loading ? 'Входим...' : 'Войти'}</button>
        </form>
        <div className="auth-demo">
          💡 Демо: <strong>demo@freshtrack.app</strong> / <strong>demo1234</strong>
          {' '}<span style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 700 }} onClick={fillDemo}>↑ Заполнить</span>
        </div>
        <div className="auth-link">
          Нет аккаунта? <a onClick={() => navigate('/register')}>Зарегистрироваться</a>
        </div>
      </div>
    </div>
  )
}
