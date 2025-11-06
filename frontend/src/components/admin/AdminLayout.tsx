import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
`;

const Sidebar = styled.aside<{ $isOpen: boolean }>`
  width: 260px;
  background: #1a1a1a;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: ${(props) => (props.$isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    z-index: 1000;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #333;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00a859;
  margin: 0;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  color: ${(props) => (props.$active ? '#00a859' : '#ccc')};
  text-decoration: none;
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  background: ${(props) => (props.$active ? 'rgba(0, 168, 89, 0.1)' : 'transparent')};
  border-left: 3px solid ${(props) => (props.$active ? '#00a859' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 168, 89, 0.1);
    color: #00a859;
  }

  svg {
    margin-right: 0.75rem;
    width: 20px;
    height: 20px;
  }
`;

const SidebarFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #333;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: #999;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #c82333;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;

  @media (max-width: 768px) {
    display: block;
  }
`;

const PageTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ViewSiteLink = styled(Link)`
  padding: 0.5rem 1rem;
  background: #00a859;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #008a47;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const Overlay = styled.div<{ $show: boolean }>`
  display: ${(props) => (props.$show ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (min-width: 769px) {
    display: none;
  }
`;

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/products') return 'Product Management';
    if (path === '/admin/orders') return 'Order Management';
    if (path === '/admin/categories') return 'Category Management';
    if (path === '/admin/analytics') return 'Analytics';
    if (path === '/admin/settings') return 'Settings';
    return 'Admin';
  };

  return (
    <LayoutContainer>
      <Overlay $show={sidebarOpen} onClick={closeSidebar} />
      
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>FreshRoute Admin</Logo>
        </SidebarHeader>

        <Nav>
          <NavItem to="/admin" $active={isActive('/admin')} onClick={closeSidebar}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NavItem>

          <NavItem to="/admin/products" $active={isActive('/admin/products')} onClick={closeSidebar}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Products
          </NavItem>

          <NavItem to="/admin/orders" $active={isActive('/admin/orders')} onClick={closeSidebar}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
          </NavItem>

          <NavItem to="/admin/categories" $active={isActive('/admin/categories')} onClick={closeSidebar}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categories
          </NavItem>

          <NavItem to="/admin/analytics" $active={isActive('/admin/analytics')} onClick={closeSidebar}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </NavItem>

          <NavItem to="/admin/settings" $active={isActive('/admin/settings')} onClick={closeSidebar}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </NavItem>
        </Nav>

        <SidebarFooter>
          <UserInfo>
            <UserName>{user?.firstName} {user?.lastName}</UserName>
            <UserRole>Administrator</UserRole>
          </UserInfo>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </MenuButton>
            <PageTitle>{getPageTitle()}</PageTitle>
          </div>
          <HeaderActions>
            <ViewSiteLink to="/">View Site</ViewSiteLink>
          </HeaderActions>
        </Header>

        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminLayout;
