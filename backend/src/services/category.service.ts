import { v4 as uuidv4 } from 'uuid';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';

// In-memory storage for categories (replace with database in production)
const categoriesStore = new Map<string, Category>();

export class CategoryService {
  /**
   * Generate slug from name
   */
  /**
   * Generate slug from name - safe from ReDoS attacks
   */
  private generateSlug(name: string): string {
    // Convert to lowercase and replace non-alphanumeric with single hyphen
    let slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Remove consecutive hyphens by splitting and filtering
    slug = slug.split('-').filter(Boolean).join('-');
    
    return slug;
  }

  /**
   * Get all categories
   */
  async getCategories(status?: 'active' | 'inactive'): Promise<Category[]> {
    let categories = Array.from(categoriesStore.values());

    if (status) {
      categories = categories.filter((c) => c.status === status);
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get a category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    return categoriesStore.get(id) || null;
  }

  /**
   * Get a category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = Array.from(categoriesStore.values());
    return categories.find((c) => c.slug === slug) || null;
  }

  /**
   * Get subcategories of a parent category
   */
  async getSubcategories(parentId: string): Promise<Category[]> {
    const categories = Array.from(categoriesStore.values());
    return categories.filter((c) => c.parentId === parentId);
  }

  /**
   * Get root categories (categories without parent)
   */
  async getRootCategories(): Promise<Category[]> {
    const categories = Array.from(categoriesStore.values());
    return categories.filter((c) => !c.parentId);
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const slug = data.slug || this.generateSlug(data.name);

    // Check if slug already exists
    const existingCategory = await this.getCategoryBySlug(slug);
    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }

    // Validate parent category exists if provided
    if (data.parentId) {
      const parentCategory = await this.getCategoryById(data.parentId);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
    }

    const now = new Date();
    const category: Category = {
      id: uuidv4(),
      name: data.name,
      slug,
      description: data.description,
      parentId: data.parentId,
      image: data.image,
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    };

    categoriesStore.set(category.id, category);
    return category;
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category | null> {
    const category = categoriesStore.get(id);
    if (!category) {
      return null;
    }

    // If name is being updated, regenerate slug if slug is not provided
    let slug = data.slug;
    if (data.name && !data.slug) {
      slug = this.generateSlug(data.name);
    }

    // Check if slug is being updated and if it conflicts
    if (slug && slug !== category.slug) {
      const existingCategory = await this.getCategoryBySlug(slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new Error('Category with this slug already exists');
      }
    }

    // Validate parent category exists if provided
    if (data.parentId && data.parentId !== category.parentId) {
      if (data.parentId === id) {
        throw new Error('Category cannot be its own parent');
      }
      const parentCategory = await this.getCategoryById(data.parentId);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
    }

    const updatedCategory: Category = {
      ...category,
      ...data,
      slug: slug || category.slug,
      updatedAt: new Date(),
    };

    categoriesStore.set(id, updatedCategory);
    return updatedCategory;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    // Check if category has subcategories
    const subcategories = await this.getSubcategories(id);
    if (subcategories.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    return categoriesStore.delete(id);
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree(): Promise<Category[]> {
    const rootCategories = await this.getRootCategories();
    return rootCategories;
  }
}

export const categoryService = new CategoryService();
