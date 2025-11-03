import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  margin: 0.5rem;
  font-size: 0.9rem;
`;

const HomePage: React.FC = () => {
  return (
    <Container>
      <Title>🛒 FreshRoute 🇿🇼</Title>
      <Subtitle>Zimbabwe&apos;s Premier E-commerce Platform - Coming Soon</Subtitle>
      <div>
        <Badge>React</Badge>
        <Badge>TypeScript</Badge>
        <Badge>Express.js</Badge>
        <Badge>PostgreSQL</Badge>
        <Badge>Redis</Badge>
      </div>
    </Container>
  );
};

export default HomePage;
