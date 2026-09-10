export type Role = 'Оператор' | 'Инженер' | 'Классификатор' | 'Супервизор' | 'Лид' | 'Администратор' | 'Аудитор';

export type TicketStatus = 'Новая' | 'Классификация' | 'В работе' | 'Ждём ответа' | 'Пауза' | 'Закрыта' | 'Архив';

export interface StatusConfig {
  id: TicketStatus;
  label: string;
  color: string;
  softColor: string;
  textColor: string;
  slaRunning: boolean;
}

export interface TicketType {
  id: string;
  label: string;
}

export interface Ticket {
  id: string;
  number: string;
  title: string;
  description: string;
  status: TicketStatus;
  type: string;
  typeComment?: string;
  client: string;
  isClientTicket: boolean;
  priority: 'Низкий' | 'Средний' | 'Высокий' | 'Критический';
  line: number;
  assignee?: string;
  channelIn: string;
  channelOut?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  slaPaused: boolean;
  pauseReason?: string;
  pauseUntil?: string;
  waitReason?: string;
  waitAutoReturnAt?: string;
  resolution?: string;
  hoursSpent?: number;
  clientConfirmed?: boolean;
  auditLog: AuditEntry[];
  interactions: Interaction[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  author: string;
  authorRole: Role;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  comment?: string;
}

export interface Interaction {
  id: string;
  type: 'message' | 'note' | 'call' | 'connection' | 'system';
  content: string;
  author: string;
  authorRole: Role;
  timestamp: string;
  visibleToClient?: boolean;
  duration?: string;
}

export interface Settings {
  statuses: StatusConfig[];
  transitions: TransitionRule[];
  automation: AutomationConfig;
  slaDefaults: SlaDefaults;
  roles: RoleConfig[];
}

export interface TransitionRule {
  from: TicketStatus;
  to: TicketStatus;
  allowed: boolean;
  requiredFields: string[];
  slaBehavior: 'continue' | 'stop' | 'reset';
}

export interface AutomationConfig {
  autoReturnFromWaitEnabled: boolean;
  autoReturnFromWaitHours: number;
  autoArchiveEnabled: boolean;
  autoArchiveDays: number;
  slaAlertEnabled: boolean;
  slaAlertMinutes: number;
  autoClassificationEnabled: boolean;
}

export interface SlaDefaults {
  externalHours: number;
  internalHours: number;
  bufferMinutes: number;
}

export interface RoleConfig {
  role: Role;
  canCreate: boolean;
  canViewAll: boolean;
  canClassify: boolean;
  canChangeStatus: boolean;
  canPause: boolean;
  canClose: boolean;
  canArchive: boolean;
  canAssign: boolean;
  canTransfer: boolean;
  canManageAutomation: boolean;
  canViewAudit: boolean;
  canExport: boolean;
  canEditSettings: boolean;
}
