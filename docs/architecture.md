# Архитектура HelpDesk Prototype

## Обзор

HelpDesk Prototype — это одностраничное веб-приложение (SPA), работающее полностью в браузере без серверной части. Все данные хранятся локально в browser localStorage.

## Технологический стек

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  ┌───────────────────────────────────────────────┐  │
│  │              Vue 3 Application                │  │
│  │  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │  Components │  │   Router    │            │  │
│  │  └─────────────┘  └─────────────┘            │  │
│  │  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │   Pinia     │  │  Mock API   │            │  │
│  │  │   (State)   │  │   Layer     │            │  │
│  │  └─────────────┘  └─────────────┘            │  │
│  └───────────────────────────────────────────────┘  │
│                      │                              │
│                      ▼                              │
│  ┌───────────────────────────────────────────────┐  │
│  │           localStorage / IndexedDB            │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                      ▲
                      │ deploy
                      │
┌─────────────────────────────────────────────────────┐
│              GitHub Actions (CI/CD)                 │
│  - Build (Vite)                                     │
│  - Lint                                             │
│  - Test                                             │
│  - Deploy to GitHub Pages                           │
└─────────────────────────────────────────────────────┘
```

## Компоненты

### Фронтенд (Vue 3)

| Компонент | Описание |
|-----------|----------|
| **App.vue** | Корневой компонент, роутинг |
| **Layout** | Общая структура страницы (header, sidebar, main) |
| **Dashboard** | Дашборд с базовой аналитикой |
| **TicketList** | Список заявок с фильтрами и поиском |
| **TicketDetail** | Карточка заявки |
| **TicketForm** | Форма создания/редактирования заявки |
| **Interactions** | Вкладка взаимодействий |
| **AuditLog** | Аудит-лог событий |
| **RoleSwitcher** | Переключатель ролей (эмуляция) |
| **IntegrationsMock** | Панель заглушек интеграций |

### Хранилище данных (Pinia + localStorage)

```javascript
// Структура хранилища
{
  tickets: [],          // Массив заявок
  users: [],            // Пользователи
  roles: [],            // Роли
  ticketTypes: [],      // Типы обращений
  auditLogs: [],        // Аудит-лог
  interactions: [],     // Взаимодействия
  settings: {}          // Настройки
}
```

### Mock API слой

Единый интерфейс для всех внешних интеграций:

```javascript
mockApi.telephony.getCallInfo()
mockApi.usp.getIncomingRequest()
mockApi.accounting.getHoursSpent()
mockApi.analytics.exportEvent()
mockApi.sso.emulateLogin()
mockApi.taskTracker.createTask()
```

## Модель данных

### Ticket (Заявка)

```typescript
interface Ticket {
  id: string;
  number: string;           // Номер заявки (автогенерация)
  type: string;             // Тип обращения (обязательно)
  title: string;            // Краткое описание
  description: string;      // Полное описание
  isClient: boolean;        // Клиентская (true) или внутренняя (false)
  counterparty?: string;    // Контрагент (для клиентских)
  owner?: string;           // Владелец (для внутренних)
  status: TicketStatus;
  assignee?: string;        // Исполнитель
  line: number;             // Линия поддержки (1, 2, 3)
  resolutionChannel?: string; // Канал решения (при закрытии)
  pauseReason?: string;     // Причина паузы
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}
```

### TicketStatus

```typescript
enum TicketStatus {
  NEW = 'new',                    // Новая
  IN_PROGRESS = 'in_progress',    // В работе
  WAITING_CLIENT = 'waiting_client',    // Ожидание клиента
  WAITING_PARTNER = 'waiting_partner',  // Ожидание смежника
  RESOLVED = 'resolved',          // Решена
  CLOSED = 'closed'               // Закрыта
}
```

### TicketType

```typescript
interface TicketType {
  id: string;
  name: string;
  description?: string;
  requiresComment: boolean;  // true для типа «Другое»
}
```

### AuditLogEntry

```typescript
interface AuditLogEntry {
  id: string;
  ticketId: string;
  eventType: AuditEventType;
  timestamp: Date;
  userId: string;
  userName: string;
  details: Record<string, any>;
}
```

### AuditEventType

```typescript
enum AuditEventType {
  TICKET_CREATED = 'ticket_created',
  STATUS_CHANGED = 'status_changed',
  COMMENT_ADDED = 'comment_added',
  ASSIGNEE_CHANGED = 'assignee_changed',
  LINE_TRANSFERRED = 'line_transferred',
  TICKET_CLOSED = 'ticket_closed',
  TYPE_CHANGED = 'type_changed',
  PAUSE_STARTED = 'pause_started',
  PAUSE_ENDED = 'pause_ended'
}
```

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
```

### UserRole

```typescript
enum UserRole {
  OPERATOR = 'operator',
  ENGINEER = 'engineer',
  LEAD = 'lead',
  AUDITOR = 'auditor',
  ADMIN = 'admin'
}
```

## Бизнес-правила

### Создание заявки
1. Тип обращения обязателен
2. Если тип «Другое», требуется комментарий
3. Признак клиентская/внутренняя обязателен
4. Для клиентских: указать контрагента
5. Для внутренних: указать владельца

### Смена статуса
1. Переходы только по разрешённой схеме
2. При переходе в «Ожидание клиента» или «Ожидание смежника»:
   - Обязательна причина паузы
   - Фиксация в аудит-логе
3. При переходе в «Решена»:
   - Обязателен канал решения
   - Без канала переход блокируется

### Передача между линиями
1. Только с обязательным комментарием
2. Без комментария передача блокируется
3. Фиксация в аудит-логе

### Аудит-лог
1. Нельзя удалять записи через интерфейс
2. Все ключевые события фиксируются
3. Хранение: постоянно (пока есть данные в localStorage)

## Интеграции (Mock)

### Телефония
```javascript
// Контракт
{
  callId: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  duration: number;
  recordingUrl?: string;  // эмуляция
  timestamp: Date;
}
```

### УСП (Управление сервисными проектами)
```javascript
// Контракт
{
  uspId: string;
  customerName: string;
  contractNumber: string;
  requestType: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}
```

### Бухгалтерия
```javascript
// Контракт
{
  ticketId: string;
  hoursSpent: number;
  costPerHour: number;
  totalCost: number;
  billable: boolean;
}
```

### Аналитика
```javascript
// Контракт
{
  eventType: string;
  payload: Record<string, any>;
  timestamp: Date;
  // Экспорт в JSON или отправка на webhook
}
```

### SSO
```javascript
// Контракт
{
  provider: string;
  userId: string;
  email: string;
  roles: string[];
  // Эмуляция входа через кнопку
}
```

### Трекер разработки
```javascript
// Контракт
{
  taskId: string;
  trackerUrl: string;
  title: string;
  status: 'open' | 'in_progress' | 'done';
  // Создание связанной задачи
}
```

## Деплой

### GitHub Actions Workflow

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  schedule:
    - cron: '*/30 * * * *'  # Проверки Архитектора
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Ограничения

1. **Данные теряются при очистке кэша браузера**
2. **Нет синхронизации между устройствами**
3. **Ограничение localStorage (~5MB)**
4. **Эмуляция ролей не является безопасностью**
5. **Mock-интеграции требуют будущей реализации**
6. **Нет реального бэкенда**

## Будущие улучшения

1. IndexedDB для большего объёма данных
2. Синхронизация через облачный бэкенд
3. Реальная авторизация (OAuth/SAML)
4. Интеграция с реальными системами
5. Расширенная аналитика
6. Уведомления (email, мессенджеры)

---
*Документ версионирован. Последнее обновление: 2025-01-09*
