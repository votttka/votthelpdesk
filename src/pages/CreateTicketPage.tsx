import React from 'react';
import { Form, Input, Select, Radio, Button, Card, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useHelpDeskStore } from '../store/helpdeskStore';
import type { TicketType } from '../types';

const { TextArea } = Input;

const typeOptions = [
  { value: 'config_update', label: 'Обновление конфигурации' },
  { value: 'data_exchange', label: 'Настройка обмена данными' },
  { value: 'reporting_error', label: 'Ошибка в отчётности' },
  { value: 'consultation', label: 'Консультация' },
  { value: 'password_reset', label: 'Сброс пароля' },
  { value: 'update_install', label: 'Установка обновления' },
  { value: 'access_setup', label: 'Настройка прав доступа' },
  { value: 'other', label: 'Другое' }
];

const contractorOptions = [
  { value: 'ООО "Ромашка"' },
  { value: 'АО "Технопарк"' },
  { value: 'ИП Иванов И.И.' },
  { value: 'ГУП "Городские системы"' },
  { value: 'ООО "Альфа-Групп"' },
  { value: 'ЗАО "Бета Софт"' },
  { value: 'ООО "Вектор"' },
  { value: 'АО "Гамма Трейд"' }
];

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const createTicket = useHelpDeskStore((state) => state.createTicket);
  const users = useHelpDeskStore((state) => state.users);
  const currentUserId = useHelpDeskStore((state) => state.currentUserId);
  
  const currentUser = users.find((u) => u.id === currentUserId);
  
  const handleSubmit = (values: any) => {
    if (values.type === 'other' && !values.typeComment) {
      message.error('Для типа "Другое" требуется комментарий');
      return;
    }
    
    const ticket = createTicket({
      topic: values.topic,
      description: values.description,
      contractor: values.contractor,
      type: values.type,
      typeComment: values.typeComment,
      isClientTicket: values.isClientTicket === 'client',
      assignee: currentUser?.name,
      line: 1,
      status: 'new'
    });
    
    message.success(`Заявка ${ticket.number} создана`);
    navigate(`/tickets/${ticket.id}`);
  };
  
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Создание заявки</h1>
      
      <Card style={{ maxWidth: 800 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isClientTicket: 'client'
          }}
        >
          <Form.Item
            name="topic"
            label="Тема"
            rules={[{ required: true, message: 'Введите тему заявки' }]}
          >
            <Input placeholder="Краткое описание проблемы" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Введите описание проблемы' }]}
          >
            <TextArea rows={4} placeholder="Подробное описание проблемы" />
          </Form.Item>
          
          <Form.Item
            name="contractor"
            label="Контрагент"
            rules={[{ required: true, message: 'Выберите контрагента' }]}
          >
            <Select
              placeholder="Выберите контрагента"
              options={contractorOptions}
              showSearch
            />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Тип обращения"
            rules={[{ required: true, message: 'Выберите тип обращения' }]}
          >
            <Select
              placeholder="Выберите тип обращения"
              options={typeOptions}
            />
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'other' && (
                <Form.Item
                  name="typeComment"
                  label="Комментарий к типу"
                  rules={[{ required: true, message: 'Введите комментарий' }]}
                >
                  <TextArea rows={2} placeholder="Почему выбран тип 'Другое'?" />
                </Form.Item>
              )
            }
          </Form.Item>
          
          <Form.Item
            name="isClientTicket"
            label="Тип заявки"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="client">Клиентская</Radio>
              <Radio value="internal">Внутренняя</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Создать заявку
              </Button>
              <Button onClick={() => navigate('/tickets')}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTicketPage;
