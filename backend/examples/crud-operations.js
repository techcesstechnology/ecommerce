/**
 * Example CRUD Operations for FreshRoute Database
 * 
 * This script demonstrates basic Create, Read, Update, and Delete operations
 * for the FreshRoute e-commerce platform models.
 * 
 * Note: This requires a PostgreSQL database to be running and migrations to be executed.
 */

const db = require('../src/models');
const { v4: uuidv4 } = require('uuid');

async function runCrudExamples() {
  try {
    console.log('Starting CRUD operations examples...\n');

    // ========== USER CRUD OPERATIONS ==========
    console.log('=== User CRUD Operations ===');
    
    // Create a user
    const user = await db.User.create({
      email: 'john.doe@example.com',
      password: 'hashed_password_here', // In production, use bcrypt to hash
      first_name: 'John',
      last_name: 'Doe',
      phone: '+263771234567',
      address: '123 Main Street',
      city: 'Harare',
      country: 'Zimbabwe',
      role: 'customer'
    });
    console.log('✓ Created user:', user.email);

    // Read user
    const foundUser = await db.User.findByPk(user.id);
    console.log('✓ Found user:', foundUser.email);

    // Update user
    await user.update({ phone: '+263779876543' });
    console.log('✓ Updated user phone:', user.phone);

    // ========== CATEGORY CRUD OPERATIONS ==========
    console.log('\n=== Category CRUD Operations ===');
    
    // Create parent category
    const parentCategory = await db.Category.create({
      name: 'Fresh Produce',
      description: 'Fresh fruits and vegetables',
      is_active: true
    });
    console.log('✓ Created parent category:', parentCategory.name);

    // Create child category
    const childCategory = await db.Category.create({
      name: 'Vegetables',
      description: 'Fresh vegetables',
      parent_id: parentCategory.id,
      is_active: true
    });
    console.log('✓ Created child category:', childCategory.name);

    // ========== SUPPLIER CRUD OPERATIONS ==========
    console.log('\n=== Supplier CRUD Operations ===');
    
    const supplier = await db.Supplier.create({
      name: 'Fresh Farms Ltd',
      contact_person: 'Jane Smith',
      email: 'jane@freshfarms.co.zw',
      phone: '+263771111111',
      address: '456 Farm Road',
      city: 'Harare',
      country: 'Zimbabwe',
      is_active: true
    });
    console.log('✓ Created supplier:', supplier.name);

    // ========== PRODUCT CRUD OPERATIONS ==========
    console.log('\n=== Product CRUD Operations ===');
    
    const product = await db.Product.create({
      name: 'Fresh Tomatoes',
      description: 'Locally grown organic tomatoes',
      sku: 'PROD-TOMATO-001',
      category_id: childCategory.id,
      supplier_id: supplier.id,
      price_usd: 2.99,
      price_zwl: 1500,
      stock_quantity: 100,
      unit: 'kg',
      weight: 1.0,
      is_active: true,
      is_featured: true
    });
    console.log('✓ Created product:', product.name);

    // Read product with associations
    const productWithAssociations = await db.Product.findByPk(product.id, {
      include: [
        { association: 'category', attributes: ['name'] },
        { association: 'supplier', attributes: ['name'] }
      ]
    });
    console.log('✓ Product category:', productWithAssociations.category.name);
    console.log('✓ Product supplier:', productWithAssociations.supplier.name);

    // ========== DRIVER CRUD OPERATIONS ==========
    console.log('\n=== Driver CRUD Operations ===');
    
    const driver = await db.Driver.create({
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mike.driver@example.com',
      phone: '+263772222222',
      license_number: 'DL-123456',
      vehicle_type: 'Van',
      vehicle_number: 'ABC-1234',
      is_available: true,
      is_active: true
    });
    console.log('✓ Created driver:', `${driver.first_name} ${driver.last_name}`);

    // ========== ORDER CRUD OPERATIONS ==========
    console.log('\n=== Order CRUD Operations ===');
    
    const order = await db.Order.create({
      order_number: `ORD-${Date.now()}`,
      user_id: user.id,
      status: 'pending',
      currency: 'USD',
      subtotal: 29.99,
      tax: 2.00,
      shipping_fee: 5.00,
      total: 36.99,
      payment_method: 'credit_card',
      payment_status: 'pending',
      shipping_address: '123 Main Street',
      shipping_city: 'Harare',
      shipping_country: 'Zimbabwe',
      notes: 'Please deliver in the morning'
    });
    console.log('✓ Created order:', order.order_number);

    // ========== ORDER ITEM CRUD OPERATIONS ==========
    console.log('\n=== OrderItem CRUD Operations ===');
    
    const orderItem = await db.OrderItem.create({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: 10,
      unit_price: 2.99,
      subtotal: 29.99
    });
    console.log('✓ Created order item:', orderItem.product_name);

    // ========== DELIVERY CRUD OPERATIONS ==========
    console.log('\n=== Delivery CRUD Operations ===');
    
    const delivery = await db.Delivery.create({
      order_id: order.id,
      driver_id: driver.id,
      status: 'assigned',
      scheduled_date: new Date(Date.now() + 86400000), // Tomorrow
      delivery_address: '123 Main Street',
      delivery_city: 'Harare',
      delivery_country: 'Zimbabwe',
      recipient_name: 'John Doe',
      recipient_phone: '+263771234567',
      notes: 'Call before delivery'
    });
    console.log('✓ Created delivery for order:', order.order_number);

    // ========== COMPLEX QUERIES ==========
    console.log('\n=== Complex Query Examples ===');
    
    // Get order with all associations
    const fullOrder = await db.Order.findOne({
      where: { id: order.id },
      include: [
        {
          association: 'user',
          attributes: ['email', 'first_name', 'last_name']
        },
        {
          association: 'order_items',
          include: [
            {
              association: 'product',
              attributes: ['name', 'sku']
            }
          ]
        },
        {
          association: 'delivery',
          include: [
            {
              association: 'driver',
              attributes: ['first_name', 'last_name', 'phone']
            }
          ]
        }
      ]
    });
    
    console.log('✓ Retrieved complete order with associations:');
    console.log(`  - Customer: ${fullOrder.user.first_name} ${fullOrder.user.last_name}`);
    console.log(`  - Items: ${fullOrder.order_items.length}`);
    console.log(`  - Driver: ${fullOrder.delivery.driver.first_name} ${fullOrder.delivery.driver.last_name}`);

    // Get all active products in a category
    const categoryProducts = await db.Product.findAll({
      where: {
        category_id: childCategory.id,
        is_active: true
      },
      include: [
        { association: 'category', attributes: ['name'] }
      ]
    });
    console.log(`✓ Found ${categoryProducts.length} active products in ${childCategory.name}`);

    // ========== SOFT DELETE EXAMPLE ==========
    console.log('\n=== Soft Delete Example ===');
    
    // Soft delete a user (paranoid mode)
    await user.destroy();
    console.log('✓ Soft deleted user:', user.email);

    // User won't appear in normal queries
    const deletedUserQuery = await db.User.findByPk(user.id);
    console.log('✓ Normal query returns:', deletedUserQuery); // null

    // But can be found with paranoid: false
    const deletedUserWithParanoid = await db.User.findByPk(user.id, {
      paranoid: false
    });
    console.log('✓ With paranoid: false, found:', deletedUserWithParanoid.email);

    // Restore the user
    await deletedUserWithParanoid.restore();
    console.log('✓ Restored user:', deletedUserWithParanoid.email);

    // ========== UPDATE OPERATIONS ==========
    console.log('\n=== Update Operations ===');
    
    // Update order status
    await order.update({ status: 'confirmed', payment_status: 'paid' });
    console.log('✓ Updated order status to:', order.status);

    // Update delivery status
    await delivery.update({ status: 'in_transit' });
    console.log('✓ Updated delivery status to:', delivery.status);

    // Update product stock
    await product.update({
      stock_quantity: product.stock_quantity - orderItem.quantity
    });
    console.log('✓ Updated product stock to:', product.stock_quantity);

    // ========== DELETE OPERATIONS ==========
    console.log('\n=== Delete Operations (Cleanup) ===');
    
    // Delete in correct order (respecting foreign keys)
    await delivery.destroy();
    console.log('✓ Deleted delivery');
    
    await orderItem.destroy();
    console.log('✓ Deleted order item');
    
    await order.destroy();
    console.log('✓ Deleted order');
    
    await product.destroy();
    console.log('✓ Deleted product');
    
    await driver.destroy();
    console.log('✓ Deleted driver');
    
    await supplier.destroy();
    console.log('✓ Deleted supplier');
    
    await childCategory.destroy();
    console.log('✓ Deleted child category');
    
    await parentCategory.destroy();
    console.log('✓ Deleted parent category');
    
    await user.destroy();
    console.log('✓ Deleted user');

    console.log('\n✓ All CRUD operations completed successfully!');

  } catch (error) {
    console.error('\n✗ Error during CRUD operations:', error.message);
    console.error(error);
  } finally {
    await db.sequelize.close();
  }
}

// Run the examples
if (require.main === module) {
  runCrudExamples();
}

module.exports = { runCrudExamples };
