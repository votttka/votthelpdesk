import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Input, Select } from 'antd';
import { DashboardOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Ticket, STATUS_CONFIGS, StatusType } from './types';
import { loadTickets } from './data';

const { Search } = Input;

interface DashboardProps {
  onTicketClick: (ticketId: string) => void;
}

export function Dashboard({ onTicketClick }: DashboardProps) {
  const tickets = loadTickets();

  const statusCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<StatusType, number>);

  const overdueTickets = tickets.filter(t => {
    const statusConfig = STATUS_CONFIGS.find(s => s.key === t.status);
    return statusConfig?.runsSLA && t.slaTimer > 28800;
  });

  const warningTickets = tickets.filter(t => {
    const statusConfig = STATUS_CONFIGS.find(s => s.key === t.status);
    return statusConfig?.runsSLA && t.slaTimer > 25200 && t.slaTimer <= 28800;
  });

  const stats = [
    { title: 'Всего заявок', value: tickets.length, icon: <DashboardOutlined /> },
    { title: 'Новые', value: statusCounts.new || 0, color: '#2196F3' },
    { title: 'В работе', value: statusCounts.inProgress || 0, color: '#4CAF50' },
    { title: 'Ждём ответа', value: statusCounts.waiting || 0, color: '#FFEB3B' },
    { title: 'Пауза', value: statusCounts.paused || 0, color: '#9E9E9E' },
    { title: 'Закрыты', value: statusCounts.closed || 0, color: '#9C27B0' },
    { title: 'Просрочено SLA', value: overdueTickets.length, color: '#F44336' },
    { title: 'Скоро истекает SLA', value: warningTickets.length, color: '#FF9800' },
  ];

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
    },
    {
      title: 'Контрагент',
      dataIndex: 'contractor',
      key: 'contractor',
      width: 150,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: StatusType) => {
        const config = STATUS_CONFIGS.find(s => s.key === status);
        const isOverdue = config?.runsSLA && tickets.find(t => t.status === status)?.slaTimer && (tickets.find(t => t.status === status)?.slaTimer || 0) > 28800;
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
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Дашборд</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col span={4} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {overdueTickets.length > 0 && (
        <Card title={<><ExclamationCircleOutlined style={{ color: '#F44336' }} /> Просроченные заявки</>} style={{ marginBottom: 24, borderColor: '#F44336' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {overdueTickets.map(ticket => (
              <div key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <strong>{ticket.number}</strong> - {ticket.theme}
                </span>
                <Button type="link" onClick={() => onTicketClick(ticket.id)}>Открыть</Button>
              </div>
            ))}
          </Space>
        </Card>
      )}

      {warningTickets.length > 0 && (
        <Card title={<><ClockCircleOutlined style={{ color: '#FF9800' }} /> Заявки с истекающим SLA</>} style={{ marginBottom: 24, borderColor: '#FF9800' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {warningTickets.map(ticket => (
              <div key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <strong>{ticket.number}</strong> - {ticket.theme}
                </span>
                <Button type="link" onClick={() => onTicketClick(ticket.id)}>Открыть</Button>
              </div>
            ))}
          </Space>
        </Card>
      )}

      <Card title="Все заявки">
        <Table
          columns={columns}
          dataSource={tickets.slice(0, 20)}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
