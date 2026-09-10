import { Ticket, Interaction } from '../types';

const clients = [
  'ООО "Ромашка"',
  'АО "Технопарк"',
  'ИП Иванов И.И.',
  'ГУП "Городские системы"',
  'ООО "Альфа-Групп"',
  'ЗАО "Вектор"',
  'ООО "Спектр"',
];

const ticketTypes = [
  'Обновление конфигурации',
  'Настройка обмена данными',
  'Ошибка в регламентированной отчётности',
  'Консультация по работе',
  'Сброс пароля',
  'Установка обновления',
  'Настройка прав доступа',
  'Другое',
];

const assignees = [
  'Алексей Петров',
  'Мария Иванова',
  'Дмитрий Сидоров',
  'Елена Козлова',
  'Сергей Морозов',
];

const channelsIn = ['Email', 'Телефон', 'Портал', 'API'];
const channelsOut = ['Удалённо', 'Телефон', 'Переписка', 'Выезд'];

const waitReasons = [
  'Ожидание клиента',
  'Ожидание смежного отдела',
  'Ожидание внешней системы',
  'Другое',
];

const pauseReasons = [
  'Ожидание клиента',
  'Ожидание смежника',
  'Плановые работы',
  'Отпуск исполнителя',
  'Другое',
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateNumber(index: number): string {
  return `HD-${String(1000 + index).padStart(4, '0')}`;
}

function randomDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

function generateAuditLog(ticket: Ticket): any[] {
  const log = [];
  
  log.push({
    id: generateId(),
    timestamp: ticket.createdAt,
    action: 'Заявка создана',
    author: 'Система',
    authorRole: 'Администратор' as any,
  });

  if (ticket.status !== 'Новая') {
    log.push({
      id: generateId(),
      timestamp: randomDate(5),
      action: `Статус изменён с "Новая" на "${ticket.status}"`,
      author: randomAssignee(),
      authorRole: 'Инженер' as any,
      oldValue: 'Новая',
      newValue: ticket.status,
    });
  }

  if (ticket.assignee) {
    log.push({
      id: generateId(),
      timestamp: randomDate(5),
      action: 'Назначен исполнитель',
      author: randomAssignee(),
      authorRole: 'Супервизор' as any,
      oldValue: 'Не назначен',
      newValue: ticket.assignee,
    });
  }

  return log;
}

function generateInteractions(ticket: Ticket): Interaction[] {
  const interactions: Interaction[] = [];
  
  if (ticket.status === 'В работе' || ticket.status === 'Ждём ответа' || ticket.status === 'Закрыта') {
    interactions.push({
      id: generateId(),
      type: 'message',
      content: `Здравствуйте! Ваша заявка принята в работу. Номер: ${ticket.number}`,
      author: ticket.assignee || 'Система',
      authorRole: 'Инженер' as any,
      timestamp: randomDate(3),
      visibleToClient: true,
    });

    if (Math.random() > 0.5) {
      interactions.push({
        id: generateId(),
        type: 'note',
        content: 'Внутренняя заметка: требуется дополнительная информация от клиента',
        author: ticket.assignee || 'Система',
        authorRole: 'Инженер' as any,
        timestamp: randomDate(2),
        visibleToClient: false,
      });
    }

    if (Math.random() > 0.7) {
      interactions.push({
        id: generateId(),
        type: 'call',
        content: 'Входящий звонок от клиента. Обсуждали детали проблемы.',
        author: ticket.assignee || 'Система',
        authorRole: 'Инженер' as any,
        timestamp: randomDate(1),
        duration: '5:32',
      });
    }
  }

  return interactions;
}

function randomAssignee(): string {
  return assignees[Math.floor(Math.random() * assignees.length)];
}

function randomClient(): string {
  return clients[Math.floor(Math.random() * clients.length)];
}

function randomType(): string {
  return ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
}

function randomChannelIn(): string {
  return channelsIn[Math.floor(Math.random() * channelsIn.length)];
}

export function generateDemoData(): Ticket[] {
  const tickets: Ticket[] = [];
  let index = 1;

  // Новая: 4 заявки
  for (let i = 0; i < 4; i++) {
    const createdAt = randomDate(2);
    const slaDeadline = new Date(new Date(createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString();
    tickets.push({
      id: generateId(),
      number: generateNumber(index++),
      title: `Проблема с доступом к системе #${i + 1}`,
      description: 'Клиент сообщает о проблемах с доступом к рабочей среде.',
      status: 'Новая',
      type: randomType(),
      client: randomClient(),
      isClientTicket: Math.random() > 0.3,
      priority: ['Низкий', 'Средний', 'Высокий'][Math.floor(Math.random() * 3)] as any,
      line: Math.floor(Math.random() * 3) + 1,
      channelIn: randomChannelIn(),
      createdAt,
      updatedAt: createdAt,
      slaDeadline,
      slaPaused: false,
      auditLog: [],
      interactions: [],
    });
  }

  // Классификация: 3 заявки
  for (let i = 0; i < 3; i++) {
    const createdAt = randomDate(3);
    const slaDeadline = new Date(new Date(createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString();
    const ticket: Ticket = {
      id: generateId(),
      number: generateNumber(index++),
      title: `Настройка отчётности #${i + 1}`,
      description: 'Требуется настройка регламентированной отчётности для нового контрагента.',
      status: 'Классификация',
      type: randomType(),
      client: randomClient(),
      isClientTicket: Math.random() > 0.3,
      priority: ['Средний', 'Высокий'][Math.floor(Math.random() * 2)] as any,
      line: Math.floor(Math.random() * 3) + 1,
      assignee: randomAssignee(),
      channelIn: randomChannelIn(),
      createdAt,
      updatedAt: createdAt,
      slaDeadline,
      slaPaused: false,
      auditLog: [],
      interactions: [],
    };
    ticket.auditLog = generateAuditLog(ticket);
    ticket.interactions = generateInteractions(ticket);
    tickets.push(ticket);
  }

  // В работе: 8 заявок (2 с просрочкой SLA)
  for (let i = 0; i < 8; i++) {
    const createdAt = randomDate(5);
    const isOverdue = i < 2;
    const slaDeadline = isOverdue 
      ? new Date(new Date(createdAt).getTime() - 2 * 60 * 60 * 1000).toISOString()
      : new Date(new Date(createdAt).getTime() + (8 - Math.random() * 4) * 60 * 60 * 1000).toISOString();
    
    const ticket: Ticket = {
      id: generateId(),
      number: generateNumber(index++),
      title: `Инцидент в продукте #${i + 1}`,
      description: 'Клиент столкнулся с ошибкой при формировании документа.',
      status: 'В работе',
      type: randomType(),
      client: randomClient(),
      isClientTicket: Math.random() > 0.3,
      priority: ['Средний', 'Высокий', 'Критический'][Math.floor(Math.random() * 3)] as any,
      line: Math.floor(Math.random() * 3) + 1,
      assignee: randomAssignee(),
      channelIn: randomChannelIn(),
      createdAt,
      updatedAt: createdAt,
      slaDeadline,
      slaPaused: false,
      auditLog: [],
      interactions: [],
    };
    ticket.auditLog = generateAuditLog(ticket);
    ticket.interactions = generateInteractions(ticket);
    tickets.push(ticket);
  }

  // Ждём ответа: 4 заявки
  for (let i = 0; i < 4; i++) {
    const createdAt = randomDate(4);
    const slaDeadline = new Date(new Date(createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString();
    const waitReason = waitReasons[Math.floor(Math.random() * waitReasons.length)];
    
    const ticket: Ticket = {
      id: generateId(),
      number: generateNumber(index++),
      title: `Запрос консультации #${i + 1}`,
      description: 'Клиент запросил консультацию по работе с модулем.',
      status: 'Ждём ответа',
      type: randomType(),
      client: randomClient(),
      isClientTicket: true,
      priority: 'Средний',
      line: Math.floor(Math.random() * 3) + 1,
      assignee: randomAssignee(),
      channelIn: randomChannelIn(),
      createdAt,
      updatedAt: createdAt,
      slaDeadline,
      slaPaused: true,
      waitReason,
      waitAutoReturnAt: new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      auditLog: [],
      interactions: [],
    };
    ticket.auditLog = generateAuditLog(ticket);
    ticket.interactions = generateInteractions(ticket);
    tickets.push(ticket);
  }

  // Пауза: 3 заявки
  for (let i = 0; i < 3; i++) {
    const createdAt = randomDate(6);
    const slaDeadline = new Date(new Date(createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString();
    const pauseReason = pauseReasons[Math.floor(Math.random() * pauseReasons.length)];
    const slaPaused = pauseReason.includes('клиента') || pauseReason.includes('смежника');
    
    const ticket: Ticket = {
      id: generateId(),
      number: generateNumber(index++),
      title: `Техническая задача #${i + 1}`,
      description: 'Внутренняя задача по оптимизации производительности.',
      status: 'Пауза',
      type: randomType(),
      client: randomClient(),
      isClientTicket: i === 2,
      priority: 'Низкий',
      line: Math.floor(Math.random() * 3) + 1,
      assignee: randomAssignee(),
      channelIn: randomChannelIn(),
      createdAt,
      updatedAt: createdAt,
      slaDeadline,
      slaPaused,
      pauseReason,
      pauseUntil: new Date(new Date(createdAt).getTime() + 4 * 60 * 60 * 1000).toISOString(),
      auditLog: [],
      interactions: [],
    };
    ticket.auditLog = generateAuditLog(ticket);
    ticket.interactions = generateInteractions(ticket);
    tickets.push(ticket);
  }

  // Закрыта: 5 заявок
  for (let i = 0; i < 5; i++) {
    const createdAt = randomDate(10);
    const closedAt = new Date(new Date(createdAt).getTime() + 4 * 60 * 60 * 1000).toISOString();
    const slaDeadline = new Date(new Date(createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString();
    
    const ticket: Ticket = {
      id: generateId(),
      number: generateNumber(index++),
      title: `Решённая проблема #${i + 1}`,
      description: 'Проблема была успешно решена.',
      status: 'Закрыта',
      type: randomType(),
      client: randomClient(),
      isClientTicket: Math.random() > 0.3,
      priority: ['Низкий', 'Средний'][Math.floor(Math.random() * 2)] as any,
      line: Math.floor(Math.random() * 3) + 1,
      assignee: randomAssignee(),
      channelIn: randomChannelIn(),
      channelOut: channelsOut[Math.floor(Math.random() * channelsOut.length)],
      resolution: channelsOut[Math.floor(Math.random() * channelsOut.length)],
      hoursSpent: Math.floor(Math.random() * 4) + 1,
      clientConfirmed: Math.random() > 0.3,
      createdAt,
      updatedAt: closedAt,
      slaDeadline,
      slaPaused: false,
      auditLog: [],
      interactions: [],
    };
    ticket.auditLog = generateAuditLog(ticket);
    ticket.interactions = generateInteractions(ticket);
    tickets.push(ticket);
  }

  // Архив: 3 заявки
  for (let i = 0; i < 3; i++) {
    const createdAt = randomDate(40);
    const closedAt = new Date(new Date(createdAt).getTime() + 4 * 60 * 60 * 1000).toISOString();
    const archivedAt = new Date(new Date(closedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const slaDeadline = new Date(new Date(createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString();
    
    const ticket: Ticket = {
      id: generateId(),
      number: generateNumber(index++),
      title: `Архивная заявка #${i + 1}`,
      description: 'Заявка была закрыта и перемещена в архив.',
      status: 'Архив',
      type: randomType(),
      client: randomClient(),
      isClientTicket: Math.random() > 0.3,
      priority: 'Низкий',
      line: Math.floor(Math.random() * 3) + 1,
      assignee: randomAssignee(),
      channelIn: randomChannelIn(),
      channelOut: 'Удалённо',
      resolution: 'Удалённо',
      hoursSpent: Math.floor(Math.random() * 4) + 1,
      clientConfirmed: true,
      createdAt,
      updatedAt: archivedAt,
      slaDeadline,
      slaPaused: false,
      auditLog: [],
      interactions: [],
    };
    ticket.auditLog = generateAuditLog(ticket);
    ticket.interactions = generateInteractions(ticket);
    tickets.push(ticket);
  }

  // Initialize audit logs and interactions for all tickets
  tickets.forEach((ticket) => {
    if (ticket.auditLog.length === 0) {
      ticket.auditLog = generateAuditLog(ticket);
    }
    if (ticket.interactions.length === 0) {
      ticket.interactions = generateInteractions(ticket);
    }
  });

  return tickets;
}
