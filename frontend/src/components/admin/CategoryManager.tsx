import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { categoryService } from '../../services';
import { Category } from '../../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: flex-end;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  background-color: #667eea;
  color: white;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryImage = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  height: 150px;
  border-radius: 5px;
  background: ${(props) => (props.$hasImage ? 'transparent' : '#f0f0f0')};
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`;

const CategoryName = styled.h3`
  margin: 0 0 10px;
  color: #1a1a2e;
`;

const CategoryDescription = styled.p`
  margin: 0 0 15px;
  color: #666;
  font-size: 0.9rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${(props) => (props.$status === 'active' ? '#d4edda' : '#e2e3e5')};
  color: ${(props) => (props.$status === 'active' ? '#155724' : '#383d41')};
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: ${(props) => (props.$variant === 'delete' ? '#dc3545' : '#667eea')};
  color: white;

  &:hover {
    opacity: 0.8;
  }
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

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading categories...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Controls>
        <Button>+ Add Category</Button>
      </Controls>

      <Grid>
        {categories.map((category) => (
          <Card key={category.id}>
            <CategoryImage $hasImage={!!category.image}>
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                '📦'
              )}
            </CategoryImage>
            <CategoryName>{category.name}</CategoryName>
            <CategoryDescription>
              {category.description || 'No description available'}
            </CategoryDescription>
            <StatusBadge $status={category.status}>{category.status}</StatusBadge>
            <Actions>
              <ActionButton>Edit</ActionButton>
              <ActionButton $variant="delete" onClick={() => handleDelete(category.id)}>
                Delete
              </ActionButton>
            </Actions>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default CategoryManager;
