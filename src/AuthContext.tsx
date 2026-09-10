import React, { useState, createContext, useContext } from 'react';
import { RoleType, RoleConfig, STATUS_CONFIGS, StatusType } from './types';

const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  operator: {
    key: 'operator',
    label: 'Оператор',
    canCreate: true,
    canChangeStatus: (from, to) => from === 'new' && to === 'classification',
    canAssign: false,
    canTransfer: false,
    canViewAll: true,
    canEditSettings: false,
    canExport: false,
    readOnly: false,
  },
  engineer: {
    key: 'engineer',
    label: 'Инженер',
    canCreate: true,
    canChangeStatus: (from, to) => {
      const allowed: [StatusType, StatusType][] = [
        ['classification', 'inProgress'],
        ['inProgress', 'waiting'],
        ['inProgress', 'paused'],
        ['inProgress', 'closed'],
        ['waiting', 'inProgress'],
        ['paused', 'inProgress'],
      ];
      return allowed.some(([f, t]) => f === from && t === to);
    },
    canAssign: true,
    canTransfer: false,
    canViewAll: false,
    canEditSettings: false,
    canExport: false,
    readOnly: false,
  },
  supervisor: {
    key: 'supervisor',
    label: 'Супервизор',
    canCreate: true,
    canChangeStatus: () => true,
    canAssign: true,
    canTransfer: true,
    canViewAll: true,
    canEditSettings: false,
    canExport: false,
    readOnly: false,
  },
  lead: {
    key: 'lead',
    label: 'Лид',
    canCreate: true,
    canChangeStatus: () => true,
    canAssign: true,
    canTransfer: true,
    canViewAll: true,
    canEditSettings: true,
    canExport: true,
    readOnly: false,
  },
  admin: {
    key: 'admin',
    label: 'Администратор',
    canCreate: true,
    canChangeStatus: () => true,
    canAssign: true,
    canTransfer: true,
    canViewAll: true,
    canEditSettings: true,
    canExport: true,
    readOnly: false,
  },
  auditor: {
    key: 'auditor',
    label: 'Аудитор',
    canCreate: false,
    canChangeStatus: () => false,
    canAssign: false,
    canTransfer: false,
    canViewAll: true,
    canEditSettings: false,
    canExport: true,
    readOnly: true,
  },
};

interface AuthContextType {
  currentRole: RoleType;
  setRole: (role: RoleType) => void;
  roleConfig: RoleConfig;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<RoleType>(() => {
    const stored = localStorage.getItem('helpdesk_currentRole');
    return (stored as RoleType) || 'operator';
  });

  const setRole = (role: RoleType) => {
    setCurrentRole(role);
    localStorage.setItem('helpdesk_currentRole', role);
  };

  const value = {
    currentRole,
    setRole,
    roleConfig: ROLE_CONFIGS[currentRole],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { ROLE_CONFIGS };
