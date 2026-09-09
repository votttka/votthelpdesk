import React from 'react';
import { Card, Tabs, Table, Form, InputNumber, Switch, Button, message, ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { useHelpDeskStore } from '../store/helpdeskStore';
import type { TicketStatus } from '../types';

const { TabPane } = Tabs;

const statusLabels: Record<TicketStatus, string> = {
  new: 'Новая',
  classification: 'Классификация',
  in_progress: 'В работе',
  waiting_response: 'Ждём ответа',
  pause: 'Пауза',
  closed: 'Закрыта',
  archived: 'Архив'
};

const SettingsPage: React.FC = () => {
  const slaSettings = useHelpDeskStore((state) => state.slaSettings);
  const automationSettings = useHelpDeskStore((state) => state.automationSettings);
  const statusConfigs = useHelpDeskStore((state) => state.statusConfigs);
  const rolePermissions = useHelpDeskStore((state) => state.rolePermissions);
  const users = useHelpDeskStore((state) => state.users);
  const resetData = useHelpDeskStore((state) => state.resetData);
  
  const handleReset = () => {
    resetData();
    message.success('Демо-данные сброшены');
  };
  
  const statusColumns = [
    {
      title: 'Статус',
      dataIndex: 'label',
      key: 'label',
      render: (_: unknown, record: typeof statusConfigs[0]) => (
        <span style={{ color: record.color }}>{record.label}</span>
      )
    },
    {
      title: 'Цвет',
      key: 'color',
      render: (_: unknown, record: typeof statusConfigs[0]) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            width: 24, 
            height: 24, 
            borderRadius: 4, 
            backgroundColor: record.color,
            border: '1px solid #ddd'
          }} />
          <span>{record.color}</span>
        </div>
      )
    },
    {
      title: 'SLA идёт',
      key: 'slaRunning',
      render: (running: boolean) => running ? '✓' : '✗'
    }
  ];
  
  const roleColumns = [
    { title: 'Роль', dataIndex: 'role', key: 'role' },
    { title: 'Может создавать', dataIndex: 'canCreate', key: 'canCreate', render: (v: boolean) => v ? '✓' : '✗' },
    { title: 'Видит все', dataIndex: 'canViewAll', key: 'canViewAll', render: (v: boolean) => v ? '✓' : '✗' },
    { title: 'Переназначать', dataIndex: 'canReassign', key: 'canReassign', render: (v: boolean) => v ? '✓' : '✗' },
    { title: 'Передавать линии', dataIndex: 'canTransferLines', key: 'canTransferLines', render: (v: boolean) => v ? '✓' : '✗' },
    { title: 'Настройки', dataIndex: 'canEditSettings', key: 'canEditSettings', render: (v: boolean) => v ? '✓' : '✗' },
    { title: 'Экспорт', dataIndex: 'canExport', key: 'canExport', render: (v: boolean) => v ? '✓' : '✗' },
    { title: 'Только чтение', dataIndex: 'readOnly', key: 'readOnly', render: (v: boolean) => v ? '✓' : '✗' }
  ];
  
  const roleData = Object.entries(rolePermissions).map(([role, perms]) => ({
    key: role,
    role: {
      operator: 'Оператор',
      engineer: 'Инженер',
      supervisor: 'Супервизор',
      lead: 'Лид',
      admin: 'Администратор',
      auditor: 'Аудитор'
    }[role],
    ...perms
  }));
  
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Настройки</h1>
      
      <Tabs defaultActiveKey="statuses">
        <TabPane tab="Статусы и переходы" key="statuses">
          <Card title="Конфигурация статусов">
            <Table
              columns={statusColumns}
              dataSource={statusConfigs}
              rowKey="status"
              pagination={false}
              size="small"
            />
            
            <p style={{ marginTop: 16, color: '#666' }}>
              Статусы с включённым SLA: Новая, Классификация, В работе.<br/>
              Таймер останавливается при переходе в "Ждём ответа" или "Пауза" 
              (если причина = "Ожидание клиента" или "Ожидание смежника").
            </p>
          </Card>
        </TabPane>
        
        <TabPane tab="Автоматика" key="automation">
          <Card title="Настройки автоматики">
            <Form layout="vertical" initialValues={automationSettings}>
              <Form.Item label="Автопереход из 'Ждём ответа' через N часов">
                <InputNumber 
                  min={1} 
                  max={168} 
                  defaultValue={automationSettings.autoResumeWaitingHours}
                  disabled
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                  Текущее значение: {automationSettings.autoResumeWaitingHours} ч
                </div>
              </Form.Item>
              
              <Form.Item label="Автопереход в 'Архив' через N дней">
                <InputNumber 
                  min={1} 
                  max={365} 
                  defaultValue={automationSettings.autoArchiveDays}
                  disabled
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                  Текущее значение: {automationSettings.autoArchiveDays} дн.
                </div>
              </Form.Item>
              
              <Form.Item label="Уведомление о просрочке SLA за N минут">
                <InputNumber 
                  min={5} 
                  max={120} 
                  defaultValue={automationSettings.slaWarningMinutes}
                  disabled
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                  Текущее значение: {automationSettings.slaWarningMinutes} мин.
                </div>
              </Form.Item>
              
              <Form.Item label="Включение автоматики">
                <div>
                  <Switch defaultChecked={automationSettings.enableAutoResume} disabled style={{ marginRight: 16 }} />
                  Автопереход из "Ждём ответа"
                </div>
                <div>
                  <Switch defaultChecked={automationSettings.enableAutoArchive} disabled style={{ marginRight: 16 }} />
                  Автопереход в "Архив"
                </div>
                <div>
                  <Switch defaultChecked={automationSettings.enableSlaWarning} disabled />
                  Уведомления о просрочке SLA
                </div>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Воронки" key="funnels">
          <Card title="Воронка заявок">
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '40px 0' }}>
              {statusConfigs.slice(0, 5).map((config, index) => {
                const count = useHelpDeskStore.getState().tickets.filter(
                  (t) => t.status === config.status
                ).length;
                
                return (
                  <React.Fragment key={config.status}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        backgroundColor: config.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        margin: '0 auto 8px'
                      }}>
                        {count}
                      </div>
                      <div>{config.label}</div>
                    </div>
                    {index < 4 && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#999',
                        fontSize: '20px'
                      }}>
                        →
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab="SLA" key="sla">
          <Card title="Нормативы SLA">
            <Table
              dataSource={[
                { key: 'config_update', type: 'Обновление конфигурации', hours: slaSettings.byType.config_update },
                { key: 'data_exchange', type: 'Настройка обмена данными', hours: slaSettings.byType.data_exchange },
                { key: 'reporting_error', type: 'Ошибка в отчётности', hours: slaSettings.byType.reporting_error },
                { key: 'consultation', type: 'Консультация', hours: slaSettings.byType.consultation },
                { key: 'password_reset', type: 'Сброс пароля', hours: slaSettings.byType.password_reset },
                { key: 'update_install', type: 'Установка обновления', hours: slaSettings.byType.update_install },
                { key: 'access_setup', type: 'Настройка прав доступа', hours: slaSettings.byType.access_setup },
                { key: 'other', type: 'Другое', hours: slaSettings.byType.other }
              ]}
              columns={[
                { title: 'Тип заявки', dataIndex: 'type', key: 'type' },
                { title: 'SLA (часы)', dataIndex: 'hours', key: 'hours' }
              ]}
              pagination={false}
              size="small"
            />
            
            <p style={{ marginTop: 16 }}>
              Внутренний буфер: {slaSettings.internalBufferMinutes} мин.<br/>
              SLA по умолчанию: {slaSettings.defaultHours} ч.
            </p>
          </Card>
        </TabPane>
        
        <TabPane tab="Роли и права" key="roles">
          <Card title="Права доступа по ролям">
            <Table
              columns={roleColumns}
              dataSource={roleData}
              rowKey="key"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
            
            <p style={{ marginTop: 16, color: '#666' }}>
              Для смены роли используйте выпадающий список в шапке страницы.
            </p>
          </Card>
        </TabPane>
        
        <TabPane tab="Данные" key="data">
          <Card title="Управление данными">
            <p>Все данные хранятся в localStorage браузера.</p>
            
            <Button danger onClick={handleReset} style={{ marginTop: 16 }}>
              Сбросить демо-данные
            </Button>
            
            <div style={{ marginTop: 24 }}>
              <h3>Текущие пользователи:</h3>
              <ul>
                {users.map((u) => (
                  <li key={u.id}>
                    {u.name} — {
                      {
                        operator: 'Оператор',
                        engineer: 'Инженер',
                        supervisor: 'Супервизор',
                        lead: 'Лид',
                        admin: 'Администратор',
                        auditor: 'Аудитор'
                      }[u.role]
                    }
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
