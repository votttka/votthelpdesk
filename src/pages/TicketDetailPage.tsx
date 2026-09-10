import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Descriptions, Tag, Button, Tabs, Timeline, Modal, Form, 
  Input, Select, Space, message, Divider 
} from 'antd';
import { 
  PhoneOutlined, 
  LinkOutlined, 
  MessageOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useHelpDeskStore } from '../store/helpdeskStore';
import type { 
  TicketStatus, PauseReason, WaitingReason, 
  ResolutionChannel, Role, Interaction 
} from '../types';

const { TextArea } = Input;
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

const statusColors: Record<TicketStatus, string> = {
  new: '#2196F3',
  classification: '#FF9800',
  in_progress: '#4CAF50',
  waiting_response: '#FFEB3B',
  pause: '#9E9E9E',
  closed: '#9C27B0',
  archived: '#616161'
};

const pauseReasons: { value: PauseReason; label: string; stopsSla: boolean }[] = [
  { value: 'waiting_client', label: 'Ожидание клиента (SLA остановлен)', stopsSla: true },
  { value: 'waiting_partner', label: 'Ожидание смежника (SLA остановлен)', stopsSla: true },
  { value: 'planned_works', label: 'Плановые работы', stopsSla: false },
  { value: 'vacation', label: 'Отпуск исполнителя', stopsSla: false },
  { value: 'other', label: 'Другое', stopsSla: false }
];

const waitingReasons: { value: WaitingReason; label: string }[] = [
  { value: 'waiting_client', label: 'Ожидание клиента' },
  { value: 'waiting_department', label: 'Ожидание смежного отдела' },
  { value: 'waiting_external', label: 'Ожидание внешней системы' },
  { value: 'other', label: 'Другое' }
];

const resolutionChannels: { value: ResolutionChannel; label: string }[] = [
  { value: 'remote', label: 'Удалённо' },
  { value: 'phone', label: 'Телефон' },
  { value: 'chat', label: 'Переписка' },
  { value: 'onsite', label: 'Выезд' }
];

const typeLabels: Record<string, string> = {
  config_update: 'Обновление конфигурации',
  data_exchange: 'Настройка обмена данными',
  reporting_error: 'Ошибка в отчётности',
  consultation: 'Консультация',
  password_reset: 'Сброс пароля',
  update_install: 'Установка обновления',
  access_setup: 'Настройка прав доступа',
  other: 'Другое'
};

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticket = useHelpDeskStore((state) => state.tickets.find((t) => t.id === id));
  const users = useHelpDeskStore((state) => state.users);
  const currentUserId = useHelpDeskStore((state) => state.currentUserId);
  const currentUser = users.find((u) => u.id === currentUserId);
  const changeStatus = useHelpDeskStore((state) => state.changeStatus);
  const addInteraction = useHelpDeskStore((state) => state.addInteraction);
  const rolePermissions = useHelpDeskStore((state) => state.rolePermissions);
  
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [targetStatus, setTargetStatus] = useState<TicketStatus | null>(null);
  const [commentText, setCommentText] = useState('');
  const [form] = Form.useForm();
  
  if (!ticket) {
    return <div>Заявка не найдена</div>;
  }
  
  const now = new Date();
  const isOverdue = !ticket.slaPaused && ticket.status !== 'closed' && ticket.status !== 'archived' 
    && new Date(ticket.slaDeadline) < now;
  
  const hoursLeft = (new Date(ticket.slaDeadline).getTime() - now.getTime()) / (1000 * 60 * 60);
  const slaText = isOverdue
    ? `Просрочено: ${Math.abs(Math.floor(hoursLeft))}ч ${Math.abs(Math.floor((hoursLeft % 1) * 60))}мин`
    : `Осталось: ${Math.ceil(hoursLeft)}ч`;
  
  const permissions = rolePermissions[currentUser?.role || 'operator'];
  const canChangeStatus = permissions.canChangeStatuses.includes(ticket.status);
  
  const handleStatusChange = (newStatus: TicketStatus) => {
    // Check required fields based on transition
    if (newStatus === 'pause') {
      setTargetStatus(newStatus);
      setStatusModalVisible(true);
      return;
    }
    
    if (newStatus === 'waiting_response') {
      setTargetStatus(newStatus);
      setStatusModalVisible(true);
      return;
    }
    
    if (newStatus === 'closed') {
      setTargetStatus(newStatus);
      setStatusModalVisible(true);
      return;
    }
    
    // Simple transition without extra fields
    const success = changeStatus(
      ticket.id,
      newStatus,
      currentUser?.name || 'Unknown',
      currentUser?.role || 'operator'
    );
    
    if (success) {
      message.success(`Статус изменён на "${statusLabels[newStatus]}"`);
    } else {
      message.error('Нет прав для изменения статуса');
    }
  };
  
  const handleModalOk = () => {
    form.validateFields().then((values) => {
      let success = false;
      
      if (targetStatus === 'pause') {
        success = changeStatus(
          ticket.id,
          'pause',
          currentUser?.name || 'Unknown',
          currentUser?.role || 'operator',
          {
            pauseReason: values.pauseReason,
            comment: values.comment
          }
        );
      } else if (targetStatus === 'waiting_response') {
        success = changeStatus(
          ticket.id,
          'waiting_response',
          currentUser?.name || 'Unknown',
          currentUser?.role || 'operator',
          {
            waitingReason: values.waitingReason,
            comment: values.comment
          }
        );
      } else if (targetStatus === 'closed') {
        if (!values.resolutionChannel) {
          message.error('Выберите канал решения');
          return;
        }
        success = changeStatus(
          ticket.id,
          'closed',
          currentUser?.name || 'Unknown',
          currentUser?.role || 'operator',
          {
            resolutionChannel: values.resolutionChannel,
            resolutionComment: values.resolutionComment || values.comment
          }
        );
      }
      
      if (success) {
        message.success('Статус изменён');
        setStatusModalVisible(false);
        form.resetFields();
      } else {
        message.error('Нет прав для изменения статуса');
      }
    }).catch(() => {});
  };
  
  const handleAddComment = () => {
    if (!commentText.trim()) {
      message.error('Введите текст комментария');
      return;
    }
    
    const interaction: Interaction = {
      id: crypto.randomUUID(),
      type: 'comment',
      content: commentText,
      author: currentUser?.name || 'Unknown',
      authorRole: currentUser?.role || 'operator',
      timestamp: new Date().toISOString()
    };
    
    addInteraction(ticket.id, interaction);
    setCommentText('');
    message.success('Комментарий добавлен');
  };
  
  const handleMockCall = () => {
    const interaction: Interaction = {
      id: crypto.randomUUID(),
      type: 'call',
      content: 'Входящий звонок от клиента',
      author: currentUser?.name || 'Unknown',
      authorRole: currentUser?.role || 'operator',
      timestamp: new Date().toISOString(),
      metadata: { duration: Math.floor(Math.random() * 600) + 30 }
    };
    
    addInteraction(ticket.id, interaction);
    message.success('Звонок зафиксирован');
  };
  
  const getStatusButton = (status: TicketStatus, label: string, disabled: boolean = false) => {
    if (!permissions.canChangeStatuses.includes(status)) return null;
    return (
      <Button
        key={status}
        onClick={() => handleStatusChange(status)}
        disabled={disabled || ticket.status === status}
        size="small"
      >
        {label}
      </Button>
    );
  };
  
  const renderAuditEntry = (entry: typeof ticket.auditLog[0]) => {
    let actionText = '';
    if (entry.action === 'created') actionText = 'Создание заявки';
    else if (entry.action === 'status_changed') {
      const fromStatus = entry.details && 'from' in entry.details ? String(entry.details.from) : '?';
      const toStatus = entry.details && 'to' in entry.details ? String(entry.details.to) : '?';
      actionText = `Смена статуса: ${fromStatus} → ${toStatus}`;
    }
    else if (entry.action === 'auto_resumed') actionText = 'Автоматическое возобновление';
    else if (entry.action === 'auto_archived') actionText = 'Автоматическая архивация';
    
    const reasonText = entry.details && 'reason' in entry.details && entry.details.reason 
      ? String(entry.details.reason) 
      : null;
    
    return (
      <div>
        <div style={{ fontWeight: 'bold' }}>{actionText}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {entry.author} • {new Date(entry.timestamp).toLocaleString('ru-RU')}
        </div>
        {reasonText && (
          <div style={{ fontSize: '12px' }}>{reasonText}</div>
        )}
      </div>
    );
  };
  
  const renderInteraction = (int: typeof ticket.interactions[0]) => {
    const duration = int.metadata && 'duration' in int.metadata ? int.metadata.duration as number : undefined;
    
    return (
      <div>
        <div style={{ fontWeight: 'bold' }}>
          {int.author} ({new Date(int.timestamp).toLocaleString('ru-RU')})
        </div>
        <div>{int.content}</div>
        {duration && (
          <div style={{ fontSize: '12px', color: '#999' }}>
            Длительность: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')} мин
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div>
      <Card
        title={
          <Space>
            <span>{ticket.number}</span>
            <Tag color={isOverdue ? '#F44336' : statusColors[ticket.status]}>
              {statusLabels[ticket.status]}
            </Tag>
            {ticket.slaPaused && <Tag icon={<ClockCircleOutlined />}>SLA на паузе</Tag>}
          </Space>
        }
        extra={
          <Space>
            <Button onClick={() => navigate('/tickets')}>Назад к списку</Button>
            <Button type="primary" onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>
              Редактировать
            </Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Тема">{ticket.topic}</Descriptions.Item>
          <Descriptions.Item label="Контрагент">{ticket.contractor}</Descriptions.Item>
          <Descriptions.Item label="Тип">{typeLabels[ticket.type]}</Descriptions.Item>
          <Descriptions.Item label="Исполнитель">{ticket.assignee || 'Не назначен'}</Descriptions.Item>
          <Descriptions.Item label="Линия поддержки">{ticket.line}</Descriptions.Item>
          <Descriptions.Item label="Тип заявки">
            {ticket.isClientTicket ? 'Клиентская' : 'Внутренняя'}
          </Descriptions.Item>
          <Descriptions.Item label="Создана">
            {new Date(ticket.createdAt).toLocaleString('ru-RU')}
          </Descriptions.Item>
          <Descriptions.Item label="SLA">
            <Tag color={isOverdue ? 'red' : 'green'}>{slaText}</Tag>
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <div style={{ marginBottom: 16 }}>
          <strong>Действия со статусом:</strong>
          <Space style={{ marginTop: 8, flexWrap: 'wrap' }}>
            {getStatusButton('classification', 'На классификацию')}
            {getStatusButton('in_progress', 'В работу')}
            {getStatusButton('waiting_response', 'Ждём ответа')}
            {getStatusButton('pause', 'Пауза')}
            {getStatusButton('closed', 'Закрыть', ticket.status === 'archived')}
            {getStatusButton('archived', 'В архив', ticket.status !== 'closed')}
          </Space>
        </div>
        
        <Tabs defaultActiveKey="interactions">
          <TabPane tab="Взаимодействия" key="interactions">
            <Space.Compact block style={{ marginBottom: 16 }}>
              <TextArea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Добавить комментарий..."
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
              <Button type="primary" onClick={handleAddComment}>
                <MessageOutlined />
              </Button>
              <Button onClick={handleMockCall}>
                <PhoneOutlined /> Звонок
              </Button>
            </Space.Compact>
            
            <Timeline
              items={ticket.interactions
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((int) => ({
                  key: int.id,
                  color: int.type === 'call' ? 'blue' : int.type === 'connection' ? 'green' : 'gray',
                  dot: int.type === 'call' ? <PhoneOutlined /> : int.type === 'connection' ? <LinkOutlined /> : <MessageOutlined />,
                  children: renderInteraction(int)
                }))}
            />
          </TabPane>
          
          <TabPane tab="Аудит-лог" key="audit">
            <Timeline
              items={ticket.auditLog
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((entry) => ({
                  key: entry.id,
                  color: 'gray',
                  children: renderAuditEntry(entry)
                }))}
            />
          </TabPane>
        </Tabs>
      </Card>
      
      <Modal
        title={`Перевод в статус: ${targetStatus ? statusLabels[targetStatus] : ''}`}
        open={statusModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setStatusModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          {targetStatus === 'pause' && (
            <Form.Item
              name="pauseReason"
              label="Причина паузы"
              rules={[{ required: true }]}
            >
              <Select options={pauseReasons.map(({ value, label, stopsSla }) => ({
                value,
                label: `${label}${stopsSla ? ' ✓' : ''}`
              }))} />
            </Form.Item>
          )}
          
          {targetStatus === 'waiting_response' && (
            <Form.Item
              name="waitingReason"
              label="Причина ожидания"
              rules={[{ required: true }]}
            >
              <Select options={waitingReasons} />
            </Form.Item>
          )}
          
          {targetStatus === 'closed' && (
            <>
              <Form.Item
                name="resolutionChannel"
                label="Канал решения"
                rules={[{ required: true, message: 'Выберите канал решения' }]}
              >
                <Select options={resolutionChannels} />
              </Form.Item>
              <Form.Item
                name="resolutionComment"
                label="Комментарий к решению"
              >
                <TextArea rows={3} />
              </Form.Item>
            </>
          )}
          
          <Form.Item
            name="comment"
            label="Комментарий"
            rules={[{ required: true, message: 'Введите комментарий' }]}
          >
            <TextArea rows={3} placeholder="Обязательный комментарий к переходу" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TicketDetailPage;
