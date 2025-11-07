import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
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

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  color: ${({ theme }) => theme.colors.text};
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

/**
 * Payment Complete Page - Handles Pesepay redirect callbacks
 * This page is reached after Pesepay redirects the user back from their payment gateway
 */
export const PaymentCompletePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get transaction reference from URL params (Pesepay includes this)
      const transactionReference = searchParams.get('reference') || searchParams.get('transactionReference');

      if (!transactionReference) {
        // No reference in URL, this might be an error
        setStatus('error');
        setMessage('Payment verification failed. Please check your order history.');
        setTimeout(() => navigate('/account/orders'), 3000);
        return;
      }

      // Check payment status
      const paymentStatus = await paymentService.checkPaymentStatus(transactionReference);

      if (paymentStatus.status === 'paid') {
        setStatus('success');
        setMessage('Payment successful! Redirecting to your order...');
        
        // Navigate to order success page using order ID from payment status
        setTimeout(() => {
          if (paymentStatus.orderId) {
            navigate(`/order-success/${paymentStatus.orderId}`);
          } else {
            navigate('/account/orders');
          }
        }, 2000);
      } else if (paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled') {
        setStatus('error');
        setMessage(
          paymentStatus.errorMessage || 'Payment was not successful. Please try again.'
        );
        setTimeout(() => navigate('/account/orders'), 3000);
      } else {
        // Still processing
        setStatus('checking');
        setMessage('Payment is being processed. Please wait...');
        
        // Poll again in a few seconds
        setTimeout(verifyPayment, 3000);
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setStatus('error');
      setMessage('Unable to verify payment. Please check your order history.');
      setTimeout(() => navigate('/account/orders'), 3000);
    }
  };

  return (
    <PageContainer>
      <Container>
        <PaymentCard>
          <Title>
            {status === 'checking' && 'Verifying Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Verification'}
          </Title>

          {status === 'checking' && <Spinner />}
          {status === 'success' && <div style={{ fontSize: '4rem' }}>✓</div>}
          {status === 'error' && <div style={{ fontSize: '4rem', color: '#dc3545' }}>⚠</div>}

          <Subtitle>{message}</Subtitle>
        </PaymentCard>
      </Container>
    </PageContainer>
  );
};
