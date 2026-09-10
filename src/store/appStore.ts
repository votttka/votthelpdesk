import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ticket, Role, StatusConfig, Settings, AuditEntry, Interaction } from '../types';
import { generateDemoData } from '../utils/demoData';

interface AppState {
  currentRole: Role;
  tickets: Ticket[];
  settings: Settings;
  sidebarCollapsed: boolean;
  searchQuery: string;
  
  // Actions
  setCurrentRole: (role: Role) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchQuery: (query: string) => void;
  
  // Ticket actions
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  changeStatus: (id: string, newStatus: string, reason?: string, comment?: string, channelOut?: string) => void;
  assignTicket: (id: string, assignee: string) => void;
  transferTicket: (id: string, line: number, assignee: string, reason: string, comment: string) => void;
  addInteraction: (id: string, interaction: Interaction) => void;
  addAuditEntry: (id: string, entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Demo actions
  resetDemoData: () => void;
}

const defaultSettings: Settings = {
  statuses: [
    { id: 'Новая', label: 'Новая', color: '#3B82F6', softColor: '#EAF2FF', textColor: '#1D4ED8', slaRunning: true },
    { id: 'Классификация', label: 'Классификация', color: '#F97316', softColor: '#FFF3E8', textColor: '#C2410C', slaRunning: true },
    { id: 'В работе', label: 'В работе', color: '#10B981', softColor: '#E8F8F1', textColor: '#047857', slaRunning: true },
    { id: 'Ждём ответа', label: 'Ждём ответа', color: '#F59E0B', softColor: '#FFF7E8', textColor: '#B45309', slaRunning: false },
    { id: 'Пауза', label: 'Пауза', color: '#64748B', softColor: '#F1F5F9', textColor: '#475569', slaRunning: false },
    { id: 'Закрыта', label: 'Закрыта', color: '#8B5CF6', softColor: '#F4EEFF', textColor: '#6D28D9', slaRunning: false },
    { id: 'Архив', label: 'Архив', color: '#475569', softColor: '#E2E8F0', textColor: '#334155', slaRunning: false },
  ],
  transitions: [],
  automation: {
    autoReturnFromWaitEnabled: true,
    autoReturnFromWaitHours: 24,
    autoArchiveEnabled: true,
    autoArchiveDays: 30,
    slaAlertEnabled: true,
    slaAlertMinutes: 30,
    autoClassificationEnabled: false,
  },
  slaDefaults: {
    externalHours: 8,
    internalHours: 6,
    bufferMinutes: 30,
  },
  roles: [
    { role: 'Оператор', canCreate: true, canViewAll: true, canClassify: true, canChangeStatus: false, canPause: false, canClose: false, canArchive: false, canAssign: false, canTransfer: false, canManageAutomation: false, canViewAudit: true, canExport: false, canEditSettings: false },
    { role: 'Инженер', canCreate: false, canViewAll: false, canClassify: false, canChangeStatus: true, canPause: true, canClose: true, canArchive: false, canAssign: true, canTransfer: false, canManageAutomation: false, canViewAudit: true, canExport: false, canEditSettings: false },
    { role: 'Классификатор', canCreate: false, canViewAll: true, canClassify: true, canChangeStatus: true, canPause: false, canClose: false, canArchive: false, canAssign: true, canTransfer: false, canManageAutomation: false, canViewAudit: true, canExport: false, canEditSettings: false },
    { role: 'Супервизор', canCreate: false, canViewAll: true, canClassify: true, canChangeStatus: true, canPause: true, canClose: true, canArchive: true, canAssign: true, canTransfer: true, canManageAutomation: false, canViewAudit: true, canExport: true, canEditSettings: false },
    { role: 'Лид', canCreate: false, canViewAll: true, canClassify: true, canChangeStatus: true, canPause: true, canClose: true, canArchive: true, canAssign: true, canTransfer: true, canManageAutomation: true, canViewAudit: true, canExport: true, canEditSettings: false },
    { role: 'Администратор', canCreate: true, canViewAll: true, canClassify: true, canChangeStatus: true, canPause: true, canClose: true, canArchive: true, canAssign: true, canTransfer: true, canManageAutomation: true, canViewAudit: true, canExport: true, canEditSettings: true },
    { role: 'Аудитор', canCreate: false, canViewAll: true, canClassify: false, canChangeStatus: false, canPause: false, canClose: false, canArchive: false, canAssign: false, canTransfer: false, canManageAutomation: false, canViewAudit: true, canExport: true, canEditSettings: false },
  ],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentRole: 'Оператор',
      tickets: [],
      settings: defaultSettings,
      sidebarCollapsed: false,
      searchQuery: '',

      setCurrentRole: (role) => set({ currentRole: role }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      addTicket: (ticket) => set((state) => ({ 
        tickets: [ticket, ...state.tickets] 
      })),

      updateTicket: (id, updates) => set((state) => ({
        tickets: state.tickets.map((t) => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        )
      })),

      deleteTicket: (id) => set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id)
      })),

      changeStatus: (id, newStatus, reason, comment, channelOut) => {
        const state = get();
        const ticket = state.tickets.find((t) => t.id === id);
        if (!ticket) return;

        const statusConfig = state.settings.statuses.find((s) => s.id === newStatus as any);
        const updates: Partial<Ticket> = {
          status: newStatus as any,
          slaPaused: statusConfig ? !statusConfig.slaRunning : false,
          pauseReason: reason,
          ...(channelOut && { channelOut }),
          ...(newStatus === 'Закрыта' && { resolution: channelOut }),
        };

        if (newStatus === 'Ждём ответа' && state.settings.automation.autoReturnFromWaitEnabled) {
          const returnDate = new Date();
          returnDate.setHours(returnDate.getHours() + state.settings.automation.autoReturnFromWaitHours);
          updates.waitAutoReturnAt = returnDate.toISOString();
        }

        if (newStatus === 'Пауза' && reason) {
          const pauseUntil = new Date();
          if (reason.includes('клиента') || reason.includes('смежника')) {
            updates.slaPaused = true;
          }
          updates.pauseUntil = pauseUntil.toISOString();
        }

        get().updateTicket(id, updates);
        get().addAuditEntry(id, {
          action: `Статус изменён с "${ticket.status}" на "${newStatus}"`,
          author: 'Текущий пользователь',
          authorRole: state.currentRole,
          oldValue: ticket.status,
          newValue: newStatus,
          reason: reason,
          comment: comment,
        });
      },

      assignTicket: (id, assignee) => {
        const state = get();
        const ticket = state.tickets.find((t) => t.id === id);
        if (!ticket) return;

        get().updateTicket(id, { assignee });
        get().addAuditEntry(id, {
          action: 'Назначен исполнитель',
          author: 'Текущий пользователь',
          authorRole: state.currentRole,
          oldValue: ticket.assignee || 'Не назначен',
          newValue: assignee,
        });
      },

      transferTicket: (id, line, assignee, reason, comment) => {
        const state = get();
        const ticket = state.tickets.find((t) => t.id === id);
        if (!ticket) return;

        get().updateTicket(id, { line, assignee });
        get().addAuditEntry(id, {
          action: `Передача заявки`,
          author: 'Текущий пользователь',
          authorRole: state.currentRole,
          oldValue: `Линия ${ticket.line}, ${ticket.assignee || 'без исполнителя'}`,
          newValue: `Линия ${line}, ${assignee}`,
          reason: reason,
          comment: comment,
        });
      },

      addInteraction: (id, interaction) => {
        const state = get();
        const ticket = state.tickets.find((t) => t.id === id);
        if (!ticket) return;

        get().updateTicket(id, {
          interactions: [...ticket.interactions, interaction],
        });

        if (interaction.type !== 'system') {
          get().addAuditEntry(id, {
            action: `Добавлено взаимодействие: ${interaction.type}`,
            author: interaction.author,
            authorRole: interaction.authorRole,
            comment: interaction.content.substring(0, 50),
          });
        }
      },

      addAuditEntry: (id, entry) => {
        const state = get();
        const ticket = state.tickets.find((t) => t.id === id);
        if (!ticket) return;

        const newEntry: AuditEntry = {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };

        get().updateTicket(id, {
          auditLog: [...ticket.auditLog, newEntry],
        });
      },

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetDemoData: () => {
        const demoData = generateDemoData();
        set({ tickets: demoData });
      },
    }),
    {
      name: 'helpdesk-storage',
      partialize: (state) => ({ 
        tickets: state.tickets, 
        settings: state.settings,
        currentRole: state.currentRole 
      }),
    }
  )
);
