import React from 'react';
import { Card, Form, Input, Select, Button, message, Radio } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Ticket, StatusType, TICKET_TYPES, CONTRACTORS } from './types';
import { addTicket } from './data';
import { useAuth } from './AuthContext';

const { Option } = Select;
const { TextArea } = Input;

export function CreateTicket() {
  const navigate = useNavigate();
  const { roleConfig } = useAuth();
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = React.useState<string>('');

  if (!roleConfig.canCreate) {
    return <Card>У вас нет прав для создания заявок</Card>;
  }

  const handleSubmit = (values: Record<string, unknown>) => {
    if (selectedType === 'Другое' && !values.typeComment) {
      message.error('Для типа "Другое" необходимо указать комментарий');
      return;
    }

    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      number: `REQ-${String(Date.now()).slice(-5)}`,
      theme: values.theme as string,
      description: values.description as string,
      contractor: values.contractor as string,
      type: values.type as string,
      typeComment: values.typeComment as string,
      status: 'new' as StatusType,
      isClientFacing: values.isClientFacing === 'client',
      assignee: undefined,
      line: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaTimer: 0,
      slaPaused: false,
      auditLog: [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        action: 'Создание заявки',
        author: 'Пользователь',
        authorRole: 'operator',
      }],
      interactions: [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: 'comment',
        author: 'Система',
        content: 'Заявка создана',
      }],
    };

    addTicket(newTicket);
    message.success('Заявка создана');
    navigate('/tickets');
  };

  return (
    <Card title="Создание новой заявки">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="theme"
          label="Тема"
          rules={[{ required: true, message: 'Введите тему' }]}
        >
          <Input placeholder="Краткое описание проблемы" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Введите описание' }]}
        >
          <TextArea rows={4} placeholder="Подробное описание проблемы" />
        </Form.Item>

        <Form.Item
          name="contractor"
          label="Контрагент"
          rules={[{ required: true, message: 'Выберите контрагента' }]}
        >
          <Select placeholder="Выберите контрагента">
            {CONTRACTORS.map(c => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="isClientFacing"
          label="Тип заявки"
          rules={[{ required: true, message: 'Выберите тип' }]}
          initialValue="client"
        >
          <Radio.Group>
            <Radio value="client">Клиентская</Radio>
            <Radio value="internal">Внутренняя</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="type"
          label="Тип обращения"
          rules={[{ required: true, message: 'Выберите тип обращения' }]}
        >
          <Select 
            placeholder="Выберите тип обращения"
            onChange={(value) => setSelectedType(value)}
          >
            {TICKET_TYPES.map(t => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
        </Form.Item>

        {selectedType === 'Другое' && (
          <Form.Item
            name="typeComment"
            label="Комментарий к типу"
            rules={[{ required: true, message: 'Укажите комментарий для типа "Другое"' }]}
          >
            <TextArea rows={2} placeholder="Опишите тип обращения" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Создать заявку
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/tickets')}>
            Отмена
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
