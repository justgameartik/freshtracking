import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import BottomNav from '../components/BottomNav'

export default function ProfilePage() {
  const { user, logout } = useStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="app-shell">
      <div className="profile-page">
        <div style={{ paddingTop: 8, paddingBottom: 32, textAlign: 'center' }}>
          <div className="profile-avatar">{initials}</div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="profile-section-title">Настройки</div>
          <div className="profile-card">
            <div className="profile-row">
              <span className="profile-row-icon">🔔</span>
              <span className="profile-row-text">Уведомления</span>
              <span className="profile-row-arrow">›</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-icon">🌍</span>
              <span className="profile-row-text">Язык</span>
              <span className="profile-row-arrow">Русский ›</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-icon">🎨</span>
              <span className="profile-row-text">Тема</span>
              <span className="profile-row-arrow">Светлая ›</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="profile-section-title">О приложении</div>
          <div className="profile-card">
            <div className="profile-row">
              <span className="profile-row-icon">ℹ️</span>
              <span className="profile-row-text">FreshTrack v1.0.0</span>
            </div>
          </div>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
