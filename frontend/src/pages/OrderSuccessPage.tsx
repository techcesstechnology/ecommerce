import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/date';

const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xxxl} 0`};
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  min-height: calc(100vh - 300px);
`;

const SuccessCard = styled(Card)`
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const OrderInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;

      try {
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <PageContainer>
        <Container>
          <SuccessCard>
            <h2>Order not found</h2>
            <Button as={Link} to="/">
              Return to Home
            </Button>
          </SuccessCard>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <SuccessCard>
          <SuccessIcon>✓</SuccessIcon>
          <Title>Order Placed Successfully!</Title>
          <Subtitle>
            Thank you for your order. We've received your order and will start processing it shortly.
          </Subtitle>

          <OrderInfo>
            <InfoRow>
              <InfoLabel>Order Number:</InfoLabel>
              <span>{order.orderNumber}</span>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Order Date:</InfoLabel>
              <span>{formatDateTime(order.createdAt)}</span>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Total Amount:</InfoLabel>
              <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                {formatCurrency(order.total)}
              </span>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Payment Method:</InfoLabel>
              <span style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Delivery Address:</InfoLabel>
              <span>
                {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.province}
              </span>
            </InfoRow>
          </OrderInfo>

          <ActionButtons>
            <Button as={Link} to="/account/orders" size="large">
              View Order Details
            </Button>
            <Button as={Link} to="/" variant="outline" size="large">
              Continue Shopping
            </Button>
          </ActionButtons>
        </SuccessCard>
      </Container>
    </PageContainer>
  );
};
