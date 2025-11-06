import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
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
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const OrderSummary = styled(Card)`
  height: fit-content;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const SummaryTotal = styled(SummaryRow)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding-top: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.md};
  border-top: 2px solid ${({ theme }) => theme.colors.border};
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error}22;
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const CheckoutPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingData, setShippingData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    deliveryInstructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cash');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const order = await orderService.checkout({
        shippingAddress: {
          ...shippingData,
          country: 'Zimbabwe',
        },
        paymentMethod,
      });

      await clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Container>
        <Title>Checkout</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          <CheckoutGrid>
            <div>
              <Section>
                <SectionTitle>Shipping Address</SectionTitle>
                <FormGroup>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={shippingData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    placeholder="+263 123 456 789"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="addressLine1">Street Address *</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={shippingData.addressLine1}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="addressLine2">Apartment, Suite, etc.</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={shippingData.addressLine2}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="province">Province *</Label>
                    <Select
                      id="province"
                      name="province"
                      value={shippingData.province}
                      onChange={(e) => setShippingData({ ...shippingData, province: e.target.value })}
                      required
                    >
                      <option value="">Select Province</option>
                      <option value="Harare">Harare</option>
                      <option value="Bulawayo">Bulawayo</option>
                      <option value="Manicaland">Manicaland</option>
                      <option value="Mashonaland Central">Mashonaland Central</option>
                      <option value="Mashonaland East">Mashonaland East</option>
                      <option value="Mashonaland West">Mashonaland West</option>
                      <option value="Masvingo">Masvingo</option>
                      <option value="Matabeleland North">Matabeleland North</option>
                      <option value="Matabeleland South">Matabeleland South</option>
                      <option value="Midlands">Midlands</option>
                    </Select>
                  </FormGroup>
                </FormRow>
                <FormGroup>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={shippingData.postalCode}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                  <Input
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    value={shippingData.deliveryInstructions}
                    onChange={handleInputChange}
                    placeholder="e.g., Ring the doorbell, leave at gate"
                  />
                </FormGroup>
              </Section>

              <Section>
                <SectionTitle>Payment Method</SectionTitle>
                <FormGroup>
                  <Label>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Cash on Delivery
                  </Label>
                  <Label>
                    <input
                      type="radio"
                      name="payment"
                      value="ecocash"
                      checked={paymentMethod === 'ecocash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    EcoCash Mobile Money
                  </Label>
                  <Label>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Debit/Credit Card
                  </Label>
                </FormGroup>
              </Section>
            </div>

            <OrderSummary>
              <SectionTitle>Order Summary</SectionTitle>
              <SummaryRow>
                <span>Subtotal ({cart.items.length} items):</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </SummaryRow>
              {cart.discount > 0 && (
                <SummaryRow>
                  <span>Discount:</span>
                  <span style={{ color: 'green' }}>-{formatCurrency(cart.discount)}</span>
                </SummaryRow>
              )}
              <SummaryRow>
                <span>Tax (15%):</span>
                <span>{formatCurrency(cart.tax)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Shipping:</span>
                <span>FREE</span>
              </SummaryRow>
              <SummaryTotal>
                <span>Total:</span>
                <span>{formatCurrency(cart.total)}</span>
              </SummaryTotal>
              <Button
                type="submit"
                fullWidth
                size="large"
                disabled={isSubmitting}
                style={{ marginTop: '1.5rem' }}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </OrderSummary>
          </CheckoutGrid>
        </form>
      </Container>
    </PageContainer>
  );
};
