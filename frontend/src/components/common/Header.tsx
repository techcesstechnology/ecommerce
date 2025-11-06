import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from './Button';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const TopBar = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => `${theme.spacing.sm} 0`};
`;

const TopBarContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const MainHeader = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xl}`};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  white-space: nowrap;
`;

const SearchBar = styled.div`
  flex: 1;
  max-width: 600px;
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const IconButton = styled(Link)`
  position: relative;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: ${({ theme }) => `2px ${theme.spacing.xs}`};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  min-width: 20px;
  text-align: center;
`;

const IconLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const Nav = styled.nav`
  background-color: ${({ theme }) => theme.colors.backgroundGray};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const NavContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const NavLink = styled(Link)`
  padding: ${({ theme }) => `${theme.spacing.md} 0`};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: color ${({ theme }) => theme.transitions.fast};
  border-bottom: 2px solid transparent;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <HeaderContainer>
      <TopBar>
        <TopBarContent>
          <div>🇿🇼 Zimbabwe's #1 Online Grocery Store</div>
          <div>Free delivery on orders over ZWL $500</div>
        </TopBarContent>
      </TopBar>
      <MainHeader>
        <Logo to="/">FreshRoute</Logo>
        <SearchBar>
          <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: '0.5rem' }}>
            <SearchInput
              type="search"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
        </SearchBar>
        <Actions>
          <IconButton to="/wishlist">
            <span style={{ fontSize: '24px' }}>♥</span>
            <IconLabel>Wishlist</IconLabel>
          </IconButton>
          <IconButton to="/cart">
            <span style={{ fontSize: '24px' }}>🛒</span>
            {itemCount > 0 && <Badge>{itemCount}</Badge>}
            <IconLabel>Cart</IconLabel>
          </IconButton>
          {isAuthenticated ? (
            <IconButton to="/account">
              <span style={{ fontSize: '24px' }}>👤</span>
              <IconLabel>{user?.name || 'Account'}</IconLabel>
            </IconButton>
          ) : (
            <Button as={Link} to="/login" size="small">
              Login
            </Button>
          )}
        </Actions>
      </MainHeader>
      <Nav>
        <NavContent>
          <NavLink to="/products?category=Fresh Produce">Fresh Produce</NavLink>
          <NavLink to="/products?category=Dairy">Dairy & Eggs</NavLink>
          <NavLink to="/products?category=Meat">Meat & Seafood</NavLink>
          <NavLink to="/products?category=Bakery">Bakery</NavLink>
          <NavLink to="/products?category=Beverages">Beverages</NavLink>
          <NavLink to="/products?onSale=true">Deals</NavLink>
        </NavContent>
      </Nav>
    </HeaderContainer>
  );
};
