import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Menu, LayoutDashboard, Ticket, BarChart3, Settings as SettingsIcon,
  Bell, Plus, User, Shield, Search, ChevronDown, LogOut, RefreshCcw
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Role } from '../types';

const roles: Role[] = ['Оператор', 'Инженер', 'Классификатор', 'Супервизор', 'Лид', 'Администратор', 'Аудитор'];

export default function Layout() {
  const location = useLocation();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const currentRole = useAppStore((state) => state.currentRole);
  const setCurrentRole = useAppStore((state) => state.setCurrentRole);
  const tickets = useAppStore((state) => state.tickets);
  const resetDemoData = useAppStore((state) => state.resetDemoData);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);

  const openTickets = tickets.filter(t => !['Закрыта', 'Архив'].includes(t.status));
  const overdueTickets = tickets.filter(t => {
    if (t.slaPaused) return false;
    return new Date(t.slaDeadline) < new Date();
  });

  const navItems = [
    { icon: LayoutDashboard, label: 'Дашборд', path: '/' },
    { icon: Ticket, label: 'Заявки', path: '/tickets' },
    { icon: BarChart3, label: 'Воронка', path: '/funnel' },
    { icon: Ticket, label: 'Мои заявки', path: '/my-tickets' },
    { icon: Bell, label: 'Просрочено SLA', path: '/overdue', badge: overdueTickets.length },
    { icon: Ticket, label: 'Ждём ответа', path: '/waiting' },
    { icon: Ticket, label: 'На паузе', path: '/paused' },
    { icon: Ticket, label: 'Архив', path: '/archive' },
  ];

  const adminItems = [
    { icon: SettingsIcon, label: 'Настройки', path: '/settings' },
  ];

  const canSeeAdmin = ['Лид', 'Администратор'].includes(currentRole);

  return (
    <div className="min-h-screen bg-bg">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-border z-50 flex items-center px-4">
        {/* Burger */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center mr-4"
        >
          <Menu size={20} className="text-textSecondary" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mr-8">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-textPrimary">HelpDesk Prototype</span>
          )}
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Поиск по номеру, клиенту, теме"
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-muted border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Role selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="h-10 px-3 bg-white border border-border rounded-xl flex items-center gap-2 hover:bg-muted transition-colors"
            >
              <Shield size={16} className="text-textSecondary" />
              <span className="text-sm font-medium">{currentRole}</span>
              <ChevronDown size={16} className="text-textMuted" />
            </button>
            {showRoleDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-md border border-border py-1 z-50">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${
                      currentRole === role ? 'bg-primarySoft text-primary' : ''
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New ticket button */}
          <Link to="/tickets?new=true">
            <button className="h-10 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primaryHover transition-colors flex items-center gap-2">
              <Plus size={18} />
              Новая заявка
            </button>
          </Link>

          {/* Notifications */}
          <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center relative">
            <Bell size={20} className="text-textSecondary" />
            {overdueTickets.length > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">
                {overdueTickets.length}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-medium hover:bg-primaryHover transition-colors"
            >
              <User size={18} />
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-md border border-border py-1 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="font-medium text-sm">Текущий пользователь</p>
                  <p className="text-xs text-textMuted">{currentRole}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                  <SettingsIcon size={16} />
                  Настройки
                </button>
                <button 
                  onClick={() => {
                    resetDemoData();
                    setShowUserDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-warning"
                >
                  <RefreshCcw size={16} />
                  Сбросить демо-данные
                </button>
                <div className="border-t border-border mt-1 pt-1">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-textMuted">
                    <LogOut size={16} />
                    Выйти (демо)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-border z-40 transition-all duration-200 ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}>
        <nav className="p-4 space-y-1 overflow-y-auto h-full">
          <div className="mb-4">
            <p className={`text-xs font-semibold text-textMuted uppercase mb-2 ${
              sidebarCollapsed ? 'text-center' : ''
            }`}>
              {sidebarCollapsed ? '•••' : 'Обзор'}
            </p>
            {navItems.slice(0, 3).map((item) => (
              <Link key={item.path} to={item.path}>
                <div className={`h-11 flex items-center gap-3 px-3 rounded-xl cursor-pointer transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-primarySoft text-primary' 
                    : 'hover:bg-muted'
                }`}>
                  <item.icon size={20} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.label.includes('SLA') ? 'bg-danger text-white' : 'bg-primarySoft text-primary'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mb-4">
            <p className={`text-xs font-semibold text-textMuted uppercase mb-2 ${
              sidebarCollapsed ? 'text-center' : ''
            }`}>
              {sidebarCollapsed ? '•••' : 'Очереди'}
            </p>
            {navItems.slice(3).map((item) => (
              <Link key={item.path} to={item.path}>
                <div className={`h-11 flex items-center gap-3 px-3 rounded-xl cursor-pointer transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-primarySoft text-primary' 
                    : 'hover:bg-muted'
                }`}>
                  <item.icon size={20} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-danger text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {canSeeAdmin && (
            <div>
              <p className={`text-xs font-semibold text-textMuted uppercase mb-2 ${
                sidebarCollapsed ? 'text-center' : ''
              }`}>
                {sidebarCollapsed ? '•••' : 'Администрирование'}
              </p>
              {adminItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <div className={`h-11 flex items-center gap-3 px-3 rounded-xl cursor-pointer transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-primarySoft text-primary' 
                      : 'hover:bg-muted'
                  }`}>
                    <item.icon size={20} />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Bottom info */}
          {!sidebarCollapsed && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-3 bg-success/10 rounded-xl">
                <p className="text-xs font-medium text-success">✓ Автоматика включена</p>
              </div>
              <button
                onClick={resetDemoData}
                className="mt-2 w-full h-9 text-xs text-textMuted hover:text-textPrimary transition-colors"
              >
                Сбросить демо-данные
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className={`ml-${sidebarCollapsed ? '18' : '64'} mt-16 p-6`}>
        <Outlet />
      </main>
    </div>
  );
}
