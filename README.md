# 🧊 FreshTrack — Трекер сроков годности

Веб-приложение для отслеживания сроков годности продуктов, лекарств и бытовой химии.

## Стек

- **Backend**: Go + Gorilla Mux + PostgreSQL + JWT
- **Frontend**: React 18 + Vite + Zustand + React Router
- **Infrastructure**: Docker Compose + Nginx

## Быстрый старт

```bash
# Клонируй или распакуй проект
cd freshtrack

# Запусти всё одной командой
docker compose up --build

# Приложение доступно на http://localhost:3000
# API: http://localhost:8080
```

## Демо-аккаунт

- **Email**: demo@freshtrack.app
- **Пароль**: demo1234

## API Endpoints

### Аутентификация
```
POST /api/auth/register   — регистрация
POST /api/auth/login      — вход, возвращает JWT
```

### Продукты (требуется Bearer Token)
```
GET    /api/products               — список (?category=food|medicine|chemistry)
POST   /api/products               — создать
GET    /api/products/:id           — получить
PUT    /api/products/:id           — обновить
DELETE /api/products/:id           — удалить
GET    /api/stats                  — статистика (expired/soon/ok)
```

## Категории продуктов

| Ключ        | Название    |
|-------------|-------------|
| `food`      | Еда         |
| `medicine`  | Лекарства   |
| `chemistry` | Химия       |
| `other`     | Другое      |

## Структура проекта

```
freshtrack/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── go.mod
│   ├── migrations/
│   │   └── 001_init.sql
│   └── internal/
│       ├── db/          — слой данных
│       ├── handlers/    — HTTP хендлеры
│       ├── middleware/  — JWT auth
│       └── models/      — структуры данных
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/         — HTTP клиент
        ├── components/  — React компоненты
        ├── pages/       — страницы
        ├── store/       — Zustand стор
        └── utils/       — хелперы
```

## Для разработки (без Docker)

**Backend:**
```bash
cd backend
DATABASE_URL=postgres://... go run ./cmd/server
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```
