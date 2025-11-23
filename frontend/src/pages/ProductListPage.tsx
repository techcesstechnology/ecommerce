import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { productService, ProductFilters } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { Container } from '../components/common/Container';
import { Loading } from '../components/common/Loading';
import { Input, Select } from '../components/common/Input';
import { Button } from '../components/common/Button';

const PageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  min-height: calc(100vh - 300px);
  padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const FilterSection = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};

  input {
    cursor: pointer;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ResultCount = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xxl};
`;

const PageButton = styled(Button) <{ active?: boolean; $variant?: string }>`
  ${({ active, theme }) =>
    active &&
    `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sortBy') as 'name' | 'price' | 'rating') || 'name';
  const sortOrder = (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'ASC';
  const onSale = searchParams.get('onSale') === 'true';
  const inStock = searchParams.get('inStock') !== 'false';
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;

  const limit = 12;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const filters: ProductFilters = {
          category: category || undefined,
          search: search || undefined,
          sortBy,
          sortOrder,
          onSale: onSale || undefined,
          inStock: inStock || undefined,
          minPrice,
          maxPrice,
          page: currentPage,
          limit,
        };

        const result = await productService.getProducts(filters);
        setProducts(result.items);
        setTotal(result.total);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, category, search, sortBy, sortOrder, onSale, inStock, minPrice, maxPrice]);

  const updateFilter = (key: string, value: string | boolean | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value === undefined || value === '' || value === false) {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    params.delete('page');
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer>
      <Container>
        <ContentGrid>
          <Sidebar>
            <FilterSection>
              <FilterTitle>Filters</FilterTitle>

              <FilterGroup>
                <Label>Category</Label>
                <Select
                  value={category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FilterGroup>

              <FilterGroup>
                <Label>Price Range</Label>
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                />
              </FilterGroup>

              <FilterGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={(e) => updateFilter('onSale', e.target.checked)}
                  />
                  On Sale
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked)}
                  />
                  In Stock Only
                </CheckboxLabel>
              </FilterGroup>

              <Button
                variant="outline"
                $fullWidth
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                }}
              >
                Clear Filters
              </Button>
            </FilterSection>
          </Sidebar>

          <MainContent>
            <Header>
              <HeaderTop>
                <ResultCount>
                  {total} {total === 1 ? 'Product' : 'Products'}
                  {search && ` for "${search}"`}
                  {category && ` in ${category}`}
                </ResultCount>
                <SortContainer>
                  <span>Sort by:</span>
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      updateFilter('sortBy', newSortBy);
                      updateFilter('sortOrder', newSortOrder);
                    }}
                  >
                    <option value="name-ASC">Name (A-Z)</option>
                    <option value="name-DESC">Name (Z-A)</option>
                    <option value="price-ASC">Price (Low to High)</option>
                    <option value="price-DESC">Price (High to Low)</option>
                    <option value="rating-DESC">Highest Rated</option>
                  </Select>
                </SortContainer>
              </HeaderTop>
            </Header>

            {isLoading ? (
              <Loading />
            ) : products.length === 0 ? (
              <EmptyState>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
              </EmptyState>
            ) : (
              <>
                <ProductsGrid>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </ProductsGrid>

                {totalPages > 1 && (
                  <Pagination>
                    <PageButton
                      $variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </PageButton>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && <span>...</span>}
                          <PageButton
                            $variant={page === currentPage ? 'primary' : 'outline'}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PageButton>
                        </React.Fragment>
                      ))}
                    <PageButton
                      $variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </PageButton>
                  </Pagination>
                )}
              </>
            )}
          </MainContent>
        </ContentGrid>
      </Container>
    </PageContainer>
  );
};
