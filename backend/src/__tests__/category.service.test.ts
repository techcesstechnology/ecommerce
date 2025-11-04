import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    service = new CategoryService();
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData: CreateCategoryDto = {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        status: 'active',
      };

      const category = await service.createCategory(categoryData);

      expect(category).toBeDefined();
      expect(category.id).toBeDefined();
      expect(category.name).toBe(categoryData.name);
      expect(category.slug).toBe('electronics');
      expect(category.status).toBe('active');
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it('should auto-generate slug from name', async () => {
      const categoryData: CreateCategoryDto = {
        name: 'Home & Garden',
      };

      const category = await service.createCategory(categoryData);

      expect(category.slug).toBe('home-garden');
    });

    it('should throw error if slug already exists', async () => {
      const categoryData: CreateCategoryDto = {
        name: 'Test Category',
        slug: 'test-category',
      };

      await service.createCategory(categoryData);

      await expect(service.createCategory(categoryData)).rejects.toThrow(
        'Category with this slug already exists'
      );
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by ID', async () => {
      const categoryData: CreateCategoryDto = {
        name: 'Books',
      };

      const created = await service.createCategory(categoryData);
      const found = await service.getCategoryById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(categoryData.name);
    });

    it('should return null for non-existent category', async () => {
      const category = await service.getCategoryById('non-existent-id');
      expect(category).toBeNull();
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return a category by slug', async () => {
      const categoryData: CreateCategoryDto = {
        name: 'Clothing',
        slug: 'clothing',
      };

      await service.createCategory(categoryData);
      const found = await service.getCategoryBySlug('clothing');

      expect(found).toBeDefined();
      expect(found?.slug).toBe('clothing');
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const categoryData: CreateCategoryDto = {
        name: 'Toys',
      };

      const category = await service.createCategory(categoryData);

      const updateData: UpdateCategoryDto = {
        name: 'Toys & Games',
        description: 'Fun for all ages',
      };

      const updated = await service.updateCategory(category.id, updateData);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe(updateData.name);
      expect(updated?.description).toBe(updateData.description);
      expect(updated?.slug).toBe('toys-games');
    });

    it('should return null when updating non-existent category', async () => {
      const updateData: UpdateCategoryDto = {
        name: 'Updated Name',
      };

      const result = await service.updateCategory('non-existent-id', updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const categoryData: CreateCategoryDto = {
        name: 'Temporary Category',
      };

      const category = await service.createCategory(categoryData);
      const deleted = await service.deleteCategory(category.id);

      expect(deleted).toBe(true);

      const found = await service.getCategoryById(category.id);
      expect(found).toBeNull();
    });

    it('should throw error when deleting category with subcategories', async () => {
      const parentData: CreateCategoryDto = {
        name: 'Parent Category',
      };

      const parent = await service.createCategory(parentData);

      const childData: CreateCategoryDto = {
        name: 'Child Category',
        parentId: parent.id,
      };

      await service.createCategory(childData);

      await expect(service.deleteCategory(parent.id)).rejects.toThrow(
        'Cannot delete category with subcategories'
      );
    });

    it('should return false when deleting non-existent category', async () => {
      const result = await service.deleteCategory('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const category1: CreateCategoryDto = {
        name: 'Category 1',
      };

      const category2: CreateCategoryDto = {
        name: 'Category 2',
      };

      await service.createCategory(category1);
      await service.createCategory(category2);

      const categories = await service.getCategories();

      expect(categories.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter categories by status', async () => {
      const activeCategory: CreateCategoryDto = {
        name: 'Active Category',
        status: 'active',
      };

      const inactiveCategory: CreateCategoryDto = {
        name: 'Inactive Category',
        status: 'inactive',
      };

      await service.createCategory(activeCategory);
      await service.createCategory(inactiveCategory);

      const activeCategories = await service.getCategories('active');

      expect(activeCategories.every((c) => c.status === 'active')).toBe(true);
    });
  });

  describe('getSubcategories', () => {
    it('should return subcategories of a parent', async () => {
      const parentData: CreateCategoryDto = {
        name: 'Parent Category Test',
      };

      const parent = await service.createCategory(parentData);

      const child1Data: CreateCategoryDto = {
        name: 'Child 1',
        parentId: parent.id,
      };

      const child2Data: CreateCategoryDto = {
        name: 'Child 2',
        parentId: parent.id,
      };

      await service.createCategory(child1Data);
      await service.createCategory(child2Data);

      const subcategories = await service.getSubcategories(parent.id);

      expect(subcategories.length).toBe(2);
      expect(subcategories.every((c) => c.parentId === parent.id)).toBe(true);
    });
  });
});
