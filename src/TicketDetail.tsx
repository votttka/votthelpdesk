import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, Tabs, Timeline, Modal, Form, Input, Select, message, Radio, List } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Ticket, STATUS_CONFIGS, StatusType, WAITING_REASONS, PAUSE_REASONS, RESOLUTION_CHANNELS, TICKET_TYPES, AuditEntry, Interaction } from './types';
import { getTicketById, updateTicket, loadTickets } from './data';
import { useAuth } from './AuthContext';

const { Option } = Select;
const { TextArea } = Input;

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

export function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const { roleConfig, currentRole } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('interactions');

  useEffect(() => {
    const loadedTicket = getTicketById(ticketId);
    if (loadedTicket) {
      setTicket(loadedTicket);
    }
  }, [ticketId]);

  if (!ticket) {
    return <Card>Заявка не найдена</Card>;
  }

  const statusConfig = STATUS_CONFIGS.find(s => s.key === ticket.status);
  const isOverdue = statusConfig?.runsSLA && ticket.slaTimer > 28800;

  const handleStatusChange = (newStatus: StatusType) => {
    setSelectedStatus(newStatus);
    
    const requiresReason = newStatus === 'waiting' || newStatus === 'paused';
    const requiresChannel = newStatus === 'closed';
    
    if (!requiresReason && !requiresChannel) {
      confirmStatusChange(newStatus, {});
    } else {
      form.resetFields();
      setStatusModalVisible(true);
    }
  };

  const confirmStatusChange = (newStatus: StatusType, values: Record<string, unknown>) => {
    const updatedTicket: Ticket = {
      ...ticket,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      pauseReason: values.reason as string,
      resolutionChannel: values.channel as string,
      slaPaused: newStatus === 'waiting' || newStatus === 'paused',
      auditLog: [
        ...ticket.auditLog,
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          action: 'Смена статуса',
          author: 'Пользователь',
          authorRole: currentRole,
          details: values.comment as string,
          oldStatus: ticket.status,
          newStatus,
        },
      ],
    };

    if (newStatus === 'closed') {
      updatedTicket.resolutionChannel = values.channel as string;
    }

    updateTicket(updatedTicket);
    setTicket(updatedTicket);
    setStatusModalVisible(false);
    form.resetFields();
    message.success('Статус изменён');
  };

  const handleAddComment = (values: Record<string, unknown>) => {
    const updatedTicket: Ticket = {
      ...ticket,
      updatedAt: new Date().toISOString(),
      interactions: [
        ...ticket.interactions,
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          type: 'comment',
          author: 'Пользователь',
          content: values.content as string,
        },
      ],
      auditLog: [
        ...ticket.auditLog,
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          action: 'Добавление комментария',
          author: 'Пользователь',
          authorRole: currentRole,
        },
      ],
    };

    updateTicket(updatedTicket);
    setTicket(updatedTicket);
    commentForm.resetFields();
    message.success('Комментарий добавлен');
  };

  const getStatusButton = (targetStatus: StatusType, label: string) => {
    if (roleConfig.readOnly) return null;
    if (!roleConfig.canChangeStatus(ticket.status, targetStatus)) return null;
    
    return (
      <Button 
        key={targetStatus}
        onClick={() => handleStatusChange(targetStatus)}
        size="small"
      >
        {label}
      </Button>
    );
  };

  const statusButtons = [
    getStatusButton('classification', 'Классификация'),
    getStatusButton('inProgress', 'В работу'),
    getStatusButton('waiting', 'Ждём ответа'),
    getStatusButton('paused', 'Пауза'),
    getStatusButton('closed', 'Закрыть'),
    getStatusButton('archived', 'Архив'),
  ].filter(Boolean);

  const hours = Math.floor(ticket.slaTimer / 3600);
  const minutes = Math.floor((ticket.slaTimer % 3600) / 60);

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 16 }}>
        Назад
      </Button>

      <Card
        title={
          <Space>
            <span>{ticket.number}</span>
            <Tag color={isOverdue ? statusConfig?.slaColor : statusConfig?.color}>
              {statusConfig?.label}
            </Tag>
            {ticket.isClientFacing ? (
              <Tag color="blue">Клиентская</Tag>
            ) : (
              <Tag color="green">Внутренняя</Tag>
            )}
          </Space>
        }
        extra={
          <Space>
            {statusButtons}
          </Space>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Тема" span={2}>{ticket.theme}</Descriptions.Item>
          <Descriptions.Item label="Описание" span={2}>{ticket.description}</Descriptions.Item>
          <Descriptions.Item label="Контрагент">{ticket.contractor}</Descriptions.Item>
          <Descriptions.Item label="Тип">{ticket.type}</Descriptions.Item>
          {ticket.type === 'Другое' && ticket.typeComment && (
            <Descriptions.Item label="Комментарий к типу">{ticket.typeComment}</Descriptions.Item>
          )}
          <Descriptions.Item label="Исполнитель">
            <UserOutlined /> {ticket.assignee || 'Не назначен'}
          </Descriptions.Item>
          <Descriptions.Item label="Линия поддержки">
            <TeamOutlined /> Линия {ticket.line}
          </Descriptions.Item>
          <Descriptions.Item label="Создана">
            {dayjs(ticket.createdAt).format('DD.MM.YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Обновлена">
            {dayjs(ticket.updatedAt).format('DD.MM.YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="SLA таймер" span={2}>
            <ClockCircleOutlined />
            {statusConfig?.runsSLA ? (
              <span style={{ color: isOverdue ? '#F44336' : hours > 7 ? '#FF9800' : '#4CAF50' }}>
                {ticket.slaPaused ? 'На паузе' : ''}
                {isOverdue ? `Просрочено ${hours - 8}ч ${minutes}мин` : `Осталось ${hours}ч ${minutes}мин`}
              </span>
            ) : (
              'Остановлен'
            )}
          </Descriptions.Item>
          {ticket.resolutionChannel && (
            <Descriptions.Item label="Канал решения">
              {RESOLUTION_CHANNELS.find(c => c.value === ticket.resolutionChannel)?.label}
            </Descriptions.Item>
          )}
          {ticket.pauseReason && (
            <Descriptions.Item label="Причина паузы">
              {[...WAITING_REASONS, ...PAUSE_REASONS].find(r => r.value === ticket.pauseReason)?.label}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: 24 }}>
          <Tabs.TabPane tab="Взаимодействия" key="interactions">
            <List
              itemLayout="vertical"
              dataSource={[...ticket.interactions].reverse()}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <strong>{item.author}</strong>
                        <Tag>{item.type === 'comment' ? 'Комментарий' : item.type === 'call' ? 'Звонок' : 'Подключение'}</Tag>
                        <span style={{ color: '#999', fontSize: 12 }}>
                          {dayjs(item.timestamp).format('DD.MM.YYYY HH:mm')}
                        </span>
                      </Space>
                    }
                    description={item.content}
                  />
                </List.Item>
              )}
            />
            
            {!roleConfig.readOnly && (
              <Form form={commentForm} onFinish={handleAddComment} style={{ marginTop: 16 }}>
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: 'Введите комментарий' }]}
                >
                  <TextArea rows={3} placeholder="Добавить комментарий..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Добавить комментарий</Button>
                </Form.Item>
              </Form>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Аудит-лог" key="audit">
            <Timeline
              items={ticket.auditLog.map((entry) => ({
                key: entry.id,
                color: 'blue',
                children: (
                  <div>
                    <div>
                      <strong>{entry.action}</strong>
                      <span style={{ color: '#999', marginLeft: 8 }}>
                        {dayjs(entry.timestamp).format('DD.MM.YYYY HH:mm')}
                      </span>
                    </div>
                    <div style={{ color: '#666', fontSize: 13 }}>
                      Автор: {entry.author} ({entry.authorRole})
                      {entry.details && <div>{entry.details}</div>}
                      {entry.oldStatus && entry.newStatus && (
                        <div>
                          {STATUS_CONFIGS.find(s => s.key === entry.oldStatus)?.label} →{' '}
                          {STATUS_CONFIGS.find(s => s.key === entry.newStatus)?.label}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              }))}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Подтверждение смены статуса"
        open={statusModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setStatusModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={(values) => selectedStatus && confirmStatusChange(selectedStatus, values)}>
          {selectedStatus === 'waiting' && (
            <Form.Item
              name="reason"
              label="Причина ожидания"
              rules={[{ required: true, message: 'Выберите причину' }]}
            >
              <Select>
                {WAITING_REASONS.map(r => (
                  <Option key={r.value} value={r.value}>{r.label}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          {selectedStatus === 'paused' && (
            <>
              <Form.Item
                name="reason"
                label="Причина паузы"
                rules={[{ required: true, message: 'Выберите причину' }]}
              >
                <Select>
                  {PAUSE_REASONS.map(r => (
                    <Option key={r.value} value={r.value}>{r.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          
          {selectedStatus === 'closed' && (
            <Form.Item
              name="channel"
              label="Канал решения"
              rules={[{ required: true, message: 'Выберите канал решения' }]}
            >
              <Select>
                {RESOLUTION_CHANNELS.map(c => (
                  <Option key={c.value} value={c.value}>{c.label}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          <Form.Item name="comment" label="Комментарий">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
