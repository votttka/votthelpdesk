import { Ticket, StatusType, RoleType, AuditEntry, Interaction, generateId, generateTicketNumber, STATUS_CONFIGS } from './types';

const SAMPLE_USERS = ['Алексеев П.', 'Борисов И.', 'Васильев К.', 'Григорьев М.', 'Дмитриев С.'];

function createAuditEntry(action: string, author: string, role: string, details?: string, oldStatus?: StatusType, newStatus?: StatusType): AuditEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action,
    author,
    authorRole: role,
    details,
    oldStatus,
    newStatus,
  };
}

function createSampleTicket(
  index: number,
  status: StatusType,
  slaHoursAgo?: number,
  isPaused = false,
  pauseReason?: string
): Ticket {
  const now = new Date();
  const createdAt = slaHoursAgo ? new Date(now.getTime() - slaHoursAgo * 3600000) : new Date(now.getTime() - Math.random() * 168 * 3600000);
  const slaTimer = slaHoursAgo ? slaHoursAgo * 3600 : Math.random() * 28800;
  
  const ticket: Ticket = {
    id: generateId(),
    number: generateTicketNumber(index),
    theme: `Заявка #${index}: ${['Ошибка в отчёте', 'Настройка доступа', 'Консультация по 1С', 'Обновление конфигурации', 'Сброс пароля'][Math.floor(Math.random() * 5)]}`,
    description: 'Описание проблемы с системой. Требуется анализ и решение в кратчайшие сроки.',
    contractor: ['ООО "Ромашка"', 'АО "Технопарк"', 'ИП Иванов И.И.', 'ГУП "Городские системы"', 'ООО "Альфа-Групп"', 'Внутренний заказчик'][Math.floor(Math.random() * 6)],
    type: ['Обновление конфигурации', 'Настройка обмена данными', 'Ошибка в регламентированной отчётности', 'Консультация по работе', 'Сброс пароля', 'Установка обновления', 'Настройка прав доступа'][Math.floor(Math.random() * 7)],
    status,
    isClientFacing: Math.random() > 0.3,
    assignee: SAMPLE_USERS[Math.floor(Math.random() * SAMPLE_USERS.length)],
    line: Math.floor(Math.random() * 3) + 1,
    createdAt: createdAt.toISOString(),
    updatedAt: new Date().toISOString(),
    slaTimer,
    slaPaused: isPaused,
    pauseReason,
    auditLog: [
      createAuditEntry('Создание заявки', 'Система', 'operator', undefined, undefined, status),
    ],
    interactions: [
      {
        id: generateId(),
        timestamp: createdAt.toISOString(),
        type: 'comment',
        author: 'Система',
        content: 'Заявка создана автоматически',
      },
    ],
  };

  if (status === 'inProgress' && slaHoursAgo && slaHoursAgo > 8) {
    ticket.auditLog.push(createAuditEntry('Смена статуса', 'Алексеев П.', 'engineer', 'Перевод в работу', 'classification', 'inProgress'));
    ticket.interactions.push({
      id: generateId(),
      timestamp: new Date(createdAt.getTime() + 3600000).toISOString(),
      type: 'comment',
      author: 'Алексеев П.',
      content: 'Принято в работу',
    });
  }

  if (status === 'waiting') {
    ticket.pauseReason = 'client';
    ticket.auditLog.push(createAuditEntry('Смена статуса', 'Борисов И.', 'engineer', 'Ожидание клиента', 'inProgress', 'waiting'));
    ticket.interactions.push({
      id: generateId(),
      timestamp: new Date(createdAt.getTime() + 7200000).toISOString(),
      type: 'call',
      author: 'Борисов И.',
      content: 'Звонок клиенту для уточнения деталей',
    });
  }

  if (status === 'paused') {
    ticket.auditLog.push(createAuditEntry('Смена статуса', 'Васильев К.', 'engineer', pauseReason || 'Плановые работы', 'inProgress', 'paused'));
  }

  if (status === 'closed') {
    ticket.resolutionChannel = ['remote', 'phone', 'chat', 'onsite'][Math.floor(Math.random() * 4)];
    ticket.auditLog.push(createAuditEntry('Закрытие заявки', 'Григорьев М.', 'engineer', 'Решено', 'inProgress', 'closed'));
    ticket.interactions.push({
      id: generateId(),
      timestamp: new Date(createdAt.getTime() + 14400000).toISOString(),
      type: 'comment',
      author: 'Григорьев М.',
      content: 'Проблема решена. Заявка закрыта.',
    });
  }

  if (status === 'archived') {
    ticket.resolutionChannel = 'remote';
    ticket.auditLog.push(createAuditEntry('Архивация', 'Система', 'system', 'Автоматическая архивация', 'closed', 'archived'));
  }

  return ticket;
}

export function initializeDemoData(): Ticket[] {
  const tickets: Ticket[] = [];
  
  // 5 заявок: Новая
  for (let i = 1; i <= 5; i++) {
    tickets.push(createSampleTicket(i, 'new', Math.random() * 4 + 1));
  }
  
  // 3 заявки: Классификация
  for (let i = 6; i <= 8; i++) {
    tickets.push(createSampleTicket(i, 'classification', Math.random() * 6 + 2));
  }
  
  // 7 заявок: В работе (2 с просрочкой SLA)
  for (let i = 9; i <= 15; i++) {
    const isOverdue = i >= 14;
    tickets.push(createSampleTicket(i, 'inProgress', isOverdue ? 12 : Math.random() * 4 + 1));
  }
  
  // 3 заявки: Ждём ответа
  for (let i = 16; i <= 18; i++) {
    tickets.push(createSampleTicket(i, 'waiting', Math.random() * 12 + 6, true, 'client'));
  }
  
  // 2 заявки: Пауза
  for (let i = 19; i <= 20; i++) {
    tickets.push(createSampleTicket(i, 'paused', Math.random() * 24 + 12, true, 'planned'));
  }
  
  // 5 заявок: Закрыта
  for (let i = 21; i <= 25; i++) {
    tickets.push(createSampleTicket(i, 'closed', Math.random() * 48 + 24));
  }
  
  // 3 заявки: Архив
  for (let i = 26; i <= 28; i++) {
    tickets.push(createSampleTicket(i, 'archived', Math.random() * 720 + 168));
  }

  return tickets;
}

export function loadTickets(): Ticket[] {
  const stored = localStorage.getItem('helpdesk_tickets');
  if (stored) {
    return JSON.parse(stored);
  }
  const demoData = initializeDemoData();
  saveTickets(demoData);
  return demoData;
}

export function saveTickets(tickets: Ticket[]): void {
  localStorage.setItem('helpdesk_tickets', JSON.stringify(tickets));
}

export function addTicket(ticket: Ticket): void {
  const tickets = loadTickets();
  tickets.unshift(ticket);
  saveTickets(tickets);
}

export function updateTicket(updatedTicket: Ticket): void {
  const tickets = loadTickets();
  const index = tickets.findIndex(t => t.id === updatedTicket.id);
  if (index !== -1) {
    tickets[index] = updatedTicket;
    saveTickets(tickets);
  }
}

export function getTicketById(id: string): Ticket | undefined {
  const tickets = loadTickets();
  return tickets.find(t => t.id === id);
}

export function resetDemoData(): void {
  localStorage.removeItem('helpdesk_tickets');
  localStorage.removeItem('helpdesk_settings');
  localStorage.removeItem('helpdesk_currentRole');
}
