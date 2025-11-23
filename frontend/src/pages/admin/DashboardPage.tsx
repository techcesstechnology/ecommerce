import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService, type DashboardStats, type InventoryAlert } from '../../services/adminService';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { Loading } from '../../components/common/Loading';

const DashboardContainer = styled.div`
  max-width: 1400px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const AlertsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const AlertCard = styled.div<{ $type: 'low' | 'out' }>`
  background: ${(props) => (props.$type === 'out' ? '#fff5f5' : '#fffbeb')};
  border-left: 4px solid ${(props) => (props.$type === 'out' ? '#dc3545' : '#ffc107')};
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AlertInfo = styled.div``;

const AlertTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const AlertText = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const AlertBadge = styled.span<{ $type: 'low' | 'out' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => (props.$type === 'out' ? '#dc3545' : '#ffc107')};
  color: white;
`;

const ProductsTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  overflow: hidden;
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

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) =>
    props.$status === 'active' ? '#28a745' : props.$status === 'inactive' ? '#6c757d' : '#ffc107'};
  color: white;
`;

const ErrorMessage = styled.div`
  background: #fff5f5;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, alertsData, productsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getInventoryAlerts(),
        productService.getProducts({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }),
      ]);

      setStats(statsData);
      setAlerts(alertsData);
      setRecentProducts(productsData.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!stats) {
    return <ErrorMessage>No dashboard data available.</ErrorMessage>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'ZWL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Products</StatLabel>
          <StatValue>{stats.totalProducts}</StatValue>
          <StatSubtext>{stats.activeProducts} active</StatSubtext>
        </StatCard>

        <StatCard>
          <StatLabel>Inventory Value</StatLabel>
          <StatValue>{formatCurrency(stats.totalInventoryValue)}</StatValue>
          <StatSubtext>{stats.lowStockProducts} low stock items</StatSubtext>
        </StatCard>

        <StatCard>
          <StatLabel>Total Orders</StatLabel>
          <StatValue>{stats.totalOrders}</StatValue>
          <StatSubtext>{stats.pendingOrders} pending</StatSubtext>
        </StatCard>

        <StatCard>
          <StatLabel>Total Revenue</StatLabel>
          <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
          <StatSubtext>Today: {formatCurrency(stats.todayRevenue)}</StatSubtext>
        </StatCard>

        <StatCard>
          <StatLabel>Categories</StatLabel>
          <StatValue>{stats.totalCategories}</StatValue>
          <StatSubtext>{stats.activeCategories} active</StatSubtext>
        </StatCard>

        <StatCard>
          <StatLabel>Stock Alerts</StatLabel>
          <StatValue>{stats.lowStockProducts + stats.outOfStockProducts}</StatValue>
          <StatSubtext>{stats.outOfStockProducts} out of stock</StatSubtext>
        </StatCard>
      </StatsGrid>

      {alerts.length > 0 && (
        <>
          <SectionTitle>Inventory Alerts</SectionTitle>
          <AlertsGrid>
            {alerts.map((alert) => (
              <AlertCard key={alert.productId} $type={alert.status}>
                <AlertInfo>
                  <AlertTitle>{alert.productName}</AlertTitle>
                  <AlertText>
                    SKU: {alert.sku} | Current: {alert.currentStock} | Min: {alert.minimumStock}
                  </AlertText>
                </AlertInfo>
                <AlertBadge $type={alert.status}>
                  {alert.status === 'out' ? 'Out of Stock' : 'Low Stock'}
                </AlertBadge>
              </AlertCard>
            ))}
          </AlertsGrid>
        </>
      )}

      <SectionTitle>Recent Products</SectionTitle>
      <ProductsTable>
        <TableHead>
          <TableRow>
            <TableHeader>Image</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>SKU</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Stock</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <tbody>
          {recentProducts.map((product) => (
            <TableRow key={product.id}>
              <TableData>
                <ProductImage
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                  }}
                />
              </TableData>
              <TableData>{product.name}</TableData>
              <TableData>{product.sku}</TableData>
              <TableData>{formatCurrency(product.price)}</TableData>
              <TableData>{product.stockQuantity}</TableData>
              <TableData>
                <StatusBadge $status={product.isActive ? 'active' : 'inactive'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
              </TableData>
            </TableRow>
          ))}
        </tbody>
      </ProductsTable>
    </DashboardContainer>
  );
};

export default DashboardPage;
