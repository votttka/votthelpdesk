import { useState } from 'react';
import { useAppStore } from '../store/appStore';

export default function Settings() {
  const currentRole = useAppStore((state) => state.currentRole);
  const settings = useAppStore((state) => state.settings);
  
  const canEdit = ['Лид', 'Администратор'].includes(currentRole);
  const [activeTab, setActiveTab] = useState<'statuses' | 'automation' | 'sla' | 'roles'>('statuses');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary">Настройки</h1>
          <p className="text-sm text-textMuted mt-1">Демо-конфигурация системы</p>
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-4 bg-white border border-border rounded-xl text-sm hover:bg-muted transition-colors">
            Сбросить настройки
          </button>
          <button className="h-9 px-4 bg-primary text-white rounded-xl text-sm hover:bg-primaryHover transition-colors">
            Сохранить
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {[
          { id: 'statuses', label: 'Статусы' },
          { id: 'automation', label: 'Автоматика' },
          { id: 'sla', label: 'SLA' },
          { id: 'roles', label: 'Роли' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-textMuted hover:text-textPrimary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!canEdit && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-warning">
            Просмотр в режиме чтения. Только Лид и Администратор могут редактировать настройки.
          </p>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'statuses' && (
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="font-semibold mb-4">Статусы и переходы</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-textMuted border-b border-border">
                <th className="pb-3 font-medium">Статус</th>
                <th className="pb-3 font-medium">Цвет</th>
                <th className="pb-3 font-medium">Таймер SLA</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {settings.statuses.map((status) => (
                <tr key={status.id} className="border-b border-border last:border-b-0">
                  <td className="py-3">
                    <span className="font-medium">{status.label}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-3 rounded"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm text-textMuted font-mono">{status.color}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`text-sm ${status.slaRunning ? 'text-success' : 'text-gray-500'}`}>
                      {status.slaRunning ? 'Идёт' : 'Остановлен'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {canEdit && (
                      <button className="text-sm text-primary hover:underline">
                        Редактировать
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="font-semibold mb-4">Автоматика</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium">Автопереход из "Ждём ответа"</p>
                <p className="text-sm text-textMuted mt-1">Через {settings.automation.autoReturnFromWaitHours} ч</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.automation.autoReturnFromWaitEnabled}
                  disabled={!canEdit}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium">Автоархивация закрытых заявок</p>
                <p className="text-sm text-textMuted mt-1">Через {settings.automation.autoArchiveDays} дней</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.automation.autoArchiveEnabled}
                  disabled={!canEdit}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium">Уведомление о просрочке SLA</p>
                <p className="text-sm text-textMuted mt-1">За {settings.automation.slaAlertMinutes} мин до истечения</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.automation.slaAlertEnabled}
                  disabled={!canEdit}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sla' && (
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="font-semibold mb-4">SLA нормативы</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-textMuted mb-1">Внешний SLA</p>
              <p className="text-2xl font-bold">{settings.slaDefaults.externalHours} ч</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-textMuted mb-1">Внутренний SLA</p>
              <p className="text-2xl font-bold">{settings.slaDefaults.internalHours} ч</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-textMuted mb-1">Буфер</p>
              <p className="text-2xl font-bold">{settings.slaDefaults.bufferMinutes} мин</p>
            </div>
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-textMuted border-b border-border">
                <th className="pb-3 font-medium">Тип заявки</th>
                <th className="pb-3 font-medium">Внешний SLA</th>
                <th className="pb-3 font-medium">Внутренний SLA</th>
                <th className="pb-3 font-medium">Пауза разрешена</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Обновление конфигурации', external: 8, internal: 6 },
                { type: 'Настройка обмена данными', external: 12, internal: 8 },
                { type: 'Ошибка в отчётности', external: 4, internal: 2 },
                { type: 'Консультация', external: 8, internal: 4 },
                { type: 'Сброс пароля', external: 2, internal: 1 },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="py-3 text-sm">{row.type}</td>
                  <td className="py-3 text-sm">{row.external} ч</td>
                  <td className="py-3 text-sm">{row.internal} ч</td>
                  <td className="py-3 text-sm text-success">✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="font-semibold mb-4">Роли и права</h2>
          <div className="space-y-3">
            {settings.roles.map((roleConfig) => (
              <div key={roleConfig.role} className="p-4 border border-border rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{roleConfig.role}</h3>
                  {currentRole === roleConfig.role && (
                    <span className="text-xs px-2 py-1 bg-primarySoft text-primary rounded">Текущая роль</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {roleConfig.canCreate && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Создание</span>}
                  {roleConfig.canViewAll && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Все заявки</span>}
                  {roleConfig.canChangeStatus && <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Смена статуса</span>}
                  {roleConfig.canClose && <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">Закрытие</span>}
                  {roleConfig.canEditSettings && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Настройки</span>}
                  {!roleConfig.canCreate && !roleConfig.canViewAll && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Read-only</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
