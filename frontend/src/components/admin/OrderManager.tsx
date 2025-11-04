import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { orderService } from '../../services';
import { Order } from '../../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Select = styled.select`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-collapse: collapse;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 15px;
  background-color: #f8f9fa;
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #e9ecef;
`;

const Td = styled.td`
  padding: 15px;
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
      case 'delivered':
        return '#d4edda';
      case 'shipped':
        return '#d1ecf1';
      case 'processing':
        return '#fff3cd';
      case 'confirmed':
        return '#cce5ff';
      case 'cancelled':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'delivered':
        return '#155724';
      case 'shipped':
        return '#0c5460';
      case 'processing':
        return '#856404';
      case 'confirmed':
        return '#004085';
      case 'cancelled':
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
`;

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
        limit: 20,
      });
      setOrders(response.data.items);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading orders...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Controls>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
      </Controls>

      <Table>
        <thead>
          <tr>
            <Th>Order Number</Th>
            <Th>Customer</Th>
            <Th>Items</Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th>Payment</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <Td>{order.orderNumber}</Td>
              <Td>{order.shippingAddress.fullName}</Td>
              <Td>{order.items.length} items</Td>
              <Td>${order.total.toFixed(2)}</Td>
              <Td>
                <StatusBadge $status={order.status}>{order.status}</StatusBadge>
              </Td>
              <Td>
                <StatusBadge $status={order.paymentStatus}>{order.paymentStatus}</StatusBadge>
              </Td>
              <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default OrderManager;
