export const CATEGORY_LABELS = {
  food: 'Еда',
  medicine: 'Лекарства',
  chemistry: 'Химия',
  other: 'Другое',
  all: 'Все',
}

export const CATEGORY_ICONS = {
  food: '🥗',
  medicine: '💊',
  chemistry: '🧴',
  other: '📦',
}

export function getCategoryIcon(cat) {
  return CATEGORY_ICONS[cat] || '📦'
}

export function getDaysLabel(days) {
  if (days < 0) return `${Math.abs(days)} дн. назад`
  if (days === 0) return 'Сегодня'
  if (days === 1) return '1 день'
  if (days < 5) return `${days} дня`
  return `${days} дней`
}

export function getBadgeLabel(days) {
  if (days < 0) return `${days} дн.`
  return `${days} дн.`
}
