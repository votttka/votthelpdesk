export type Role = 'operator' | 'engineer' | 'supervisor' | 'lead' | 'admin' | 'auditor';

export type TicketStatus = 
  | 'new' 
  | 'classification' 
  | 'in_progress' 
  | 'waiting_response' 
  | 'pause' 
  | 'closed' 
  | 'archived';

export type PauseReason = 
  | 'waiting_client' 
  | 'waiting_partner' 
  | 'planned_works' 
  | 'vacation' 
  | 'other';

export type WaitingReason = 
  | 'waiting_client' 
  | 'waiting_department' 
  | 'waiting_external' 
  | 'other';

export type ResolutionChannel = 'remote' | 'phone' | 'chat' | 'onsite';

export type TicketType = 
  | 'config_update' 
  | 'data_exchange' 
  | 'reporting_error' 
  | 'consultation' 
  | 'password_reset' 
  | 'update_install' 
  | 'access_setup' 
  | 'other';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  author: string;
  authorRole: Role;
  details?: Record<string, unknown>;
}

export interface Interaction {
  id: string;
  type: 'comment' | 'call' | 'connection';
  content: string;
  author: string;
  authorRole: Role;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Ticket {
  id: string;
  number: string;
  topic: string;
  description: string;
  contractor: string;
  type: TicketType;
  typeComment?: string;
  isClientTicket: boolean;
  status: TicketStatus;
  assignee?: string;
  line: number;
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string;
  slaDeadline: string;
  pausedAt?: string;
  pauseReason?: PauseReason;
  waitingReason?: WaitingReason;
  resolutionChannel?: ResolutionChannel;
  resolutionComment?: string;
  auditLog: AuditLogEntry[];
  interactions: Interaction[];
  slaPaused: boolean;
  totalPausedTime: number;
}

export interface SLASettings {
  defaultHours: number;
  byType: Record<TicketType, number>;
  internalBufferMinutes: number;
}

export interface AutomationSettings {
  autoResumeWaitingHours: number;
  autoArchiveDays: number;
  slaWarningMinutes: number;
  enableAutoResume: boolean;
  enableAutoArchive: boolean;
  enableSlaWarning: boolean;
}

export interface StatusConfig {
  status: TicketStatus;
  label: string;
  color: string;
  slaRunning: boolean;
}

export interface RolePermissions {
  canViewAll: boolean;
  canViewTeam: boolean;
  canViewOwn: boolean;
  canCreate: boolean;
  canChangeStatuses: TicketStatus[];
  canReassign: boolean;
  canTransferLines: boolean;
  canEditSettings: boolean;
  canExport: boolean;
  canDeleteUsers: boolean;
  readOnly: boolean;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  team?: string;
}

export interface AppState {
  tickets: Ticket[];
  users: User[];
  currentUserId: string;
  slaSettings: SLASettings;
  automationSettings: AutomationSettings;
  statusConfigs: StatusConfig[];
  rolePermissions: Record<Role, RolePermissions>;
}
