import styled from 'styled-components';

interface CardProps {
  padding?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
}

export const Card = styled.div<CardProps>`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ padding, theme }) =>
    padding === 'none'
      ? '0'
      : padding === 'small'
      ? theme.spacing.md
      : padding === 'large'
      ? theme.spacing.xxl
      : theme.spacing.xl};
  transition: all ${({ theme }) => theme.transitions.medium};

  ${({ hoverable, theme }) =>
    hoverable &&
    `
    cursor: pointer;
    &:hover {
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
    }
  `}
`;
