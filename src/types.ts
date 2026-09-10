export interface Ticket {
  id: string;
  number: string;
  theme: string;
  description: string;
  contractor: string;
  type: string;
  typeComment?: string;
  status: StatusType;
  isClientFacing: boolean;
  assignee?: string;
  line: number;
  createdAt: string;
  updatedAt: string;
  slaTimer: number;
  slaPaused: boolean;
  pauseReason?: string;
  resolutionChannel?: string;
  auditLog: AuditEntry[];
  interactions: Interaction[];
}

export type StatusType = 
  | 'new'
  | 'classification'
  | 'inProgress'
  | 'waiting'
  | 'paused'
  | 'closed'
  | 'archived';

export interface StatusConfig {
  key: StatusType;
  label: string;
  color: string;
  slaColor: string;
  runsSLA: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  author: string;
  authorRole: string;
  details?: string;
  oldStatus?: StatusType;
  newStatus?: StatusType;
}

export interface Interaction {
  id: string;
  timestamp: string;
  type: 'comment' | 'call' | 'connection';
  author: string;
  content: string;
}

export type RoleType = 'operator' | 'engineer' | 'supervisor' | 'lead' | 'admin' | 'auditor';

export interface RoleConfig {
  key: RoleType;
  label: string;
  canCreate: boolean;
  canChangeStatus: (from: StatusType, to: StatusType) => boolean;
  canAssign: boolean;
  canTransfer: boolean;
  canViewAll: boolean;
  canEditSettings: boolean;
  canExport: boolean;
  readOnly: boolean;
}

export interface Settings {
  autoTransitionWaitingHours: number;
  autoArchiveDays: number;
  slaWarningMinutes: number;
  defaultSlaHours: number;
  slaByType: Record<string, { internal: number; external: number }>;
  statuses: StatusConfig[];
}

export const STATUS_CONFIGS: StatusConfig[] = [
  { key: 'new', label: 'Новая', color: '#2196F3', slaColor: '#F44336', runsSLA: true },
  { key: 'classification', label: 'Классификация', color: '#FF9800', slaColor: '#F44336', runsSLA: true },
  { key: 'inProgress', label: 'В работе', color: '#4CAF50', slaColor: '#F44336', runsSLA: true },
  { key: 'waiting', label: 'Ждём ответа', color: '#FFEB3B', slaColor: '#F44336', runsSLA: false },
  { key: 'paused', label: 'Пауза', color: '#9E9E9E', slaColor: '#F44336', runsSLA: false },
  { key: 'closed', label: 'Закрыта', color: '#9C27B0', slaColor: '#9C27B0', runsSLA: false },
  { key: 'archived', label: 'Архив', color: '#616161', slaColor: '#616161', runsSLA: false },
];

export const WAITING_REASONS = [
  { value: 'client', label: 'Ожидание клиента', stopsSLA: true },
  { value: 'department', label: 'Ожидание смежного отдела', stopsSLA: true },
  { value: 'external', label: 'Ожидание внешней системы', stopsSLA: true },
  { value: 'other', label: 'Другое', stopsSLA: false },
];

export const PAUSE_REASONS = [
  { value: 'client', label: 'Ожидание клиента', stopsSLA: true },
  { value: 'partner', label: 'Ожидание смежника', stopsSLA: true },
  { value: 'planned', label: 'Плановые работы', stopsSLA: false },
  { value: 'vacation', label: 'Отпуск исполнителя', stopsSLA: false },
  { value: 'other', label: 'Другое', stopsSLA: false },
];

export const PAUSE_DURATIONS = [
  { value: 30, label: '30 минут' },
  { value: 60, label: '1 час' },
  { value: 120, label: '2 часа' },
  { value: 240, label: '4 часа' },
  { value: 480, label: '8 часов' },
  { value: 'endOfDay', label: 'До конца дня' },
  { value: 'tomorrow', label: 'До завтра' },
];

export const RESOLUTION_CHANNELS = [
  { value: 'remote', label: 'Удалённо' },
  { value: 'phone', label: 'Телефон' },
  { value: 'chat', label: 'Переписка' },
  { value: 'onsite', label: 'Выезд' },
];

export const TICKET_TYPES = [
  'Обновление конфигурации',
  'Настройка обмена данными',
  'Ошибка в регламентированной отчётности',
  'Консультация по работе',
  'Сброс пароля',
  'Установка обновления',
  'Настройка прав доступа',
  'Другое',
];

export const CONTRACTORS = [
  'ООО "Ромашка"',
  'АО "Технопарк"',
  'ИП Иванов И.И.',
  'ГУП "Городские системы"',
  'ООО "Альфа-Групп"',
  'Внутренний заказчик',
];

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateTicketNumber = (index: number) => `REQ-${String(index).padStart(5, '0')}`;
