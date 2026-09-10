import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { generateDemoData } from '../utils/demoData';

export default function Dashboard() {
  const tickets = useAppStore((state) => state.tickets);
  const resetDemoData = useAppStore((state) => state.resetDemoData);

  // Initialize demo data on first load
  useEffect(() => {
    if (tickets.length === 0) {
      resetDemoData();
    }
  }, [tickets.length, resetDemoData]);

  const openCount = tickets.filter(t => !['Закрыта', 'Архив'].includes(t.status)).length;
  const overdueCount = tickets.filter(t => {
    if (t.slaPaused) return false;
    return new Date(t.slaDeadline) < new Date();
  }).length;
  const waitingCount = tickets.filter(t => t.status === 'Ждём ответа').length;
  const closedToday = tickets.filter(t => {
    if (t.status !== 'Закрыта') return false;
    const today = new Date().toDateString();
    return new Date(t.updatedAt).toDateString() === today;
  }).length;

  const statusCounts: Record<string, number> = {};
  tickets.forEach(t => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-textPrimary">Дашборд</h1>
        <div className="flex gap-2">
          <button className="h-9 px-4 bg-white border border-border rounded-xl text-sm hover:bg-muted transition-colors">
            Обновить
          </button>
          <button className="h-9 px-4 bg-primary text-white rounded-xl text-sm hover:bg-primaryHover transition-colors">
            Экспорт
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-textSecondary">Открытые заявки</span>
            <div className="w-8 h-8 bg-primarySoft rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-textPrimary">{openCount}</p>
          <p className="text-xs text-textMuted mt-1">Все активные заявки</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-textSecondary">Просрочено SLA</span>
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-danger">{overdueCount}</p>
          <p className="text-xs text-textMuted mt-1">Требуют внимания</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-textSecondary">Ждём ответа</span>
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-warning">{waitingCount}</p>
          <p className="text-xs text-textMuted mt-1">Ожидание клиента/смежника</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-textSecondary">Закрыто сегодня</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-success">{closedToday}</p>
          <p className="text-xs text-textMuted mt-1">Успешно решено</p>
        </div>
      </div>

      {/* Status distribution */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Динамика заявок за 7 дней</h2>
          <div className="h-64 flex items-center justify-center text-textMuted">
            <p>График будет здесь (демо)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Распределение по статусам</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'Новая' ? 'bg-blue-500' :
                    status === 'Классификация' ? 'bg-orange-500' :
                    status === 'В работе' ? 'bg-green-500' :
                    status === 'Ждём ответа' ? 'bg-yellow-500' :
                    status === 'Пауза' ? 'bg-gray-500' :
                    status === 'Закрыта' ? 'bg-purple-500' :
                    'bg-gray-700'
                  }`} />
                  <span className="text-sm">{status}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attention required */}
      <div className="mt-6 bg-white rounded-2xl p-5 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Требуют внимания</h2>
          <button className="text-sm text-primary hover:underline">Все заявки</button>
        </div>
        <div className="space-y-2">
          {tickets
            .filter(t => {
              if (t.slaPaused) return false;
              return new Date(t.slaDeadline) < new Date() || 
                     new Date(t.slaDeadline).getTime() - new Date().getTime() < 30 * 60 * 1000;
            })
            .slice(0, 5)
            .map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{ticket.number} — {ticket.title}</p>
                  <p className="text-xs text-textMuted">{ticket.client}</p>
                </div>
                <span className="text-xs text-danger font-medium">
                  {new Date(ticket.slaDeadline) < new Date() 
                    ? `Просрочено` 
                    : 'Скоро истечёт'}
                </span>
              </div>
            ))}
          {tickets.filter(t => !t.slaPaused && new Date(t.slaDeadline) < new Date()).length === 0 && (
            <p className="text-center text-textMuted py-8">Нет заявок, требующих внимания</p>
          )}
        </div>
      </div>
    </div>
  );
}
