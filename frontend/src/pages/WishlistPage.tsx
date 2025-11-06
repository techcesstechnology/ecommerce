import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { WishlistItem } from '../types';
import { wishlistService } from '../services/wishlistService';
import { useCart } from '../contexts/CartContext';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { ProductCard } from '../components/product/ProductCard';
import { Loading } from '../components/common/Loading';

const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  min-height: calc(100vh - 300px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
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

export const WishlistPage: React.FC = () => {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      const items = await wishlistService.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await wishlistService.clearWishlist();
        setWishlistItems([]);
      } catch (error) {
        console.error('Failed to clear wishlist:', error);
      }
    }
  };

  const handleAddAllToCart = async () => {
    try {
      for (const item of wishlistItems) {
        await addToCart(item.product.id, 1);
      }
      alert('All items added to cart!');
    } catch (error) {
      console.error('Failed to add items to cart:', error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (wishlistItems.length === 0) {
    return (
      <PageContainer>
        <Container>
          <Title>My Wishlist</Title>
          <EmptyState>
            <h2>Your wishlist is empty</h2>
            <p>Save your favorite products for later!</p>
            <Button as={Link} to="/products">
              Browse Products
            </Button>
          </EmptyState>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>My Wishlist ({wishlistItems.length} items)</Title>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button onClick={handleAddAllToCart}>Add All to Cart</Button>
            <Button variant="outline" onClick={handleClearWishlist}>
              Clear Wishlist
            </Button>
          </div>
        </Header>
        <ProductsGrid>
          {wishlistItems.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </ProductsGrid>
      </Container>
    </PageContainer>
  );
};
