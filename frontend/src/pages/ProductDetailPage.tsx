import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Review, RatingSummary } from '../types';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../contexts/CartContext';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  min-height: calc(100vh - 300px);
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xxl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

const ImageContainer = styled.div`
  img {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Category = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.2;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Stars = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const ReviewCount = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.huge};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const OriginalPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: line-through;
`;

const SaleTag = styled.span`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textLight};
`;

const StockInfo = styled.div<{ inStock: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ inStock, theme }) => (inStock ? theme.colors.success : theme.colors.error)};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ReviewsSection = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xxl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ReviewCard = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => `${theme.spacing.xl} 0`};

  &:last-child {
    border-bottom: none;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ReviewAuthor = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const ReviewDate = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ReviewComment = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.6;
`;

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        const [productData, reviewsData] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id, 1, 5),
        ]);
        setProduct(productData);
        setReviews(reviewsData.reviews);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product.id, 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <PageContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h1>Product not found</h1>
            <Button onClick={() => navigate('/products')}>Back to Products</Button>
          </div>
        </Container>
      </PageContainer>
    );
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice : product.price;

  return (
    <PageContainer>
      <Container>
        <ProductGrid>
          <ImageContainer>
            <img
              src={product.imageUrl || '/placeholder-product.png'}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.png';
              }}
            />
          </ImageContainer>

          <ProductInfo>
            <Category>{product.category}</Category>
            <Title>{product.name}</Title>
            
            {product.averageRating > 0 && (
              <Rating>
                <Stars>{renderStars(product.averageRating)}</Stars>
                <span>({product.averageRating.toFixed(1)})</span>
                <ReviewCount>{product.reviewCount} reviews</ReviewCount>
              </Rating>
            )}

            <PriceContainer>
              <Price>{formatCurrency(displayPrice!)}</Price>
              {hasDiscount && (
                <>
                  <OriginalPrice>{formatCurrency(product.price)}</OriginalPrice>
                  <SaleTag>SALE</SaleTag>
                </>
              )}
            </PriceContainer>

            <Description>{product.description}</Description>

            <StockInfo inStock={product.stockQuantity > 0}>
              {product.stockQuantity > 0
                ? `In Stock (${product.stockQuantity} available)`
                : 'Out of Stock'}
            </StockInfo>

            <ActionButtons>
              <Button
                size="large"
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
              >
                Add to Cart
              </Button>
              <Button variant="outline" size="large">
                Add to Wishlist
              </Button>
            </ActionButtons>
          </ProductInfo>
        </ProductGrid>

        <ReviewsSection>
          <SectionTitle>Customer Reviews</SectionTitle>
          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id}>
                <ReviewHeader>
                  <div>
                    <Stars>{renderStars(review.rating)}</Stars>
                    <ReviewAuthor> {review.user?.name || 'Anonymous'}</ReviewAuthor>
                    {review.isVerifiedPurchase && (
                      <span style={{ color: 'green', marginLeft: '0.5rem' }}>✓ Verified Purchase</span>
                    )}
                  </div>
                  <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
                </ReviewHeader>
                {review.title && <h4>{review.title}</h4>}
                <ReviewComment>{review.comment}</ReviewComment>
              </ReviewCard>
            ))
          )}
        </ReviewsSection>
      </Container>
    </PageContainer>
  );
};
