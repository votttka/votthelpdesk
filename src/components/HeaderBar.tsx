import React from 'react';
import { Layout, Menu, Select, Button, Space } from 'antd';
import { 
  DashboardOutlined, 
  PlusCircleOutlined, 
  SettingOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHelpDeskStore } from '../store/helpdeskStore';
import type { Role } from '../types';

const { Header } = Layout;

const roleLabels: Record<Role, string> = {
  operator: 'Оператор',
  engineer: 'Инженер',
  supervisor: 'Супервизор',
  lead: 'Лид',
  admin: 'Администратор',
  auditor: 'Аудитор'
};

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const users = useHelpDeskStore((state) => state.users);
  const currentUserId = useHelpDeskStore((state) => state.currentUserId);
  const setCurrentUser = useHelpDeskStore((state) => state.setCurrentUser);
  
  const currentUser = users.find((u) => u.id === currentUserId);
  
  const handleRoleChange = (userId: string) => {
    setCurrentUser(userId);
  };
  
  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Дашборд' },
    { key: '/tickets', icon: <DashboardOutlined />, label: 'Заявки' },
    { key: '/create', icon: <PlusCircleOutlined />, label: 'Создать' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Настройки' }
  ];
  
  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginRight: '24px' }}>
          HelpDesk Prototype
        </span>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderBottom: 'none' }}
        />
      </div>
      
      <Space>
        <Select
          value={currentUserId}
          onChange={handleRoleChange}
          style={{ width: 200 }}
          options={users.map((u) => ({
            value: u.id,
            label: `${u.name} (${roleLabels[u.role]})`
          }))}
          prefix={<UserOutlined />}
        />
        <Button type="primary" ghost onClick={() => navigate('/create')}>
          Новая заявка
        </Button>
      </Space>
    </Header>
  );
};

export default HeaderBar;
