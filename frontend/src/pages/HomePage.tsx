import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/common/Button';
import { Container } from '../components/common/Container';
import { Loading } from '../components/common/Loading';

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDark} 100%);
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => `${theme.spacing.xxxl} 0`};
`;

const HeroContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.huge};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.2;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes.xxxl};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  opacity: 0.9;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: center;
  }
`;

const HeroImage = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.borderRadius.xl};
  }
`;

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing.xxxl} 0`};
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SectionSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLight};
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const CategoryCard = styled(Link)`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all ${({ theme }) => theme.transitions.medium};
  text-decoration: none;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-4px);
  }
`;

const CategoryIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CategoryName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const ViewAllButton = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xxl};
`;

const categories = [
  { name: 'Fresh Produce', icon: '🥬', path: '/products?category=Fresh Produce' },
  { name: 'Dairy & Eggs', icon: '🥛', path: '/products?category=Dairy' },
  { name: 'Meat & Seafood', icon: '🥩', path: '/products?category=Meat' },
  { name: 'Bakery', icon: '🍞', path: '/products?category=Bakery' },
  { name: 'Pantry', icon: '🥫', path: '/products?category=Pantry' },
  { name: 'Beverages', icon: '🧃', path: '/products?category=Beverages' },
];

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await productService.getFeaturedProducts();
        setFeaturedProducts(products.slice(0, 8));
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <>
      <HeroSection>
        <HeroContent>
          <HeroText>
            <HeroTitle>Fresh Groceries Delivered to Your Door</HeroTitle>
            <HeroSubtitle>
              Shop from Zimbabwe's best selection of fresh produce, dairy, meat, and more. Free
              delivery on orders over ZWL $500!
            </HeroSubtitle>
            <HeroButtons>
              <Button as={Link} to="/products" size="large">
                Shop Now
              </Button>
              <Button as={Link} to="/products?onSale=true" variant="outline" size="large">
                View Deals
              </Button>
            </HeroButtons>
          </HeroText>
          <HeroImage>
            <img
              src="/hero-groceries.jpg"
              alt="Fresh Groceries"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';
              }}
            />
          </HeroImage>
        </HeroContent>
      </HeroSection>

      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>Shop by Category</SectionTitle>
            <SectionSubtitle>Find exactly what you need</SectionSubtitle>
          </SectionHeader>
          <CategoriesGrid>
            {categories.map((category) => (
              <CategoryCard key={category.name} to={category.path}>
                <CategoryIcon>{category.icon}</CategoryIcon>
                <CategoryName>{category.name}</CategoryName>
              </CategoryCard>
            ))}
          </CategoriesGrid>
        </Container>
      </Section>

      <Section style={{ backgroundColor: '#F5F5F5' }}>
        <Container>
          <SectionHeader>
            <SectionTitle>Featured Products</SectionTitle>
            <SectionSubtitle>Hand-picked favorites just for you</SectionSubtitle>
          </SectionHeader>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <ProductsGrid>
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductsGrid>
              <ViewAllButton>
                <Button as={Link} to="/products" size="large">
                  View All Products
                </Button>
              </ViewAllButton>
            </>
          )}
        </Container>
      </Section>
    </>
  );
};
