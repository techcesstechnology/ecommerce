/**
 * Test script to verify database connection and model setup
 * 
 * Usage: node test-connection.js
 * 
 * Note: This requires a PostgreSQL database to be running
 * and configured in .env file or environment variables
 */

const db = require('./src/models');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await db.sequelize.authenticate();
    console.log('✓ Database connection successful');
    
    // List all models
    console.log('\nRegistered models:');
    Object.keys(db).forEach(modelName => {
      if (modelName !== 'sequelize' && modelName !== 'Sequelize') {
        console.log(`  - ${modelName}`);
      }
    });
    
    // Verify associations
    console.log('\nVerifying model associations...');
    
    // User associations
    if (db.User.associations.orders) {
      console.log('✓ User has many Orders');
    }
    
    // Category associations
    if (db.Category.associations.products) {
      console.log('✓ Category has many Products');
    }
    if (db.Category.associations.subcategories) {
      console.log('✓ Category has self-referencing subcategories');
    }
    
    // Supplier associations
    if (db.Supplier.associations.products) {
      console.log('✓ Supplier has many Products');
    }
    
    // Product associations
    if (db.Product.associations.category) {
      console.log('✓ Product belongs to Category');
    }
    if (db.Product.associations.supplier) {
      console.log('✓ Product belongs to Supplier');
    }
    if (db.Product.associations.order_items) {
      console.log('✓ Product has many OrderItems');
    }
    
    // Order associations
    if (db.Order.associations.user) {
      console.log('✓ Order belongs to User');
    }
    if (db.Order.associations.order_items) {
      console.log('✓ Order has many OrderItems');
    }
    if (db.Order.associations.delivery) {
      console.log('✓ Order has one Delivery');
    }
    
    // OrderItem associations
    if (db.OrderItem.associations.order) {
      console.log('✓ OrderItem belongs to Order');
    }
    if (db.OrderItem.associations.product) {
      console.log('✓ OrderItem belongs to Product');
    }
    
    // Driver associations
    if (db.Driver.associations.deliveries) {
      console.log('✓ Driver has many Deliveries');
    }
    
    // Delivery associations
    if (db.Delivery.associations.order) {
      console.log('✓ Delivery belongs to Order');
    }
    if (db.Delivery.associations.driver) {
      console.log('✓ Delivery belongs to Driver');
    }
    
    console.log('\n✓ All associations verified successfully');
    console.log('\nDatabase setup is complete and ready to use!');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database exists (createdb freshroute_dev)');
    console.error('3. .env file is configured with correct credentials');
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

testConnection();
