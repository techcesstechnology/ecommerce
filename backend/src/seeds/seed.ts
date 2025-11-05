import 'reflect-metadata';
import { AppDataSource } from '../config/database.config';
import { User } from '../models/user.entity';
import { Category } from '../models/category.entity';
import { Product } from '../models/product.entity';

/**
 * Seed database with initial data
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }

    // Get repositories
    const userRepository = AppDataSource.getRepository(User);
    const categoryRepository = AppDataSource.getRepository(Category);
    const productRepository = AppDataSource.getRepository(Product);

    // Clear existing data (optional - remove in production)
    console.log('🧹 Clearing existing data...');
    await productRepository.delete({});
    await categoryRepository.delete({});
    await userRepository.delete({});

    // Seed Users
    console.log('👥 Creating users...');
    const adminUser = userRepository.create({
      email: 'admin@freshroute.co.zw',
      name: 'Admin User',
      password: 'hashed_password_here', // In production, use bcrypt or similar
      role: 'admin',
      phone: '+263771234567',
    });

    const vendorUser = userRepository.create({
      email: 'vendor@freshroute.co.zw',
      name: 'Vendor User',
      password: 'hashed_password_here',
      role: 'vendor',
      phone: '+263772345678',
    });

    const customerUser = userRepository.create({
      email: 'customer@freshroute.co.zw',
      name: 'Customer User',
      password: 'hashed_password_here',
      role: 'customer',
      phone: '+263773456789',
    });

    await userRepository.save([adminUser, vendorUser, customerUser]);
    console.log('✅ Created 3 users');

    // Seed Categories
    console.log('📦 Creating categories...');
    const categories = [
      {
        name: 'Fresh Vegetables',
        slug: 'fresh-vegetables',
        description: 'Fresh, locally sourced vegetables',
        sortOrder: 1,
      },
      {
        name: 'Fresh Fruits',
        slug: 'fresh-fruits',
        description: 'Seasonal fresh fruits',
        sortOrder: 2,
      },
      {
        name: 'Dairy Products',
        slug: 'dairy-products',
        description: 'Fresh dairy products',
        sortOrder: 3,
      },
      {
        name: 'Grains & Cereals',
        slug: 'grains-cereals',
        description: 'Quality grains and cereals',
        sortOrder: 4,
      },
      {
        name: 'Meat & Poultry',
        slug: 'meat-poultry',
        description: 'Fresh meat and poultry products',
        sortOrder: 5,
      },
    ];

    const createdCategories = await categoryRepository.save(
      categories.map((cat) => categoryRepository.create(cat))
    );
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Seed Products
    console.log('🛒 Creating products...');
    const vegetablesCategory = createdCategories.find((c) => c.slug === 'fresh-vegetables');
    const fruitsCategory = createdCategories.find((c) => c.slug === 'fresh-fruits');
    const dairyCategory = createdCategories.find((c) => c.slug === 'dairy-products');

    const products = [
      // Vegetables
      {
        name: 'Fresh Tomatoes',
        sku: 'VEG-TOM-001',
        description: 'Fresh, ripe tomatoes from local farms',
        price: 3.5,
        stockQuantity: 150,
        lowStockThreshold: 20,
        unit: 'kg',
        categoryId: vegetablesCategory!.id,
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Green Cabbage',
        sku: 'VEG-CAB-001',
        description: 'Crisp green cabbage',
        price: 2.0,
        stockQuantity: 100,
        lowStockThreshold: 15,
        unit: 'head',
        categoryId: vegetablesCategory!.id,
        isActive: true,
      },
      {
        name: 'Fresh Onions',
        sku: 'VEG-ONI-001',
        description: 'Quality onions',
        price: 2.5,
        stockQuantity: 200,
        lowStockThreshold: 30,
        unit: 'kg',
        categoryId: vegetablesCategory!.id,
        isActive: true,
      },
      {
        name: 'Potatoes',
        sku: 'VEG-POT-001',
        description: 'Fresh potatoes',
        price: 1.8,
        stockQuantity: 300,
        lowStockThreshold: 50,
        unit: 'kg',
        categoryId: vegetablesCategory!.id,
        isActive: true,
        isFeatured: true,
      },

      // Fruits
      {
        name: 'Bananas',
        sku: 'FRT-BAN-001',
        description: 'Fresh, ripe bananas',
        price: 4.0,
        stockQuantity: 120,
        lowStockThreshold: 20,
        unit: 'bunch',
        categoryId: fruitsCategory!.id,
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Oranges',
        sku: 'FRT-ORA-001',
        description: 'Juicy oranges',
        price: 5.5,
        stockQuantity: 180,
        lowStockThreshold: 25,
        unit: 'kg',
        categoryId: fruitsCategory!.id,
        isActive: true,
      },
      {
        name: 'Apples',
        sku: 'FRT-APP-001',
        description: 'Crisp apples',
        price: 6.0,
        compareAtPrice: 7.0,
        stockQuantity: 100,
        lowStockThreshold: 15,
        unit: 'kg',
        categoryId: fruitsCategory!.id,
        isActive: true,
      },

      // Dairy
      {
        name: 'Fresh Milk',
        sku: 'DAI-MIL-001',
        description: 'Fresh pasteurized milk',
        price: 1.5,
        stockQuantity: 80,
        lowStockThreshold: 20,
        unit: 'liter',
        categoryId: dairyCategory!.id,
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Cheddar Cheese',
        sku: 'DAI-CHE-001',
        description: 'Premium cheddar cheese',
        price: 8.0,
        stockQuantity: 50,
        lowStockThreshold: 10,
        unit: 'kg',
        categoryId: dairyCategory!.id,
        isActive: true,
      },
      {
        name: 'Plain Yogurt',
        sku: 'DAI-YOG-001',
        description: 'Natural plain yogurt',
        price: 3.0,
        stockQuantity: 70,
        lowStockThreshold: 15,
        unit: '500g',
        categoryId: dairyCategory!.id,
        isActive: true,
      },
    ];

    const createdProducts = await productRepository.save(
      products.map((prod) => productRepository.create(prod))
    );
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log(`  - Users: 3 (1 admin, 1 vendor, 1 customer)`);
    console.log(`  - Categories: ${createdCategories.length}`);
    console.log(`  - Products: ${createdProducts.length}`);
    console.log('');

    // Close connection
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed();
}

export default seed;
