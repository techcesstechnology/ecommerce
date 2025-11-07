import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import paymentService from '../services/paymentService';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const PageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: calc(100vh - ${({ theme }) => theme.spacing.xxxl} - 80px);
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const PaymentCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  color: ${({ theme}) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Spinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
  margin: ${({ theme }) => theme.spacing.xl} auto;
`;

const StatusMessage = styled.div<{ type: 'info' | 'success' | 'error' }>`
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme, type }) =>
    type === 'success'
      ? `${theme.colors.success}22`
      : type === 'error'
      ? `${theme.colors.error}22`
      : `${theme.colors.primary}22`};
  color: ${({ theme, type }) =>
    type === 'success'
      ? theme.colors.success
      : type === 'error'
      ? theme.colors.error
      : theme.colors.primary};
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.lg};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'initiating' | 'processing' | 'success' | 'error'>('initiating');
  const [message, setMessage] = useState('Initializing payment...');
  const [transactionReference, setTransactionReference] = useState<string | null>(null);

  const { paymentMethod, customerPhone } = location.state || {};
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    // If we have payment method from state, initiate immediately
    if (paymentMethod) {
      initiatePayment();
    } else {
      // Otherwise, fetch order details to get payment method
      fetchOrderAndInitiatePayment();
    }
  }, [orderId]);

  const fetchOrderAndInitiatePayment = async () => {
    try {
      // First, try to fetch existing payment transaction for this order
      // This will have the customer phone if it was already initiated
      try {
        const payments = await paymentService.getPaymentsByOrderId(Number(orderId));
        
        if (payments && payments.length > 0) {
          // Use the most recent payment transaction
          const latestPayment = payments[0];
          
          // If payment is already processing or paid, just poll for status
          if (latestPayment.status === 'processing' || latestPayment.status === 'paid') {
            setTransactionReference(latestPayment.transactionReference);
            setStatus('processing');
            setMessage('Payment already in progress. Checking status...');
            startPolling(latestPayment.transactionReference);
            return;
          }
          
          // If payment failed or cancelled, use the stored phone number to retry
          if (latestPayment.customerPhone) {
            initiatePaymentWithMethod(latestPayment.paymentMethod, latestPayment.customerPhone);
            return;
          }
        }
      } catch (paymentError) {
        console.log('No existing payment found, creating new one');
      }
      
      // Fallback: Fetch order details to get payment method
      const { orderService } = await import('../services/orderService');
      const order = await orderService.getOrderById(orderId!);
      
      if (!order) {
        setStatus('error');
        setMessage('Order not found');
        return;
      }

      setOrderDetails(order);
      
      // Initiate payment (phone number will be missing for EcoCash on reload - this is a limitation)
      initiatePaymentWithMethod(order.paymentMethod, customerPhone);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setStatus('error');
      setMessage('Failed to load order details');
    }
  };

  const initiatePaymentWithMethod = async (method: string, phone?: string) => {
    try {
      setStatus('initiating');
      setMessage('Initiating payment...');

      const result = await paymentService.initiatePayment({
        orderId: Number(orderId),
        paymentMethod: method,
        customerPhone: phone,
        currency: 'ZWL',
      });

      setTransactionReference(result.transactionReference);

      if (method === 'cash') {
        setStatus('success');
        setMessage(result.message);
        setTimeout(() => {
          navigate(`/order-success/${orderId}`);
        }, 2000);
      } else {
        setStatus('processing');
        setMessage(
          method === 'ecocash'
            ? `Payment initiated. Please check your phone${phone ? ` (${phone})` : ''} and enter your EcoCash PIN to complete the payment.`
            : 'Processing your payment. Please wait...'
        );
        startPolling(result.transactionReference);
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.message ||
          error.message ||
          'Failed to initiate payment. Please try again.'
      );
    }
  };

  const initiatePayment = async () => {
    if (!paymentMethod) return;
    await initiatePaymentWithMethod(paymentMethod, customerPhone);
  };

  const startPolling = (reference: string) => {
    let pollCount = 0;
    const maxPolls = 60; // Poll for up to 5 minutes (60 * 5 seconds)

    const pollInterval = setInterval(async () => {
      try {
        const paymentStatus = await paymentService.checkPaymentStatus(reference);

        if (paymentStatus.status === 'paid') {
          clearInterval(pollInterval);
          setStatus('success');
          setMessage('Payment successful! Redirecting to order confirmation...');
          setTimeout(() => {
            navigate(`/order-success/${orderId}`);
          }, 2000);
        } else if (paymentStatus.status === 'failed') {
          clearInterval(pollInterval);
          setStatus('error');
          setMessage(
            paymentStatus.errorMessage || 'Payment failed. Please try again or use a different payment method.'
          );
        } else if (paymentStatus.status === 'cancelled') {
          clearInterval(pollInterval);
          setStatus('error');
          setMessage('Payment was cancelled. Please try again.');
        }

        pollCount++;
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setStatus('error');
          setMessage(
            'Payment is taking longer than expected. Please check your order status in your account.'
          );
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        pollCount++;
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setStatus('error');
          setMessage(
            'Unable to verify payment status. Please check your order status in your account.'
          );
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleRetry = () => {
    initiatePayment();
  };

  const handleGoToOrders = () => {
    navigate('/account/orders');
  };

  return (
    <PageContainer>
      <Container>
        <PaymentCard>
          <Title>
            {status === 'initiating' && 'Initializing Payment'}
            {status === 'processing' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Failed'}
          </Title>

          {(status === 'initiating' || status === 'processing') && <Spinner />}

          {status === 'success' && <div style={{ fontSize: '4rem' }}>✓</div>}
          {status === 'error' && <div style={{ fontSize: '4rem', color: '#dc3545' }}>✗</div>}

          <Subtitle>{message}</Subtitle>

          {transactionReference && (
            <StatusMessage type="info">
              <strong>Transaction Reference:</strong> {transactionReference}
            </StatusMessage>
          )}

          {status === 'error' && (
            <div>
              <Button onClick={handleRetry}>Retry Payment</Button>
              <Button onClick={handleGoToOrders} style={{ marginLeft: '1rem', backgroundColor: '#6c757d' }}>
                View My Orders
              </Button>
            </div>
          )}
        </PaymentCard>
      </Container>
    </PageContainer>
  );
};
