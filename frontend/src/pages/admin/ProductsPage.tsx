import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { productService, type ProductFilters, type CreateProductDto, type UpdateProductDto } from '../../services/productService';
import { categoryService, type Category } from '../../services/categoryService';
import { Product } from '../../types';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';

const ProductsContainer = styled.div`
  max-width: 1600px;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #00a859;
  }
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

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  background: ${(props) => (props.$variant === 'danger' ? '#dc3545' : '#00a859')};
  color: white;
  font-size: 0.875rem;

  &:hover {
    opacity: 0.9;
  }
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
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

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #00a859;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #00a859;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    sku: '',
    categoryId: 0,
    price: 0,
    stockQuantity: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({ ...filters, page, limit });
      setProducts(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters({ ...filters, categoryId: categoryId ? parseInt(categoryId) : undefined });
    setPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, inStock: status === 'inStock' ? true : undefined });
    setPage(1);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      sku: '',
      categoryId: 0,
      price: 0,
      stockQuantity: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      categoryId: product.categoryId,
      price: product.price,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.deleteProduct(id.toString());
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id.toString(), formData);
      } else {
        await productService.createProduct(formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'ZWL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <ProductsContainer>
      <Toolbar>
        <SearchInput
          type="text"
          placeholder="Search products..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select onChange={(e) => handleCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
        <Select onChange={(e) => handleStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="inStock">In Stock</option>
        </Select>
        <Button onClick={handleCreate}>+ Add Product</Button>
      </Toolbar>

      {loading ? (
        <Loading message="Loading products..." />
      ) : (
        <>
          <ProductsTable>
            <TableHead>
              <TableRow>
                <TableHeader>Image</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>SKU</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Stock</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {products.map((product) => (
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
                  <TableData>{product.category?.name}</TableData>
                  <TableData>{formatCurrency(product.price)}</TableData>
                  <TableData>{product.stockQuantity}</TableData>
                  <TableData>
                    <StatusBadge $status={product.isActive ? 'active' : 'inactive'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </TableData>
                  <TableData>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEdit(product)}>Edit</ActionButton>
                      <ActionButton $variant="danger" onClick={() => handleDelete(product.id)}>
                        Delete
                      </ActionButton>
                    </ActionButtons>
                  </TableData>
                </TableRow>
              ))}
            </tbody>
          </ProductsTable>

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

      <Modal $show={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</ModalTitle>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>SKU</Label>
              <Input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Category</Label>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                required
              >
                <option value={0}>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Stock</Label>
              <Input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Status</Label>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormGroup>

            <ModalActions>
              <Button type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </Modal>
    </ProductsContainer>
  );
};

export default ProductsPage;
