import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Sidebar = styled.aside`
  width: 250px;
  background-color: #1a1a2e;
  color: white;
  padding: 20px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 60px;
  }
`;

const Logo = styled.div`
  padding: 0 20px 30px;
  font-size: 1.5rem;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    padding: 0 10px 30px;
    font-size: 1.2rem;
    text-align: center;
  }
`;

const Nav = styled.nav`
  margin-top: 20px;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: ${(props) => (props.$isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)')};
  text-decoration: none;
  transition: all 0.3s;
  background-color: ${(props) => (props.$isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border-left: 3px solid ${(props) => (props.$isActive ? '#667eea' : 'transparent')};

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }

  span {
    margin-left: 10px;

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  padding: 30px;

  @media (max-width: 768px) {
    margin-left: 60px;
    padding: 20px;
  }
`;

const Header = styled.header`
  background-color: white;
  padding: 20px 30px;
  margin: -30px -30px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 15px 20px;
    margin: -20px -20px 20px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  color: #1a1a2e;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Products', icon: '📦' },
  { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { path: '/admin/orders', label: 'Orders', icon: '🛒' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const item = navItems.find((item) => item.path === location.pathname);
    return item?.label || 'Admin Dashboard';
  };

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>🛒 FreshRoute</Logo>
        <Nav>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} $isActive={location.pathname === item.path}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </Nav>
      </Sidebar>

      <MainContent>
        <Header>
          <Title>{getPageTitle()}</Title>
          <UserInfo>
            <Avatar>AD</Avatar>
            <span>Admin</span>
          </UserInfo>
        </Header>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminLayout;
