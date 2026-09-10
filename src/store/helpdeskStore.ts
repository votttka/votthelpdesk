import { create } from 'zustand';
import type { AppState, Ticket, TicketStatus, Role, Interaction, AuditLogEntry, PauseReason, WaitingReason, ResolutionChannel } from '../types';
import { getInitialState, saveState } from '../data/mockData';

interface HelpDeskStore extends AppState {
  // Actions
  setCurrentUser: (userId: string) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  changeStatus: (
    ticketId: string, 
    newStatus: TicketStatus, 
    author: string, 
    authorRole: Role,
    options?: {
      pauseReason?: PauseReason;
      waitingReason?: WaitingReason;
      resolutionChannel?: ResolutionChannel;
      resolutionComment?: string;
      comment?: string;
    }
  ) => boolean;
  addInteraction: (ticketId: string, interaction: Interaction) => void;
  addAuditLog: (ticketId: string, entry: AuditLogEntry) => void;
  createTicket: (ticket: Omit<Ticket, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'statusChangedAt' | 'slaDeadline' | 'auditLog' | 'interactions' | 'slaPaused' | 'totalPausedTime'>) => Ticket;
  resetData: () => void;
  runAutomation: () => void;
}

export const useHelpDeskStore = create<HelpDeskStore>((set, get) => ({
  ...getInitialState(),
  
  setCurrentUser: (userId: string) => {
    set({ currentUserId: userId });
    const state = get();
    saveState(state);
  },
  
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => {
    set((state) => {
      const newTickets = state.tickets.map((t) =>
        t.id === ticketId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      );
      const newState = { ...state, tickets: newTickets };
      saveState(newState);
      return newState;
    });
  },
  
  changeStatus: (
    ticketId: string,
    newStatus: TicketStatus,
    author: string,
    authorRole: Role,
    options = {}
  ): boolean => {
    const state = get();
    const ticket = state.tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;
    
    const permissions = state.rolePermissions[authorRole];
    if (!permissions.canChangeStatuses.includes(newStatus)) {
      return false;
    }
    
    const now = new Date();
    const auditEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: now.toISOString(),
      action: 'status_changed',
      author,
      authorRole,
      details: { from: ticket.status, to: newStatus, ...options }
    };
    
    let interaction: Interaction | null = null;
    if (options.comment) {
      interaction = {
        id: crypto.randomUUID(),
        type: 'comment',
        content: options.comment,
        author,
        authorRole,
        timestamp: now.toISOString()
      };
    }
    
    set((state) => {
      const newTickets = state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        
        const updates: Partial<Ticket> = {
          status: newStatus,
          statusChangedAt: now.toISOString(),
          updatedAt: now.toISOString(),
          auditLog: [...t.auditLog, auditEntry],
          interactions: interaction ? [...t.interactions, interaction] : t.interactions
        };
        
        // Handle SLA pause
        if (newStatus === 'waiting_response' || newStatus === 'pause') {
          updates.slaPaused = true;
          updates.pausedAt = now.toISOString();
          if (options.pauseReason) updates.pauseReason = options.pauseReason;
          if (options.waitingReason) updates.waitingReason = options.waitingReason;
        } else if (t.slaPaused && (newStatus === 'in_progress' || newStatus === 'classification')) {
          updates.slaPaused = false;
          if (t.pausedAt) {
            const pausedDuration = now.getTime() - new Date(t.pausedAt).getTime();
            updates.totalPausedTime = t.totalPausedTime + pausedDuration;
          }
          updates.pausedAt = undefined;
        }
        
        // Handle resolution
        if (newStatus === 'closed') {
          updates.resolutionChannel = options.resolutionChannel;
          updates.resolutionComment = options.resolutionComment;
        }
        
        return { ...t, ...updates };
      });
      
      const newState = { ...state, tickets: newTickets };
      saveState(newState);
      return newState;
    });
    
    return true;
  },
  
  addInteraction: (ticketId: string, interaction: Interaction) => {
    set((state) => {
      const newTickets = state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, interactions: [...t.interactions, interaction], updatedAt: new Date().toISOString() }
          : t
      );
      const newState = { ...state, tickets: newTickets };
      saveState(newState);
      return newState;
    });
  },
  
  addAuditLog: (ticketId: string, entry: AuditLogEntry) => {
    set((state) => {
      const newTickets = state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, auditLog: [...t.auditLog, entry], updatedAt: new Date().toISOString() }
          : t
      );
      const newState = { ...state, tickets: newTickets };
      saveState(newState);
      return newState;
    });
  },
  
  createTicket: (ticketData) => {
    const state = get();
    const now = new Date();
    const nextNumber = state.tickets.length + 1;
    const number = `INC-${String(1000 + nextNumber).padStart(6, '0')}`;
    
    const slaHours = state.slaSettings.byType[ticketData.type] || state.slaSettings.defaultHours;
    const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString();
    
    const currentUser = state.users.find((u) => u.id === state.currentUserId);
    
    const auditEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: now.toISOString(),
      action: 'created',
      author: currentUser?.name || 'Unknown',
      authorRole: currentUser?.role || 'operator',
      details: { topic: ticketData.topic }
    };
    
    const interaction: Interaction = {
      id: crypto.randomUUID(),
      type: 'comment',
      content: 'Заявка создана.',
      author: currentUser?.name || 'Unknown',
      authorRole: currentUser?.role || 'operator',
      timestamp: now.toISOString()
    };
    
    const newTicket: Ticket = {
      ...ticketData,
      id: crypto.randomUUID(),
      number,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      statusChangedAt: now.toISOString(),
      slaDeadline,
      auditLog: [auditEntry],
      interactions: [interaction],
      slaPaused: false,
      totalPausedTime: 0
    };
    
    set((state) => {
      const newState = { ...state, tickets: [...state.tickets, newTicket] };
      saveState(newState);
      return newState;
    });
    
    return newTicket;
  },
  
  resetData: () => {
    const initialState = getInitialState();
    set(initialState);
    saveState(initialState);
  },
  
  runAutomation: () => {
    const state = get();
    const now = new Date();
    const autoResumeHours = state.automationSettings.autoResumeWaitingHours * 60 * 60 * 1000;
    const autoArchiveDays = state.automationSettings.autoArchiveDays;
    
    let hasChanges = false;
    
    const newTickets = state.tickets.map((ticket) => {
      if (!state.automationSettings.enableAutoResume && !state.automationSettings.enableAutoArchive) {
        return ticket;
      }
      
      // Auto-resume from waiting_response after 24 hours
      if (
        state.automationSettings.enableAutoResume &&
        ticket.status === 'waiting_response' &&
        ticket.pausedAt
      ) {
        const waitingTime = now.getTime() - new Date(ticket.pausedAt).getTime();
        if (waitingTime >= autoResumeHours) {
          hasChanges = true;
          const auditEntry: AuditLogEntry = {
            id: crypto.randomUUID(),
            timestamp: now.toISOString(),
            action: 'auto_resumed',
            author: 'System',
            authorRole: 'operator',
            details: { reason: 'Auto-resume after 24h waiting' }
          };
          
          return {
            ...ticket,
            status: 'in_progress' as TicketStatus,
            statusChangedAt: now.toISOString(),
            updatedAt: now.toISOString(),
            slaPaused: false,
            pausedAt: undefined,
            auditLog: [...ticket.auditLog, auditEntry]
          };
        }
      }
      
      // Auto-archive closed tickets after 30 days
      if (
        state.automationSettings.enableAutoArchive &&
        ticket.status === 'closed'
      ) {
        const closedTime = now.getTime() - new Date(ticket.statusChangedAt).getTime();
        const archiveThreshold = autoArchiveDays * 24 * 60 * 60 * 1000;
        if (closedTime >= archiveThreshold) {
          hasChanges = true;
          const auditEntry: AuditLogEntry = {
            id: crypto.randomUUID(),
            timestamp: now.toISOString(),
            action: 'auto_archived',
            author: 'System',
            authorRole: 'operator' as Role,
            details: { reason: 'Auto-archive after 30 days' }
          };
          
          return {
            ...ticket,
            status: 'archived' as TicketStatus,
            statusChangedAt: now.toISOString(),
            updatedAt: now.toISOString(),
            auditLog: [...ticket.auditLog, auditEntry]
          };
        }
      }
      
      return ticket;
    });
    
    if (hasChanges) {
      const newState = { ...state, tickets: newTickets };
      saveState(newState);
      set(newState);
    }
  }
}));
