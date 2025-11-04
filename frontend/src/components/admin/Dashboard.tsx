import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService } from '../../services';
import { DashboardStats } from '../../types';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div<{ $color?: string }>`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${(props) => props.$color || '#667eea'};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a2e;
`;

const StatSubtext = styled.div`
  color: #999;
  font-size: 0.85rem;
  margin-top: 8px;
`;

const Section = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 1.3rem;
  color: #1a1a2e;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #f0f0f0;
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${(props) => {
    switch (props.$status) {
      case 'published':
        return '#d4edda';
      case 'draft':
        return '#fff3cd';
      case 'archived':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'published':
        return '#155724';
      case 'draft':
        return '#856404';
      case 'archived':
        return '#721c24';
      default:
        return '#383d41';
    }
  }};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
`;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading dashboard data...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!stats) {
    return <ErrorMessage>No data available</ErrorMessage>;
  }

  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard $color="#667eea">
          <StatLabel>Total Products</StatLabel>
          <StatValue>{stats.totalProducts}</StatValue>
          <StatSubtext>
            {stats.publishedProducts} published, {stats.draftProducts} draft
          </StatSubtext>
        </StatCard>

        <StatCard $color="#f093fb">
          <StatLabel>Low Stock Alert</StatLabel>
          <StatValue>{stats.lowStockProducts}</StatValue>
          <StatSubtext>{stats.outOfStockProducts} out of stock</StatSubtext>
        </StatCard>

        <StatCard $color="#4facfe">
          <StatLabel>Categories</StatLabel>
          <StatValue>{stats.totalCategories}</StatValue>
          <StatSubtext>{stats.activeCategories} active</StatSubtext>
        </StatCard>

        <StatCard $color="#43e97b">
          <StatLabel>Inventory Value</StatLabel>
          <StatValue>${stats.totalInventoryValue.toFixed(2)}</StatValue>
          <StatSubtext>Total stock value</StatSubtext>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Recent Products</SectionTitle>
        {stats.recentProducts.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>SKU</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {stats.recentProducts.map((product) => (
                <tr key={product.id}>
                  <Td>{product.name}</Td>
                  <Td>{product.sku}</Td>
                  <Td>${product.price.toFixed(2)}</Td>
                  <Td>{product.stock}</Td>
                  <Td>
                    <StatusBadge $status={product.status}>{product.status}</StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>No recent products</div>
        )}
      </Section>
    </DashboardContainer>
  );
};

export default Dashboard;
