import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { Container } from '../components/common/Container';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  min-height: calc(100vh - 300px);
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const OrderCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const OrderNumber = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const OrderDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const OrderStatus = styled.span<{ status: string }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  background-color: ${({ status, theme }) =>
    status === 'delivered' || status === 'completed'
      ? theme.colors.success + '22'
      : status === 'cancelled'
      ? theme.colors.error + '22'
      : theme.colors.warning + '22'};
  color: ${({ status, theme }) =>
    status === 'delivered' || status === 'completed'
      ? theme.colors.success
      : status === 'cancelled'
      ? theme.colors.error
      : theme.colors.warning};
  text-transform: capitalize;
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const OrderItem = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textLight};
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const OrderTotal = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const result = await orderService.getMyOrders(1, 20);
        setOrders(result.orders);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (orders.length === 0) {
    return (
      <PageContainer>
        <Container>
          <Title>Order History</Title>
          <EmptyState>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here!</p>
            <Link to="/products">Browse Products</Link>
          </EmptyState>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Title>Order History</Title>
        {orders.map((order) => (
          <OrderCard key={order.id} as={Link} to={`/account/orders/${order.id}`}>
            <OrderHeader>
              <OrderInfo>
                <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                <OrderDate>Placed on {formatDate(order.createdAt)}</OrderDate>
              </OrderInfo>
              <OrderStatus status={order.status}>{order.status}</OrderStatus>
            </OrderHeader>
            <OrderItems>
              {order.items.slice(0, 3).map((item, index) => (
                <OrderItem key={index}>
                  {item.quantity}x {item.name}
                </OrderItem>
              ))}
              {order.items.length > 3 && (
                <OrderItem>+ {order.items.length - 3} more items</OrderItem>
              )}
            </OrderItems>
            <OrderFooter>
              <OrderTotal>Total: {formatCurrency(order.total)}</OrderTotal>
              <span style={{ color: '#666' }}>View Details →</span>
            </OrderFooter>
          </OrderCard>
        ))}
      </Container>
    </PageContainer>
  );
};
