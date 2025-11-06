import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => `${theme.spacing.xxxl} 0 ${theme.spacing.xl}`};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xxl};
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FooterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.8;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 1;
  }
`;

const FooterText = styled.p`
  opacity: 0.8;
  line-height: 1.6;
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.6;
`;

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>About FreshRoute</FooterTitle>
          <FooterText>
            Zimbabwe's leading online grocery delivery service, bringing fresh products to your
            doorstep with convenience and care.
          </FooterText>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Customer Service</FooterTitle>
          <FooterLink to="/help">Help Center</FooterLink>
          <FooterLink to="/contact">Contact Us</FooterLink>
          <FooterLink to="/returns">Returns & Refunds</FooterLink>
          <FooterLink to="/delivery">Delivery Information</FooterLink>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLink to="/products">Shop All Products</FooterLink>
          <FooterLink to="/products?onSale=true">Special Offers</FooterLink>
          <FooterLink to="/account/orders">Track Order</FooterLink>
          <FooterLink to="/account">My Account</FooterLink>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Contact Info</FooterTitle>
          <FooterText>📞 +263 123 456 789</FooterText>
          <FooterText>✉️ support@freshroute.co.zw</FooterText>
          <FooterText>📍 Harare, Zimbabwe</FooterText>
        </FooterSection>
      </FooterContent>
      <Copyright>
        <p>&copy; {new Date().getFullYear()} FreshRoute. All rights reserved.</p>
      </Copyright>
    </FooterContainer>
  );
};
