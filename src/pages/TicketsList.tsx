import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Search, Filter, MoreVertical, ChevronDown } from 'lucide-react';

export default function TicketsList() {
  const navigate = useNavigate();
  const tickets = useAppStore((state) => state.tickets);
  const currentRole = useAppStore((state) => state.currentRole);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новая': return 'bg-blue-100 text-blue-800';
      case 'Классификация': return 'bg-orange-100 text-orange-800';
      case 'В работе': return 'bg-green-100 text-green-800';
      case 'Ждём ответа': return 'bg-yellow-100 text-yellow-800';
      case 'Пауза': return 'bg-gray-100 text-gray-800';
      case 'Закрыта': return 'bg-purple-100 text-purple-800';
      case 'Архив': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSlaStatus = (ticket: any) => {
    if (ticket.slaPaused) return { label: 'SLA остановлен', class: 'text-gray-500' };
    const now = new Date();
    const deadline = new Date(ticket.slaDeadline);
    const diff = deadline.getTime() - now.getTime();
    
    if (diff < 0) return { label: 'Просрочено', class: 'text-danger font-semibold' };
    if (diff < 30 * 60 * 1000) return { label: 'Скоро', class: 'text-warning font-semibold' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { label: `Осталось ${hours}ч ${minutes}м`, class: 'text-success' };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary">Заявки</h1>
          <p className="text-sm text-textMuted mt-1">{filteredTickets.length} заявок</p>
        </div>
        <button className="h-10 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primaryHover transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новая заявка
        </button>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white/85 backdrop-blur-md border-b border-border py-3 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 pr-8 bg-white border border-border rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Все статусы</option>
              <option value="Новая">Новая</option>
              <option value="Классификация">Классификация</option>
              <option value="В работе">В работе</option>
              <option value="Ждём ответа">Ждём ответа</option>
              <option value="Пауза">Пауза</option>
              <option value="Закрыта">Закрыта</option>
              <option value="Архив">Архив</option>
            </select>
            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
          </div>

          <button className="h-10 px-3 bg-white border border-border rounded-xl text-sm hover:bg-muted transition-colors flex items-center gap-2">
            <Filter size={16} />
            Фильтры
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr className="h-11">
              <th className="w-12 text-left px-4 text-xs font-medium text-textMuted">ID</th>
              <th className="text-left px-4 text-xs font-medium text-textMuted">Тема</th>
              <th className="w-48 text-left px-4 text-xs font-medium text-textMuted">Клиент</th>
              <th className="w-40 text-left px-4 text-xs font-medium text-textMuted">Статус</th>
              <th className="w-36 text-left px-4 text-xs font-medium text-textMuted">SLA</th>
              <th className="w-44 text-left px-4 text-xs font-medium text-textMuted">Исполнитель</th>
              <th className="w-36 text-left px-4 text-xs font-medium text-textMuted">Создана</th>
              <th className="w-14"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => {
              const slaStatus = getSlaStatus(ticket);
              return (
                <tr 
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="h-14 border-b border-border last:border-b-0 hover:bg-hover cursor-pointer transition-colors"
                >
                  <td className="px-4 font-mono text-sm text-textSecondary">{ticket.number}</td>
                  <td className="px-4">
                    <div>
                      <p className="font-medium text-sm truncate">{ticket.title}</p>
                      <p className="text-xs text-textMuted truncate">{ticket.type}</p>
                    </div>
                  </td>
                  <td className="px-4 text-sm">{ticket.client}</td>
                  <td className="px-4">
                    <span className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-pill text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${
                        ticket.status === 'Новая' ? 'bg-blue-500' :
                        ticket.status === 'Классификация' ? 'bg-orange-500' :
                        ticket.status === 'В работе' ? 'bg-green-500' :
                        ticket.status === 'Ждём ответа' ? 'bg-yellow-500' :
                        ticket.status === 'Пауза' ? 'bg-gray-500' :
                        ticket.status === 'Закрыта' ? 'bg-purple-500' :
                        'bg-gray-600'
                      }`} />
                      {ticket.status}
                    </span>
                  </td>
                  <td className={`px-4 text-sm ${slaStatus.class}`}>{slaStatus.label}</td>
                  <td className="px-4 text-sm">{ticket.assignee || '—'}</td>
                  <td className="px-4 text-sm text-textMuted">
                    {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4">
                    <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                      <MoreVertical size={16} className="text-textMuted" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredTickets.length === 0 && (
          <div className="py-12 text-center text-textMuted">
            <p>Заявки не найдены</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-textMuted">
        <p>Показано {filteredTickets.length} из {tickets.length}</p>
        <div className="flex gap-2">
          <button className="h-9 px-3 bg-white border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50" disabled>
            Назад
          </button>
          <button className="h-9 px-3 bg-white border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50" disabled>
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
}
