import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { formatCurrency } from '../utils/currency';
import { Loading } from '../components/common/Loading';

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

const CartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ItemName = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ItemPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ItemControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundGray};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const ItemTotal = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

const Summary = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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

const PromoCodeSection = styled.div`
  margin: ${({ theme }) => theme.spacing.lg} 0;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const PromoCodeInput = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

export const CartPage: React.FC = () => {
  const { cart, isLoading, updateQuantity, removeFromCart, applyPromoCode, removePromoCode } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = async () => {
    try {
      setPromoError('');
      await applyPromoCode(promoCode);
      setPromoCode('');
    } catch (error: any) {
      setPromoError(error.response?.data?.message || 'Invalid promo code');
    }
  };

  const handleRemovePromo = async () => {
    try {
      await removePromoCode();
    } catch (error) {
      console.error('Failed to remove promo code:', error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <PageContainer>
        <Container>
          <EmptyCart>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Button as={Link} to="/products">
              Continue Shopping
            </Button>
          </EmptyCart>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Title>Shopping Cart</Title>
        <CartGrid>
          <CartItems>
            {cart.items.map((item) => (
              <CartItem key={item.id}>
                <ItemImage
                  src={item.product.imageUrl || '/placeholder-product.png'}
                  alt={item.product.name}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.png';
                  }}
                />
                <ItemInfo>
                  <ItemName to={`/products/${item.product.id}`}>
                    {item.product.name}
                  </ItemName>
                  <ItemPrice>{formatCurrency(item.price)} each</ItemPrice>
                </ItemInfo>
                <ItemControls>
                  <QuantityControl>
                    <QuantityButton
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </QuantityButton>
                    <Quantity>{item.quantity}</Quantity>
                    <QuantityButton
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stockQuantity}
                    >
                      +
                    </QuantityButton>
                  </QuantityControl>
                  <ItemTotal>{formatCurrency(item.price * item.quantity)}</ItemTotal>
                  <RemoveButton onClick={() => removeFromCart(item.productId)}>
                    Remove
                  </RemoveButton>
                </ItemControls>
              </CartItem>
            ))}
          </CartItems>

          <Summary>
            <SummaryTitle>Order Summary</SummaryTitle>
            <SummaryRow>
              <span>Subtotal:</span>
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
            <SummaryTotal>
              <span>Total:</span>
              <span>{formatCurrency(cart.total)}</span>
            </SummaryTotal>

            <PromoCodeSection>
              {cart.promoCode ? (
                <div>
                  <SummaryRow>
                    <span>Promo Code: {cart.promoCode}</span>
                    <RemoveButton onClick={handleRemovePromo}>Remove</RemoveButton>
                  </SummaryRow>
                </div>
              ) : (
                <PromoCodeInput>
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button onClick={handleApplyPromo} disabled={!promoCode}>
                    Apply
                  </Button>
                </PromoCodeInput>
              )}
              {promoError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{promoError}</p>}
            </PromoCodeSection>

            <Button fullWidth size="large" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <Button
              fullWidth
              variant="outline"
              as={Link}
              to="/products"
              style={{ marginTop: '1rem' }}
            >
              Continue Shopping
            </Button>
          </Summary>
        </CartGrid>
      </Container>
    </PageContainer>
  );
};
