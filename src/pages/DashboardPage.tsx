import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  PauseCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useHelpDeskStore } from '../store/helpdeskStore';
import type { TicketStatus } from '../types';

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

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const tickets = useHelpDeskStore((state) => state.tickets);
  const slaSettings = useHelpDeskStore((state) => state.slaSettings);
  
  const now = new Date();
  
  // Calculate statistics
  const stats = {
    new: tickets.filter((t) => t.status === 'new').length,
    classification: tickets.filter((t) => t.status === 'classification').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    waiting: tickets.filter((t) => t.status === 'waiting_response').length,
    paused: tickets.filter((t) => t.status === 'pause').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
    archived: tickets.filter((t) => t.status === 'archived').length,
    overdue: tickets.filter((t) => {
      if (t.slaPaused || t.status === 'closed' || t.status === 'archived') return false;
      return new Date(t.slaDeadline) < now;
    }).length,
    warning: tickets.filter((t) => {
      if (t.slaPaused || t.status === 'closed' || t.status === 'archived') return false;
      const deadline = new Date(t.slaDeadline);
      const warningTime = new Date(deadline.getTime() - slaSettings.defaultHours * 60 * 60 * 1000);
      return now > warningTime && now < deadline;
    }).length
  };
  
  // Overdue tickets for table
  const overdueTickets = tickets
    .filter((t) => {
      if (t.slaPaused || t.status === 'closed' || t.status === 'archived') return false;
      return new Date(t.slaDeadline) < now;
    })
    .slice(0, 5)
    .map((t) => ({
      key: t.id,
      number: t.number,
      topic: t.topic,
      contractor: t.contractor,
      status: t.status,
      slaDeadline: t.slaDeadline,
      assignee: t.assignee || 'Не назначен'
    }));
  
  const columns = [
    { title: 'Номер', dataIndex: 'number', key: 'number' },
    { title: 'Тема', dataIndex: 'topic', key: 'topic' },
    { title: 'Контрагент', dataIndex: 'contractor', key: 'contractor' },
    { 
      title: 'Статус', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: TicketStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      )
    },
    { title: 'Исполнитель', dataIndex: 'assignee', key: 'assignee' },
    {
      title: 'SLA',
      key: 'sla',
      render: (_: unknown, record: typeof overdueTickets[0]) => {
        const deadline = new Date(record.slaDeadline);
        const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        const isOverdue = hoursLeft < 0;
        return (
          <Tag color={isOverdue ? 'red' : 'orange'}>
            {isOverdue 
              ? `Просрочено: ${Math.abs(Math.floor(hoursLeft))}ч`
              : `Осталось: ${Math.ceil(hoursLeft)}ч`
            }
          </Tag>
        );
      }
    }
  ];
  
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Дашборд</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={3}>
          <Card>
            <Statistic 
              title="Новые" 
              value={stats.new}
              prefix={<ClockCircleOutlined style={{ color: '#2196F3' }} />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic 
              title="Классификация" 
              value={stats.classification}
              prefix={<ClockCircleOutlined style={{ color: '#FF9800' }} />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic 
              title="В работе" 
              value={stats.inProgress}
              prefix={<CheckCircleOutlined style={{ color: '#4CAF50' }} />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic 
              title="Ждём ответа" 
              value={stats.waiting}
              prefix={<PauseCircleOutlined style={{ color: '#FFEB3B' }} />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic 
              title="Пауза" 
              value={stats.paused}
              prefix={<PauseCircleOutlined style={{ color: '#9E9E9E' }} />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic 
              title="Закрыты" 
              value={stats.closed}
              prefix={<CheckCircleOutlined style={{ color: '#9C27B0' }} />}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card 
            title={<span style={{ color: '#F44336' }}>Просроченные SLA</span>}
            extra={<Button type="link" onClick={() => navigate('/tickets')}>Все заявки</Button>}
          >
            <Table 
              columns={columns} 
              dataSource={overdueTickets} 
              pagination={false}
              size="small"
              onRow={(record) => ({
                onClick: () => navigate(`/tickets/${record.key}`)
              })}
              style={{ cursor: 'pointer' }}
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Статистика по статусам">
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Всего заявок: {tickets.length}</span>
                  <span>{stats.overdue} просрочено</span>
                </div>
                <Progress 
                  percent={(stats.overdue / tickets.length) * 100} 
                  strokeColor="#F44336"
                  format={() => `${stats.overdue} из ${tickets.length}`}
                />
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Клиентские заявки</span>
                  <span>{tickets.filter((t) => t.isClientTicket).length}</span>
                </div>
                <Progress 
                  percent={(tickets.filter((t) => t.isClientTicket).length / tickets.length) * 100} 
                  strokeColor="#2196F3"
                  format={() => `${tickets.filter((t) => t.isClientTicket).length}`}
                />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Внутренние заявки</span>
                  <span>{tickets.filter((t) => !t.isClientTicket).length}</span>
                </div>
                <Progress 
                  percent={(tickets.filter((t) => !t.isClientTicket).length / tickets.length) * 100} 
                  strokeColor="#4CAF50"
                  format={() => `${tickets.filter((t) => !t.isClientTicket).length}`}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
