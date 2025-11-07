import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Review } from '../types';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { wishlistService } from '../services/wishlistService';
import { useCart } from '../contexts/CartContext';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { useAuth } from '../contexts/AuthContext';
import { ReviewForm } from '../components/review/ReviewForm';

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

const WishlistButton = styled(Button)<{ $isInWishlist: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  svg {
    width: 20px;
    height: 20px;
    fill: ${({ $isInWishlist, theme }) => 
      $isInWishlist ? theme.colors.secondary : 'none'};
    stroke: ${({ $isInWishlist, theme }) => 
      $isInWishlist ? theme.colors.secondary : 'currentColor'};
    stroke-width: 2;
  }
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
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

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

        if (user) {
          const inWishlist = await wishlistService.isInWishlist(id);
          setIsInWishlist(inWishlist);
          
          try {
            const userReviews = await reviewService.getUserReviews();
            const hasReviewedThisProduct = userReviews.some(
              (review: Review) => Number(review.productId) === Number(id)
            );
            setUserHasReviewed(hasReviewedThisProduct);
          } catch (error) {
            console.error('Failed to check user reviews:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product.id.toString(), 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product || !user) {
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
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (data: { rating: number; title: string; comment: string }) => {
    if (!product || !id) return;

    try {
      await reviewService.createReview({
        productId: id,
        ...data,
      });

      const updatedReviews = await reviewService.getProductReviews(id, 1, 5);
      setReviews(updatedReviews.reviews);
      setUserHasReviewed(true);
      setShowReviewForm(false);

      alert('Review submitted successfully!');
      
      const updatedProduct = await productService.getProductById(id);
      setProduct(updatedProduct);
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('already reviewed') || errorMessage.includes('duplicate')) {
        setUserHasReviewed(true);
        setShowReviewForm(false);
        alert('You have already reviewed this product.');
      } else {
        alert(errorMessage || 'Failed to submit review. Please try again.');
      }
    }
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowReviewForm(true);
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
            <Category>{typeof product.category === 'string' ? product.category : product.category.name}</Category>
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
              <WishlistButton 
                variant="outline" 
                size="large"
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                $isInWishlist={isInWishlist}
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </WishlistButton>
            </ActionButtons>
          </ProductInfo>
        </ProductGrid>

        <ReviewsSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <SectionTitle style={{ marginBottom: 0 }}>Customer Reviews</SectionTitle>
            {!userHasReviewed && !showReviewForm && (
              <Button onClick={handleWriteReviewClick}>
                Write a Review
              </Button>
            )}
          </div>

          {showReviewForm && (
            <ReviewForm
              productId={id!}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          {userHasReviewed && !showReviewForm && (
            <p style={{ 
              padding: '1rem', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              color: '#0066cc'
            }}>
              ✓ You have already reviewed this product
            </p>
          )}

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
