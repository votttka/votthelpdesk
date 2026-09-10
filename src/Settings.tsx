import React from 'react';
import { Card, Tabs, Table, Descriptions, Button, Form, Input, Select, Switch, message } from 'antd';
import { STATUS_CONFIGS, WAITING_REASONS, PAUSE_REASONS, TICKET_TYPES } from './types';

const { Option } = Select;

export function Settings() {
  const [form] = Form.useForm();

  const statusColumns = [
    {
      title: 'Статус',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Цвет',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, backgroundColor: color, borderRadius: 4 }} />
          {color}
        </div>
      ),
    },
    {
      title: 'SLA цвет',
      dataIndex: 'slaColor',
      key: 'slaColor',
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, backgroundColor: color, borderRadius: 4 }} />
          {color}
        </div>
      ),
    },
    {
      title: 'Таймер SLA',
      dataIndex: 'runsSLA',
      key: 'runsSLA',
      render: (runs: boolean) => (runs ? 'Идёт' : 'Остановлен'),
    },
  ];

  const funnelData = [
    { stage: 'Новая', count: 5, avgTime: '2ч 15мин' },
    { stage: 'Классификация', count: 3, avgTime: '1ч 30мин' },
    { stage: 'В работе', count: 7, avgTime: '4ч 45мин' },
    { stage: 'Закрыта', count: 25, avgTime: '8ч 00мин' },
  ];

  const funnelColumns = [
    {
      title: 'Этап',
      dataIndex: 'stage',
      key: 'stage',
    },
    {
      title: 'Количество заявок',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Среднее время',
      dataIndex: 'avgTime',
      key: 'avgTime',
    },
  ];

  const slaColumns = [
    {
      title: 'Тип заявки',
      dataIndex: 'type',
      key: 'type',
      render: (_: unknown, record: { type: string }) => record.type || 'По умолчанию',
    },
    {
      title: 'Внутренний SLA (часы)',
      dataIndex: 'internal',
      key: 'internal',
      render: () => 8,
    },
    {
      title: 'Внешний SLA (часы)',
      dataIndex: 'external',
      key: 'external',
      render: () => 12,
    },
  ];

  const tabItems = [
    {
      key: 'statuses',
      label: 'Статусы и переходы',
      children: (
        <div>
          <Table
            columns={statusColumns}
            dataSource={STATUS_CONFIGS}
            rowKey="key"
            pagination={false}
          />
          <Card title="Матрица переходов" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Новая → Классификация">Автоматически или вручную</Descriptions.Item>
              <Descriptions.Item label="Классификация → В работе">После выбора типа заявки</Descriptions.Item>
              <Descriptions.Item label="В работе → Ждём ответа">Обязательна причина</Descriptions.Item>
              <Descriptions.Item label="В работе → Пауза">Обязательна причина + выбор времени</Descriptions.Item>
              <Descriptions.Item label="Ждём ответа → В работе">Возобновление работы</Descriptions.Item>
              <Descriptions.Item label="Пауза → В работе">Возобновление работы</Descriptions.Item>
              <Descriptions.Item label="В работе → Закрыта">Обязательный канал решения + комментарий</Descriptions.Item>
              <Descriptions.Item label="Закрыта → Архив">Автоматически через 30 дней</Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      ),
    },
    {
      key: 'automation',
      label: 'Автоматика',
      children: (
        <Card>
          <Form form={form} layout="vertical" initialValues={{
            autoTransitionWaiting: 24,
            autoArchiveDays: 30,
            slaWarning: 30,
            autoTransitionEnabled: true,
            autoArchiveEnabled: true,
            slaWarningEnabled: true,
          }}>
            <Form.Item name="autoTransitionWaiting" label="Автопереход из 'Ждём ответа' через (часы)">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="autoArchiveDays" label="Автопереход в 'Архив' через (дни)">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="slaWarning" label="Уведомление о просрочке SLA за (минут)">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="autoTransitionEnabled" label="Включить автопереходы" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="autoArchiveEnabled" label="Включить автоархивацию" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="slaWarningEnabled" label="Включить уведомления SLA" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={() => message.success('Настройки сохранены (демо)')}>
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'funnel',
      label: 'Воронки',
      children: (
        <Card title="Воронка заявок">
          <Table
            columns={funnelColumns}
            dataSource={funnelData}
            rowKey="stage"
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: 'sla',
      label: 'SLA',
      children: (
        <Card title="Нормативы SLA">
          <Table
            columns={slaColumns}
            dataSource={[{ type: 'По умолчанию' }, ...TICKET_TYPES.slice(0, 3).map(t => ({ type: t }))]}
            rowKey="type"
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: 'roles',
      label: 'Роли и права',
      children: (
        <Card title="Доступные роли">
          <Descriptions column={1}>
            <Descriptions.Item label="Оператор">
              Создание заявок, перевод Новая → Классификация
            </Descriptions.Item>
            <Descriptions.Item label="Инженер">
              Работа с заявками, смена статусов в рамках своей команды
            </Descriptions.Item>
            <Descriptions.Item label="Супервизор">
              Все статусы, переназначение исполнителей, передача между линиями
            </Descriptions.Item>
            <Descriptions.Item label="Лид">
              Полные права, редактирование настроек, экспорт данных
            </Descriptions.Item>
            <Descriptions.Item label="Администратор">
              Полный доступ ко всем функциям и настройкам
            </Descriptions.Item>
            <Descriptions.Item label="Аудитор">
              Только просмотр, доступ к аудит-логу, экспорт данных
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Настройки системы</h2>
      <Tabs items={tabItems} />
    </div>
  );
}
