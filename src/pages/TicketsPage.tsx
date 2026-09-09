import React, { useState } from 'react';
import { Card, Table, Tag, Input, Select, Space, Button, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useHelpDeskStore } from '../store/helpdeskStore';
import type { TicketStatus, TicketType } from '../types';

const { Title } = Typography;

const statusColors: Record<TicketStatus, string> = {
  new: '#2196F3',
  classification: '#FF9800',
  in_progress: '#4CAF50',
  waiting_response: '#FFEB3B',
  pause: '#9E9E9E',
  closed: '#9C27B0',
  archived: '#616161'
};

const statusLabels: Record<TicketStatus, string> = {
  new: 'Новая',
  classification: 'Классификация',
  in_progress: 'В работе',
  waiting_response: 'Ждём ответа',
  pause: 'Пауза',
  closed: 'Закрыта',
  archived: 'Архив'
};

const typeLabels: Record<TicketType, string> = {
  config_update: 'Обновление конфигурации',
  data_exchange: 'Настройка обмена данными',
  reporting_error: 'Ошибка в отчётности',
  consultation: 'Консультация',
  password_reset: 'Сброс пароля',
  update_install: 'Установка обновления',
  access_setup: 'Настройка прав доступа',
  other: 'Другое'
};

const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const tickets = useHelpDeskStore((state) => state.tickets);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<TicketType | undefined>();
  const [clientFilter, setClientFilter] = useState<'client' | 'internal' | undefined>();
  
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (typeFilter && t.type !== typeFilter) return false;
    if (clientFilter === 'client' && !t.isClientTicket) return false;
    if (clientFilter === 'internal' && t.isClientTicket) return false;
    if (searchText) {
      const search = searchText.toLowerCase();
      return (
        t.number.toLowerCase().includes(search) ||
        t.topic.toLowerCase().includes(search) ||
        t.contractor.toLowerCase().includes(search)
      );
    }
    return true;
  });
  
  const columns = [
    { 
      title: 'Номер', 
      dataIndex: 'number', 
      key: 'number',
      render: (text: string, record: typeof tickets[0]) => (
        <Button type="link" onClick={() => navigate(`/tickets/${record.id}`)}>
          {text}
        </Button>
      )
    },
    { title: 'Контрагент', dataIndex: 'contractor', key: 'contractor' },
    { title: 'Тема', dataIndex: 'topic', key: 'topic', ellipsis: true },
    { 
      title: 'Статус', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: TicketStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      )
    },
    { title: 'Исполнитель', dataIndex: 'assignee', key: 'assignee', render: (v: string) => v || '—' },
    { 
      title: 'Тип', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: TicketType) => typeLabels[type]
    },
    {
      title: 'Создана',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU')
    }
  ];
  
  return (
    <div>
      <Title level={2}>Заявки</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Поиск по номеру, теме, контрагенту"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          
          <Select
            placeholder="Все статусы"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            allowClear
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label
            }))}
          />
          
          <Select
            placeholder="Все типы"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 200 }}
            allowClear
            options={Object.entries(typeLabels).map(([value, label]) => ({
              value,
              label
            }))}
          />
          
          <Select
            placeholder="Все заявки"
            value={clientFilter}
            onChange={setClientFilter}
            style={{ width: 150 }}
            allowClear
            options={[
              { value: 'client', label: 'Клиентские' },
              { value: 'internal', label: 'Внутренние' }
            ]}
          />
          
          <Button type="primary" onClick={() => navigate('/create')}>
            Создать заявку
          </Button>
        </Space>
      </Card>
      
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTickets}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          onRow={(record) => ({
            onClick: () => navigate(`/tickets/${record.id}`)
          })}
          style={{ cursor: 'pointer' }}
        />
      </Card>
    </div>
  );
};

export default TicketsPage;
