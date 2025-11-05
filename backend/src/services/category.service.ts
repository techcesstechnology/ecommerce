import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Category } from '../models/category.entity';

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    try {
      const category = this.categoryRepository.create(data);
      return await this.categoryRepository.save(category);
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      return await this.categoryRepository.findOne({
        where: { id },
        relations: ['products'],
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await this.categoryRepository.findOne({
        where: { slug },
        relations: ['products'],
      });
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw new Error('Failed to fetch category by slug');
    }
  }

  /**
   * Get all categories
   */
  async getCategories(filters?: {
    isActive?: boolean;
    includeProducts?: boolean;
  }): Promise<Category[]> {
    try {
      const query = this.categoryRepository.createQueryBuilder('category');

      if (filters?.isActive !== undefined) {
        query.where('category.isActive = :isActive', { isActive: filters.isActive });
      }

      if (filters?.includeProducts) {
        query.leftJoinAndSelect('category.products', 'products');
      }

      query.orderBy('category.sortOrder', 'ASC').addOrderBy('category.name', 'ASC');

      return await query.getMany();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category | null> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        return null;
      }

      Object.assign(category, data);
      return await this.categoryRepository.save(category);
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a category (soft delete by setting isActive to false)
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const result = await this.categoryRepository.update(id, { isActive: false });
      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Get category with product count
   */
  async getCategoriesWithProductCount(): Promise<Array<Category & { productCount: number }>> {
    try {
      const categories = await this.categoryRepository
        .createQueryBuilder('category')
        .loadRelationCountAndMap('category.productCount', 'category.products')
        .where('category.isActive = true')
        .orderBy('category.sortOrder', 'ASC')
        .getMany();

      return categories as Array<Category & { productCount: number }>;
    } catch (error) {
      console.error('Error fetching categories with product count:', error);
      throw new Error('Failed to fetch categories with product count');
    }
  }
}

export const categoryService = new CategoryService();
