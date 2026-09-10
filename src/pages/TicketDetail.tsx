import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { ArrowLeft, MoreVertical, Phone, Monitor, MessageSquare, FileText } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tickets = useAppStore((state) => state.tickets);
  const currentRole = useAppStore((state) => state.currentRole);
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'audit'>('overview');

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <p className="text-textMuted">Заявка не найдена</p>
        <button onClick={() => navigate('/tickets')} className="mt-4 text-primary hover:underline">
          Вернуться к списку
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новая': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Классификация': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'В работе': return 'bg-green-100 text-green-800 border-green-200';
      case 'Ждём ответа': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Пауза': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Закрыта': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Архив': return 'bg-gray-200 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-textMuted">
        <button onClick={() => navigate('/tickets')} className="hover:text-textPrimary flex items-center gap-1">
          <ArrowLeft size={16} />
          Заявки
        </button>
        <span>/</span>
        <span className="font-mono">{ticket.number}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-4">
          {/* Header card */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-lg text-textSecondary">{ticket.number}</span>
                  <span className={`px-3 py-1 rounded-pill text-sm font-semibold border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    ticket.isClientTicket ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.isClientTicket ? 'Клиентская' : 'Внутренняя'}
                  </span>
                </div>
                <h1 className="text-xl font-semibold text-textPrimary mb-2">{ticket.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-textMuted">
                  <span>Клиент: <strong className="text-textPrimary">{ticket.client}</strong></span>
                  <span>Тип: <strong className="text-textPrimary">{ticket.type}</strong></span>
                  <span>Приоритет: <strong className="text-textPrimary">{ticket.priority}</strong></span>
                  <span>Линия: <strong className="text-textPrimary">{ticket.line}</strong></span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="h-9 px-3 bg-white border border-border rounded-xl text-sm hover:bg-muted transition-colors flex items-center gap-2">
                  <MoreVertical size={16} />
                  Ещё
                </button>
                <button className="h-9 px-4 bg-primary text-white rounded-xl text-sm hover:bg-primaryHover transition-colors">
                  Сменить статус
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mt-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-textMuted hover:text-textPrimary'
                }`}
              >
                Обзор
              </button>
              <button
                onClick={() => setActiveTab('interactions')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'interactions' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-textMuted hover:text-textPrimary'
                }`}
              >
                Взаимодействия ({ticket.interactions.length})
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'audit' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-textMuted hover:text-textPrimary'
                }`}
              >
                Аудит-лог ({ticket.auditLog.length})
              </button>
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <>
              <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
                <h2 className="font-semibold mb-3">Описание</h2>
                <p className="text-textSecondary whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
                <h2 className="font-semibold mb-3">Параметры</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-textMuted">Канал обращения:</span>
                    <p className="font-medium">{ticket.channelIn}</p>
                  </div>
                  <div>
                    <span className="text-textMuted">Исполнитель:</span>
                    <p className="font-medium">{ticket.assignee || 'Не назначен'}</p>
                  </div>
                  <div>
                    <span className="text-textMuted">Создана:</span>
                    <p className="font-medium">{new Date(ticket.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                  <div>
                    <span className="text-textMuted">Обновлена:</span>
                    <p className="font-medium">{new Date(ticket.updatedAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'interactions' && (
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <h2 className="font-semibold mb-4">Лента взаимодействий</h2>
              
              {/* Composer placeholder */}
              <div className="mb-6 p-4 bg-muted rounded-xl">
                <textarea
                  placeholder="Добавить комментарий..."
                  className="w-full min-h-[96px] p-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center">
                      <MessageSquare size={16} className="text-textMuted" />
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center">
                      <Phone size={16} className="text-textMuted" />
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center">
                      <Monitor size={16} className="text-textMuted" />
                    </button>
                  </div>
                  <button className="h-9 px-4 bg-primary text-white rounded-lg text-sm hover:bg-primaryHover">
                    Отправить
                  </button>
                </div>
              </div>

              {/* Interactions list */}
              <div className="space-y-4">
                {ticket.interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className={`p-4 rounded-xl border ${
                      interaction.type === 'note' 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-white border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        interaction.type === 'message' ? 'bg-blue-100' :
                        interaction.type === 'note' ? 'bg-yellow-100' :
                        interaction.type === 'call' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        {interaction.type === 'message' && <MessageSquare size={14} />}
                        {interaction.type === 'note' && <FileText size={14} />}
                        {interaction.type === 'call' && <Phone size={14} />}
                        {interaction.type === 'connection' && <Monitor size={14} />}
                      </span>
                      <span className="text-sm font-medium">{interaction.author}</span>
                      <span className="text-xs text-textMuted">
                        {new Date(interaction.timestamp).toLocaleString('ru-RU')}
                      </span>
                      {interaction.duration && (
                        <span className="text-xs text-textMuted ml-auto">{interaction.duration}</span>
                      )}
                    </div>
                    <p className="text-sm text-textSecondary">{interaction.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <h2 className="font-semibold mb-4">История изменений</h2>
              <div className="space-y-4">
                {ticket.auditLog.map((entry) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primarySoft flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{entry.action}</span>
                        {entry.oldValue && entry.newValue && (
                          <span className="text-textMuted">: {entry.oldValue} → {entry.newValue}</span>
                        )}
                      </p>
                      <p className="text-xs text-textMuted mt-1">
                        {entry.author} • {new Date(entry.timestamp).toLocaleString('ru-RU')}
                        {entry.reason && ` • Причина: ${entry.reason}`}
                        {entry.comment && ` • ${entry.comment}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-textMuted mt-4 pt-4 border-t border-border">
                Записи не удаляются (демо-эмуляция)
              </p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* SLA Card */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <h3 className="font-semibold mb-3">SLA</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-textMuted">Норматив:</span>
                <span className="text-sm font-medium">8 часов</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textMuted">Статус:</span>
                <span className={`text-sm font-medium ${
                  ticket.slaPaused ? 'text-gray-500' : 
                  new Date(ticket.slaDeadline) < new Date() ? 'text-danger' : 'text-success'
                }`}>
                  {ticket.slaPaused ? 'Остановлен' : 
                   new Date(ticket.slaDeadline) < new Date() ? 'Просрочено' : 'В норме'}
                </span>
              </div>
              {!ticket.slaPaused && (
                <div className="pt-3 border-t border-border">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        new Date(ticket.slaDeadline) < new Date() ? 'bg-danger' : 'bg-success'
                      }`}
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>
              )}
              {ticket.pauseReason && (
                <p className="text-xs text-textMuted pt-2">
                  Причина паузы: {ticket.pauseReason}
                </p>
              )}
            </div>
          </div>

          {/* Assignee Card */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <h3 className="font-semibold mb-3">Исполнитель</h3>
            {ticket.assignee ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                  {ticket.assignee.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{ticket.assignee}</p>
                  <p className="text-xs text-textMuted">Инженер</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-textMuted">Не назначен</p>
            )}
            <button className="w-full mt-3 h-9 bg-white border border-border rounded-xl text-sm hover:bg-muted transition-colors">
              Переназначить
            </button>
          </div>

          {/* Integrations placeholders */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <h3 className="font-semibold mb-3">Интеграции</h3>
            <div className="space-y-2">
              {['Телефония', 'УСП', 'Бухгалтерия', 'SSO', 'Трекер'].map((integration) => (
                <button
                  key={integration}
                  className="w-full h-9 px-3 bg-white border border-border rounded-lg text-sm hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <span>{integration}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Mock</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
