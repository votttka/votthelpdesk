import React from 'react';
import { Layout, Menu, Select } from 'antd';
import { useAuth, ROLE_CONFIGS } from './AuthContext';
import { RoleType } from './types';
import { DashboardOutlined, FileTextOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function MainLayout({ children, currentPath, onNavigate }: MainLayoutProps) {
  const { currentRole, setRole, roleConfig } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
    },
    {
      key: '/tickets',
      icon: <FileTextOutlined />,
      label: 'Заявки',
    },
    ...(roleConfig.canCreate ? [{
      key: '/tickets/new',
      icon: <PlusOutlined />,
      label: 'Создать заявку',
    }] : []),
    ...(roleConfig.canEditSettings ? [{
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    }] : []),
  ];

  const roleOptions = Object.values(ROLE_CONFIGS).map(role => ({
    value: role.key,
    label: role.label,
  }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '20px' }}>HelpDesk Prototype</h1>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentPath]}
            items={menuItems}
            onClick={({ key }) => onNavigate(key)}
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Роль:</span>
          <Select
            value={currentRole}
            options={roleOptions}
            onChange={(value) => setRole(value as RoleType)}
            style={{ width: 150 }}
            dropdownStyle={{ zIndex: 1000 }}
          />
        </div>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        HelpDesk Prototype ©{new Date().getFullYear()} - Демонстрационный макет
      </Footer>
    </Layout>
  );
}
