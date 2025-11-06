import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { Container } from '../components/common/Container';
import { Card } from '../components/common/Card';
import { formatCurrency } from '../utils/currency';

const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  min-height: calc(100vh - 300px);
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const StatCard = styled(Card)`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.huge};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textLight};
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const QuickLinkCard = styled(Card)`
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const QuickLinkIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const QuickLinkTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const QuickLinkDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textLight};
`;

export const AccountDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const orderStats = await orderService.getOrderStats();
        setStats(orderStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <PageContainer>
      <Container>
        <Title>My Account</Title>
        <WelcomeMessage>Welcome back, {user?.name}!</WelcomeMessage>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalOrders}</StatValue>
            <StatLabel>Total Orders</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatCurrency(stats.totalSpent)}</StatValue>
            <StatLabel>Total Spent</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pendingOrders}</StatValue>
            <StatLabel>Pending Orders</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.completedOrders}</StatValue>
            <StatLabel>Completed Orders</StatLabel>
          </StatCard>
        </StatsGrid>

        <QuickLinksGrid>
          <QuickLinkCard as={Link} to="/account/orders">
            <QuickLinkIcon>📦</QuickLinkIcon>
            <QuickLinkTitle>Order History</QuickLinkTitle>
            <QuickLinkDescription>View and track your orders</QuickLinkDescription>
          </QuickLinkCard>

          <QuickLinkCard as={Link} to="/account/profile">
            <QuickLinkIcon>👤</QuickLinkIcon>
            <QuickLinkTitle>Profile Settings</QuickLinkTitle>
            <QuickLinkDescription>Update your personal information</QuickLinkDescription>
          </QuickLinkCard>

          <QuickLinkCard as={Link} to="/wishlist">
            <QuickLinkIcon>♥</QuickLinkIcon>
            <QuickLinkTitle>Wishlist</QuickLinkTitle>
            <QuickLinkDescription>View your saved products</QuickLinkDescription>
          </QuickLinkCard>
        </QuickLinksGrid>
      </Container>
    </PageContainer>
  );
};
