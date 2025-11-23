import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { orderService, type OrderFilters, type UpdateOrderDto } from '../../services/orderService';
import { Order } from '../../types';
import { Loading } from '../../components/common/Loading';

const OrdersContainer = styled.div`
  max-width: 1600px;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #00a859;
  }
`;

const OrdersTable = styled.table`
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
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9f9f9;
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

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
    switch (props.$status) {
      case 'pending':
        return '#ffc107';
      case 'confirmed':
        return '#17a2b8';
      case 'processing':
        return '#007bff';
      case 'shipped':
        return '#6f42c1';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }};
  color: white;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: ${(props) => (props.$active ? '#00a859' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#333')};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${(props) => (props.$active ? '#008a47' : '#f5f5f5')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${(props) => (props.$show ? 'flex' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const OrderDetail = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #666;
`;

const DetailValue = styled.span`
  color: #333;
`;

const OrderItems = styled.div`
  margin: 1.5rem 0;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  background: ${(props) => (props.$variant === 'secondary' ? '#6c757d' : '#00a859')};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateData, setUpdateData] = useState<UpdateOrderDto>({});

  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders({ ...filters, page, limit });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status || undefined });
    setPage(1);
  };

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    setFilters({ ...filters, paymentStatus: paymentStatus || undefined });
    setPage(1);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      paymentStatus: order.paymentStatus,
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await orderService.updateOrder(selectedOrder.id, updateData);
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'ZWL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <OrdersContainer>
      <Toolbar>
        <Select onChange={(e) => handleStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select onChange={(e) => handlePaymentStatusFilter(e.target.value)}>
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
      </Toolbar>

      {loading ? (
        <Loading message="Loading orders..." />
      ) : (
        <>
          <OrdersTable>
            <TableHead>
              <TableRow>
                <TableHeader>Order #</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Payment</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {orders.map((order) => (
                <TableRow key={order.id} onClick={() => handleOrderClick(order)}>
                  <TableData>{order.orderNumber}</TableData>
                  <TableData>
                    {order.shippingAddress.fullName}
                  </TableData>
                  <TableData>{formatDate(order.createdAt)}</TableData>
                  <TableData>{formatCurrency(order.total)}</TableData>
                  <TableData>
                    <StatusBadge $status={order.status}>{order.status}</StatusBadge>
                  </TableData>
                  <TableData>
                    <StatusBadge $status={order.paymentStatus}>{order.paymentStatus}</StatusBadge>
                  </TableData>
                </TableRow>
              ))}
            </tbody>
          </OrdersTable>

          <Pagination>
            <PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </PageButton>
            <span>
              Page {page} of {totalPages}
            </span>
            <PageButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </PageButton>
          </Pagination>
        </>
      )}

      {selectedOrder && (
        <Modal $show={showModal} onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Order #{selectedOrder.orderNumber}</ModalTitle>

            <OrderDetail>
              <DetailRow>
                <DetailLabel>Order Date:</DetailLabel>
                <DetailValue>{formatDate(selectedOrder.createdAt)}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Customer:</DetailLabel>
                <DetailValue>
                  {selectedOrder.shippingAddress.fullName}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Phone:</DetailLabel>
                <DetailValue>{selectedOrder.shippingAddress.phone}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Address:</DetailLabel>
                <DetailValue>
                  {selectedOrder.shippingAddress.addressLine1}, {selectedOrder.shippingAddress.city},{' '}
                  {selectedOrder.shippingAddress.province}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Payment Method:</DetailLabel>
                <DetailValue>{selectedOrder.paymentMethod}</DetailValue>
              </DetailRow>
            </OrderDetail>

            <OrderItems>
              <h4>Order Items</h4>
              {selectedOrder.items.map((item, index) => (
                <ItemRow key={index}>
                  <div>
                    <div>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                      {formatCurrency(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <div>{formatCurrency(item.price * item.quantity)}</div>
                </ItemRow>
              ))}
              <ItemRow>
                <DetailLabel>Subtotal:</DetailLabel>
                <DetailValue>{formatCurrency(selectedOrder.subtotal)}</DetailValue>
              </ItemRow>
              <ItemRow>
                <DetailLabel>Tax:</DetailLabel>
                <DetailValue>{formatCurrency(selectedOrder.tax)}</DetailValue>
              </ItemRow>
              <ItemRow>
                <DetailLabel>Shipping:</DetailLabel>
                <DetailValue>{formatCurrency(selectedOrder.shippingCost)}</DetailValue>
              </ItemRow>
              <ItemRow style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                <DetailLabel>Total:</DetailLabel>
                <DetailValue>{formatCurrency(selectedOrder.total)}</DetailValue>
              </ItemRow>
            </OrderItems>

            <FormGroup>
              <Label>Order Status</Label>
              <Select
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value as any })}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Payment Status</Label>
              <Select
                value={updateData.paymentStatus}
                onChange={(e) =>
                  setUpdateData({ ...updateData, paymentStatus: e.target.value as any })
                }
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>
            </FormGroup>

            <ModalActions>
              <Button $variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update Order</Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </OrdersContainer>
  );
};

export default OrdersPage;
