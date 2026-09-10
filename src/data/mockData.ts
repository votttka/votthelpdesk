import { v4 as uuidv4 } from 'uuid';
import type { Ticket, User, AppState, AuditLogEntry, Interaction, TicketType } from '../types';

const generateNumber = (index: number): string => {
  return `INC-${String(1000 + index).padStart(6, '0')}`;
};

const contractors = [
  'ООО "Ромашка"',
  'АО "Технопарк"',
  'ИП Иванов И.И.',
  'ГУП "Городские системы"',
  'ООО "Альфа-Групп"',
  'ЗАО "Бета Софт"',
  'ООО "Вектор"',
  'АО "Гамма Трейд"'
];

const topics = [
  'Не работает выгрузка отчётов',
  'Ошибка при синхронизации данных',
  'Требуется настройка прав доступа',
  'Консультация по работе с системой',
  'Сброс пароля пользователя',
  'Установка обновления конфигурации',
  'Настройка обмена данными с 1С',
  'Ошибка в регламентированной отчётности'
];

const descriptions = [
  'При формировании отчёта за квартал возникает ошибка "Превышен лимит памяти".',
  'Данные не синхронизируются между базами уже 2 часа.',
  'Новому сотруднику требуется доступ к модулю "Зарплата".',
  'Нужна консультация по правильному заполнению формы РВ-3.',
  'Пользователь забыл пароль, учётная запись заблокирована.',
  'Требуется установить обновление КФ 3.0.156.7.',
  'Необходимо настроить обмен данными с контрагентом.',
  'В отчёте РСВ-1 неверно рассчитываются страховые взносы.'
];

const assignees = [
  'Петров А.С.',
  'Сидорова М.И.',
  'Козлов Д.В.',
  'Николаев Е.А.',
  'Фёдорова О.П.'
];

const ticketTypes: TicketType[] = [
  'config_update',
  'data_exchange',
  'reporting_error',
  'consultation',
  'password_reset',
  'update_install',
  'access_setup',
  'other'
];

const createAuditLog = (action: string, author: string, details?: Record<string, unknown>): AuditLogEntry => ({
  id: uuidv4(),
  timestamp: new Date().toISOString(),
  action,
  author,
  authorRole: 'operator',
  details
});

const createInteraction = (type: 'comment' | 'call' | 'connection', content: string, author: string): Interaction => ({
  id: uuidv4(),
  type,
  content,
  author,
  authorRole: 'operator',
  timestamp: new Date().toISOString()
});

export const generateMockTickets = (): Ticket[] => {
  const tickets: Ticket[] = [];
  const now = new Date();
  
  // 5 New tickets
  for (let i = 0; i < 5; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    tickets.push({
      id: uuidv4(),
      number: generateNumber(i),
      topic: topics[i % topics.length],
      description: descriptions[i % descriptions.length],
      contractor: contractors[i % contractors.length],
      type: ticketTypes[i % ticketTypes.length],
      isClientTicket: i % 2 === 0,
      status: 'new',
      assignee: assignees[i % assignees.length],
      line: 1,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      statusChangedAt: createdAt.toISOString(),
      slaDeadline: new Date(createdAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      auditLog: [createAuditLog('created', 'System', { topic: topics[i % topics.length] })],
      interactions: [createInteraction('comment', 'Заявка создана автоматически.', 'System')],
      slaPaused: false,
      totalPausedTime: 0
    });
  }
  
  // 3 Classification tickets
  for (let i = 5; i < 8; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000);
    tickets.push({
      id: uuidv4(),
      number: generateNumber(i),
      topic: topics[i % topics.length],
      description: descriptions[i % descriptions.length],
      contractor: contractors[i % contractors.length],
      type: ticketTypes[i % ticketTypes.length],
      isClientTicket: i % 2 === 0,
      status: 'classification',
      assignee: assignees[i % assignees.length],
      line: 1,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      statusChangedAt: createdAt.toISOString(),
      slaDeadline: new Date(createdAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      auditLog: [
        createAuditLog('created', 'System'),
        createAuditLog('status_changed', 'Operator', { from: 'new', to: 'classification' })
      ],
      interactions: [createInteraction('comment', 'Заявка на классификации.', 'Operator')],
      slaPaused: false,
      totalPausedTime: 0
    });
  }
  
  // 7 In Progress tickets (2 with SLA breach)
  for (let i = 8; i < 15; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 72 * 60 * 60 * 1000);
    const isOverdue = i >= 13;
    const slaDeadline = isOverdue 
      ? new Date(createdAt.getTime() - 60 * 60 * 1000).toISOString()
      : new Date(createdAt.getTime() + 8 * 60 * 60 * 1000).toISOString();
    
    tickets.push({
      id: uuidv4(),
      number: generateNumber(i),
      topic: topics[i % topics.length],
      description: descriptions[i % descriptions.length],
      contractor: contractors[i % contractors.length],
      type: ticketTypes[i % ticketTypes.length],
      isClientTicket: i % 2 === 0,
      status: 'in_progress',
      assignee: assignees[i % assignees.length],
      line: (i % 3) + 1,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      statusChangedAt: createdAt.toISOString(),
      slaDeadline,
      auditLog: [
        createAuditLog('created', 'System'),
        createAuditLog('status_changed', 'Engineer', { from: 'classification', to: 'in_progress' })
      ],
      interactions: [
        createInteraction('comment', 'Заявка в работе.', 'Engineer'),
        createInteraction('call', 'Входящий звонок от клиента.', 'Engineer')
      ],
      slaPaused: false,
      totalPausedTime: 0
    });
  }
  
  // 3 Waiting Response tickets
  for (let i = 15; i < 18; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 96 * 60 * 60 * 1000);
    const pausedAt = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    tickets.push({
      id: uuidv4(),
      number: generateNumber(i),
      topic: topics[i % topics.length],
      description: descriptions[i % descriptions.length],
      contractor: contractors[i % contractors.length],
      type: ticketTypes[i % ticketTypes.length],
      isClientTicket: i % 2 === 0,
      status: 'waiting_response',
      assignee: assignees[i % assignees.length],
      line: (i % 3) + 1,
      createdAt: createdAt.toISOString(),
      updatedAt: pausedAt.toISOString(),
      statusChangedAt: pausedAt.toISOString(),
      slaDeadline: new Date(createdAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      pausedAt: pausedAt.toISOString(),
      waitingReason: ['waiting_client', 'waiting_department', 'waiting_external'][i % 3] as any,
      auditLog: [
        createAuditLog('created', 'System'),
        createAuditLog('status_changed', 'Engineer', { from: 'in_progress', to: 'waiting_response', reason: 'waiting_client' })
      ],
      interactions: [createInteraction('comment', 'Ожидаем ответ от клиента.', 'Engineer')],
      slaPaused: true,
      totalPausedTime: 24 * 60 * 60 * 1000
    });
  }
  
  // 2 Pause tickets
  for (let i = 18; i < 20; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 120 * 60 * 60 * 1000);
    const pausedAt = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    
    tickets.push({
      id: uuidv4(),
      number: generateNumber(i),
      topic: topics[i % topics.length],
      description: descriptions[i % descriptions.length],
      contractor: contractors[i % contractors.length],
      type: ticketTypes[i % ticketTypes.length],
      isClientTicket: i % 2 === 0,
      status: 'pause',
      assignee: assignees[i % assignees.length],
      line: (i % 3) + 1,
      createdAt: createdAt.toISOString(),
      updatedAt: pausedAt.toISOString(),
      statusChangedAt: pausedAt.toISOString(),
      slaDeadline: new Date(createdAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      pausedAt: pausedAt.toISOString(),
      pauseReason: ['waiting_client', 'waiting_partner'][i % 2] as any,
      auditLog: [
        createAuditLog('created', 'System'),
        createAuditLog('status_changed', 'Engineer', { from: 'in_progress', to: 'pause', reason: 'waiting_client' })
      ],
      interactions: [createInteraction('comment', 'Заявка на паузе.', 'Engineer')],
      slaPaused: true,
      totalPausedTime: 48 * 60 * 60 * 1000
    });
  }
  
  // 5 Closed tickets
  for (let i = 20; i < 25; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 200 * 60 * 60 * 1000);
    const closedAt = new Date(createdAt.getTime() + 4 * 60 * 60 * 1000);
    
    tickets.push({
      id: uuidv4(),
      number: generateNumber(i),
      topic: topics[i % topics.length],
      description: descriptions[i % descriptions.length],
      contractor: contractors[i % contractors.length],
      type: ticketTypes[i % ticketTypes.length],
      isClientTicket: i % 2 === 0,
      status: 'closed',
      assignee: assignees[i % assignees.length],
      line: (i % 3) + 1,
      createdAt: createdAt.toISOString(),
      updatedAt: closedAt.toISOString(),
      statusChangedAt: closedAt.toISOString(),
      slaDeadline: new Date(createdAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      resolutionChannel: ['remote', 'phone', 'chat', 'onsite'][i % 4] as any,
      resolutionComment: 'Проблема решена.',
      auditLog: [
        createAuditLog('created', 'System'),
        createAuditLog('status_changed', 'Engineer', { from: 'in_progress', to: 'closed' })
      ],
      interactions: [createInteraction('comment', 'Заявка закрыта.', 'Engineer')],
      slaPaused: false,
      totalPausedTime: 0
    });
  }
  
  // 3 Archived tickets
  for (let i = 25; i < 28; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    const closedAt = new Date(createdAt.getTime() + 4 * 60 * 60 * 1000);
    const archivedAt = new Date(closedAt.getTime() + 31 * 24 * 60 * 60 * 1000);
    
    tickets.push({
      id: uuidv4(),
      number: generateNumber(i),
      topic: topics[i % topics.length],
      description: descriptions[i % descriptions.length],
      contractor: contractors[i % contractors.length],
      type: ticketTypes[i % ticketTypes.length],
      isClientTicket: i % 2 === 0,
      status: 'archived',
      assignee: assignees[i % assignees.length],
      line: (i % 3) + 1,
      createdAt: createdAt.toISOString(),
      updatedAt: archivedAt.toISOString(),
      statusChangedAt: archivedAt.toISOString(),
      slaDeadline: new Date(createdAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      resolutionChannel: ['remote', 'phone', 'chat'][i % 3] as any,
      resolutionComment: 'Заявка архивирована.',
      auditLog: [
        createAuditLog('created', 'System'),
        createAuditLog('status_changed', 'Engineer', { from: 'in_progress', to: 'closed' }),
        createAuditLog('status_changed', 'System', { from: 'closed', to: 'archived' })
      ],
      interactions: [createInteraction('comment', 'Заявка в архиве.', 'System')],
      slaPaused: false,
      totalPausedTime: 0
    });
  }
  
  return tickets;
};

export const generateMockUsers = (): User[] => [
  { id: 'u1', name: 'Иванов И.И.', role: 'operator', team: 'L1' },
  { id: 'u2', name: 'Петров П.П.', role: 'engineer', team: 'L2' },
  { id: 'u3', name: 'Сидоров С.С.', role: 'supervisor', team: 'L2' },
  { id: 'u4', name: 'Козлов К.К.', role: 'lead', team: 'Support' },
  { id: 'u5', name: 'Администратор', role: 'admin' },
  { id: 'u6', name: 'Аудитор А.А.', role: 'auditor' }
];

export const getInitialState = (): AppState => {
  const stored = localStorage.getItem('helpdesk_state');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to generate new state
    }
  }
  
  return {
    tickets: generateMockTickets(),
    users: generateMockUsers(),
    currentUserId: 'u1',
    slaSettings: {
      defaultHours: 8,
      byType: {
        config_update: 8,
        data_exchange: 12,
        reporting_error: 6,
        consultation: 4,
        password_reset: 2,
        update_install: 8,
        access_setup: 4,
        other: 8
      },
      internalBufferMinutes: 30
    },
    automationSettings: {
      autoResumeWaitingHours: 24,
      autoArchiveDays: 30,
      slaWarningMinutes: 30,
      enableAutoResume: true,
      enableAutoArchive: true,
      enableSlaWarning: true
    },
    statusConfigs: [
      { status: 'new', label: 'Новая', color: '#2196F3', slaRunning: true },
      { status: 'classification', label: 'Классификация', color: '#FF9800', slaRunning: true },
      { status: 'in_progress', label: 'В работе', color: '#4CAF50', slaRunning: true },
      { status: 'waiting_response', label: 'Ждём ответа', color: '#FFEB3B', slaRunning: false },
      { status: 'pause', label: 'Пауза', color: '#9E9E9E', slaRunning: false },
      { status: 'closed', label: 'Закрыта', color: '#9C27B0', slaRunning: false },
      { status: 'archived', label: 'Архив', color: '#616161', slaRunning: false }
    ],
    rolePermissions: {
      operator: {
        canViewAll: true,
        canViewTeam: false,
        canViewOwn: false,
        canCreate: true,
        canChangeStatuses: ['new', 'classification'],
        canReassign: false,
        canTransferLines: false,
        canEditSettings: false,
        canExport: false,
        canDeleteUsers: false,
        readOnly: false
      },
      engineer: {
        canViewAll: false,
        canViewTeam: true,
        canViewOwn: true,
        canCreate: true,
        canChangeStatuses: ['classification', 'in_progress', 'waiting_response', 'pause', 'closed'],
        canReassign: false,
        canTransferLines: false,
        canEditSettings: false,
        canExport: false,
        canDeleteUsers: false,
        readOnly: false
      },
      supervisor: {
        canViewAll: false,
        canViewTeam: true,
        canViewOwn: false,
        canCreate: true,
        canChangeStatuses: ['new', 'classification', 'in_progress', 'waiting_response', 'pause', 'closed'],
        canReassign: true,
        canTransferLines: true,
        canEditSettings: false,
        canExport: false,
        canDeleteUsers: false,
        readOnly: false
      },
      lead: {
        canViewAll: true,
        canViewTeam: false,
        canViewOwn: false,
        canCreate: true,
        canChangeStatuses: ['new', 'classification', 'in_progress', 'waiting_response', 'pause', 'closed', 'archived'],
        canReassign: true,
        canTransferLines: true,
        canEditSettings: true,
        canExport: true,
        canDeleteUsers: false,
        readOnly: false
      },
      admin: {
        canViewAll: true,
        canViewTeam: false,
        canViewOwn: false,
        canCreate: true,
        canChangeStatuses: ['new', 'classification', 'in_progress', 'waiting_response', 'pause', 'closed', 'archived'],
        canReassign: true,
        canTransferLines: true,
        canEditSettings: true,
        canExport: true,
        canDeleteUsers: true,
        readOnly: false
      },
      auditor: {
        canViewAll: true,
        canViewTeam: false,
        canViewOwn: false,
        canCreate: false,
        canChangeStatuses: [],
        canReassign: false,
        canTransferLines: false,
        canEditSettings: false,
        canExport: true,
        canDeleteUsers: false,
        readOnly: true
      }
    }
  };
};

export const saveState = (state: AppState): void => {
  localStorage.setItem('helpdesk_state', JSON.stringify(state));
};

export const resetDemoData = (): AppState => {
  const newState = getInitialState();
  saveState(newState);
  return newState;
};
