import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Select, Space, Modal, Form, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Ticket, STATUS_CONFIGS, StatusType, WAITING_REASONS, PAUSE_REASONS, RESOLUTION_CHANNELS, TICKET_TYPES, CONTRACTORS } from './types';
import { loadTickets, updateTicket, getTicketById } from './data';
import { useAuth } from './AuthContext';

const { Option } = Select;

interface TicketListProps {
  onTicketClick: (ticketId: string) => void;
}

export function TicketList({ onTicketClick }: TicketListProps) {
  const { roleConfig } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(loadTickets());
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [clientFacingFilter, setClientFacingFilter] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.number.toLowerCase().includes(searchText.toLowerCase()) ||
      ticket.theme.toLowerCase().includes(searchText.toLowerCase()) ||
      ticket.contractor.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesType = typeFilter === 'all' || ticket.type === typeFilter;
    const matchesClientFacing = clientFacingFilter === 'all' || 
      (clientFacingFilter === 'client' && ticket.isClientFacing) ||
      (clientFacingFilter === 'internal' && !ticket.isClientFacing);
    return matchesSearch && matchesStatus && matchesType && matchesClientFacing;
  });

  const columns = [
    {
      title: 'Номер',
      dataIndex: 'number',
      key: 'number',
      width: 100,
      render: (text: string, record: Ticket) => (
        <Button type="link" onClick={() => onTicketClick(record.id)}>{text}</Button>
      ),
    },
    {
      title: 'Тема',
      dataIndex: 'theme',
      key: 'theme',
      ellipsis: true,
    },
    {
      title: 'Контрагент',
      dataIndex: 'contractor',
      key: 'contractor',
      width: 150,
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      filters: TICKET_TYPES.map(t => ({ text: t, value: t })),
      onFilter: (value: unknown, record: Ticket) => record.type === value,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: STATUS_CONFIGS.map(s => ({ text: s.label, value: s.key })),
      onFilter: (value: unknown, record: Ticket) => record.status === value,
      render: (status: StatusType, record: Ticket) => {
        const config = STATUS_CONFIGS.find(s => s.key === status);
        const isOverdue = config?.runsSLA && record.slaTimer > 28800;
        return (
          <Tag color={isOverdue ? config?.slaColor : config?.color}>
            {config?.label}
          </Tag>
        );
      },
    },
    {
      title: 'Исполнитель',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
    },
    {
      title: 'SLA',
      key: 'sla',
      width: 100,
      render: (_: unknown, record: Ticket) => {
        const statusConfig = STATUS_CONFIGS.find(s => s.key === record.status);
        if (!statusConfig?.runsSLA) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const hours = Math.floor(record.slaTimer / 3600);
        const minutes = Math.floor((record.slaTimer % 3600) / 60);
        const isOverdue = record.slaTimer > 28800;
        return (
          <span style={{ color: isOverdue ? '#F44336' : hours > 7 ? '#FF9800' : '#4CAF50' }}>
            {isOverdue ? `Просрочено ${hours - 8}ч` : `${hours}ч ${minutes}мин`}
          </span>
        );
      },
    },
    {
      title: 'Создана',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD.MM HH:mm'),
    },
    {
      title: 'Тип заявки',
      key: 'isClientFacing',
      width: 100,
      render: (_: unknown, record: Ticket) => (
        <Tag color={record.isClientFacing ? 'blue' : 'green'}>
          {record.isClientFacing ? 'Клиентская' : 'Внутренняя'}
        </Tag>
      ),
    },
  ];

  return (
    <Card title="Заявки">
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Поиск по номеру, теме, контрагенту"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Все статусы"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
          allowClear
        >
          {STATUS_CONFIGS.map(s => (
            <Option key={s.key} value={s.key}>{s.label}</Option>
          ))}
        </Select>
        <Select
          placeholder="Все типы"
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 150 }}
          allowClear
        >
          {TICKET_TYPES.map(t => (
            <Option key={t} value={t}>{t}</Option>
          ))}
        </Select>
        <Select
          placeholder="Все заявки"
          value={clientFacingFilter}
          onChange={setClientFacingFilter}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="client">Клиентские</Option>
          <Option value="internal">Внутренние</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredTickets}
        rowKey="id"
        pagination={{ pageSize: 15 }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}
