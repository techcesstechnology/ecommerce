import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService } from '../../services';

const Container = styled.div`
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
`;

const Analytics: React.FC = () => {
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSalesSummary();
      setSalesSummary(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading analytics...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!salesSummary) {
    return <ErrorMessage>No data available</ErrorMessage>;
  }

  return (
    <Container>
      <StatsGrid>
        <StatCard $color="#667eea">
          <StatLabel>Total Revenue</StatLabel>
          <StatValue>${salesSummary.totalSales?.toFixed(2) || '0.00'}</StatValue>
        </StatCard>

        <StatCard $color="#f093fb">
          <StatLabel>Total Orders</StatLabel>
          <StatValue>{salesSummary.totalOrders || 0}</StatValue>
        </StatCard>

        <StatCard $color="#4facfe">
          <StatLabel>Average Order Value</StatLabel>
          <StatValue>${salesSummary.averageOrderValue?.toFixed(2) || '0.00'}</StatValue>
        </StatCard>

        <StatCard $color="#43e97b">
          <StatLabel>Pending Orders</StatLabel>
          <StatValue>{salesSummary.pendingOrders || 0}</StatValue>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Top Performing Products</SectionTitle>
        {salesSummary.topProducts && salesSummary.topProducts.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Sold</Th>
                <Th>Revenue</Th>
                <Th>Avg Price</Th>
              </tr>
            </thead>
            <tbody>
              {salesSummary.topProducts.map((product: any) => (
                <tr key={product.productId}>
                  <Td>{product.productName}</Td>
                  <Td>{product.sku}</Td>
                  <Td>{product.totalSold}</Td>
                  <Td>${product.revenue.toFixed(2)}</Td>
                  <Td>${product.averagePrice.toFixed(2)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>No sales data available yet</div>
        )}
      </Section>
    </Container>
  );
};

export default Analytics;
