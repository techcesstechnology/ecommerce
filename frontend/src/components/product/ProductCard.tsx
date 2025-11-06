import React from 'react';
import styled from 'styled-components';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../common/Button';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.medium};
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-4px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 75%;
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  overflow: hidden;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Badge = styled.span<{ type?: 'sale' | 'featured' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background-color: ${({ type, theme }) =>
    type === 'sale' ? theme.colors.secondary : theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Category = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Stars = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ReviewCount = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  margin-top: auto;
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const OriginalPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: line-through;
`;

const StockInfo = styled.span<{ inStock: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ inStock, theme }) => (inStock ? theme.colors.success : theme.colors.error)};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice : product.price;

  return (
    <CardContainer onClick={handleCardClick}>
      <ImageContainer>
        <ProductImage
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.png';
          }}
        />
        {hasDiscount && <Badge type="sale">SALE</Badge>}
        {product.isFeatured && !hasDiscount && <Badge type="featured">Featured</Badge>}
      </ImageContainer>
      <Content>
        <Category>{product.category}</Category>
        <Title>{product.name}</Title>
        {product.averageRating > 0 && (
          <Rating>
            <Stars>{renderStars(product.averageRating)}</Stars>
            <ReviewCount>({product.reviewCount})</ReviewCount>
          </Rating>
        )}
        <StockInfo inStock={product.stockQuantity > 0}>
          {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
        </StockInfo>
        <PriceContainer>
          <Price>{formatCurrency(displayPrice!)}</Price>
          {hasDiscount && <OriginalPrice>{formatCurrency(product.price)}</OriginalPrice>}
        </PriceContainer>
        <Button
          fullWidth
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0}
        >
          Add to Cart
        </Button>
      </Content>
    </CardContainer>
  );
};
