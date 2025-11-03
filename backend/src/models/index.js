const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

// Import models
const db = {};

db.User = require('./user')(sequelize);
db.Category = require('./category')(sequelize);
db.Supplier = require('./supplier')(sequelize);
db.Product = require('./product')(sequelize);
db.Order = require('./order')(sequelize);
db.OrderItem = require('./orderItem')(sequelize);
db.Driver = require('./driver')(sequelize);
db.Delivery = require('./delivery')(sequelize);

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
