import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { analyticsService, type SalesMetrics, type TopProduct } from '../../services/analyticsService';
import { Loading } from '../../components/common/Loading';

const AnalyticsContainer = styled.div`
  max-width: 1400px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $trend?: 'up' | 'down' }>`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${(props) => (props.$trend === 'up' ? '#28a745' : props.$trend === 'down' ? '#dc3545' : '#00a859')};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 0.875rem;
  color: ${(props) => (props.$positive ? '#28a745' : '#dc3545')};
  margin-top: 0.5rem;
  font-weight: 600;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const ProductsTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableHead = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
`;

const TableData = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #666;
`;

const RankBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #00a859;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.875rem;
`;

const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [metricsData, productsData] = await Promise.all([
        analyticsService.getSalesMetrics(),
        analyticsService.getTopProducts(10),
      ]);
      setMetrics(metricsData);
      setTopProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'ZWL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return <Loading message="Loading analytics..." />;
  }

  if (!metrics) {
    return <div>No analytics data available.</div>;
  }

  return (
    <AnalyticsContainer>
      <StatsGrid>
        <StatCard $trend={metrics.revenueGrowth >= 0 ? 'up' : 'down'}>
          <StatLabel>Total Revenue</StatLabel>
          <StatValue>{formatCurrency(metrics.totalRevenue)}</StatValue>
          <StatChange $positive={metrics.revenueGrowth >= 0}>
            {formatPercentage(metrics.revenueGrowth)} vs last period
          </StatChange>
        </StatCard>

        <StatCard $trend={metrics.ordersGrowth >= 0 ? 'up' : 'down'}>
          <StatLabel>Total Orders</StatLabel>
          <StatValue>{metrics.totalOrders}</StatValue>
          <StatChange $positive={metrics.ordersGrowth >= 0}>
            {formatPercentage(metrics.ordersGrowth)} vs last period
          </StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Average Order Value</StatLabel>
          <StatValue>{formatCurrency(metrics.averageOrderValue)}</StatValue>
        </StatCard>
      </StatsGrid>

      <SectionTitle>Top Selling Products</SectionTitle>
      <ProductsTable>
        <TableHead>
          <TableRow>
            <TableHeader>Rank</TableHeader>
            <TableHeader>Product</TableHeader>
            <TableHeader>SKU</TableHeader>
            <TableHeader>Category</TableHeader>
            <TableHeader>Units Sold</TableHeader>
            <TableHeader>Revenue</TableHeader>
          </TableRow>
        </TableHead>
        <tbody>
          {topProducts.map((product, index) => (
            <TableRow key={product.productId}>
              <TableData>
                <RankBadge>{index + 1}</RankBadge>
              </TableData>
              <TableData>{product.productName}</TableData>
              <TableData>{product.sku}</TableData>
              <TableData>{product.category}</TableData>
              <TableData>{product.totalSold}</TableData>
              <TableData>{formatCurrency(product.revenue)}</TableData>
            </TableRow>
          ))}
        </tbody>
      </ProductsTable>
    </AnalyticsContainer>
  );
};

export default AnalyticsPage;
