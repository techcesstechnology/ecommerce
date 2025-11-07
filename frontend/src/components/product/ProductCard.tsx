import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../common/Button';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { wishlistService } from '../../services/wishlistService';
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

const WishlistIcon = styled.button<{ $isInWishlist: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  z-index: 1;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  svg {
    width: 18px;
    height: 18px;
    fill: ${({ $isInWishlist, theme }) => 
      $isInWishlist ? theme.colors.secondary : 'none'};
    stroke: ${({ $isInWishlist, theme }) => 
      $isInWishlist ? theme.colors.secondary : theme.colors.textMuted};
    stroke-width: 2;
  }
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

const StockInfo = styled.span<{ $inStock: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ $inStock, theme }) => ($inStock ? theme.colors.success : theme.colors.error)};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (user) {
        try {
          const inWishlist = await wishlistService.isInWishlist(product.id.toString());
          setIsInWishlist(inWishlist);
        } catch (error) {
          console.error('Failed to check wishlist:', error);
        }
      }
    };
    checkWishlist();
  }, [product.id, user]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id.toString(), 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id.toString());
        setIsInWishlist(false);
      } else {
        await wishlistService.addToWishlist(product.id.toString());
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    } finally {
      setWishlistLoading(false);
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
        <WishlistIcon
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          $isInWishlist={isInWishlist}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </WishlistIcon>
        {hasDiscount && <Badge type="sale">SALE</Badge>}
        {product.isFeatured && !hasDiscount && <Badge type="featured">Featured</Badge>}
      </ImageContainer>
      <Content>
        <Category>{typeof product.category === 'string' ? product.category : product.category.name}</Category>
        <Title>{product.name}</Title>
        {product.averageRating > 0 && (
          <Rating>
            <Stars>{renderStars(product.averageRating)}</Stars>
            <ReviewCount>({product.reviewCount})</ReviewCount>
          </Rating>
        )}
        <StockInfo $inStock={product.stockQuantity > 0}>
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
