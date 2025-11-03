const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      // Product belongs to Category
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      // Product belongs to Supplier
      Product.belongsTo(models.Supplier, {
        foreignKey: 'supplier_id',
        as: 'supplier'
      });
      
      // Product has many OrderItems
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'order_items'
      });
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        }
      },
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'suppliers',
          key: 'id'
        }
      },
      price_usd: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      price_zwl: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'unit'
      },
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Weight in kg'
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      timestamps: true,
      underscored: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ['sku']
        },
        {
          fields: ['category_id']
        },
        {
          fields: ['supplier_id']
        },
        {
          fields: ['is_active']
        },
        {
          fields: ['is_featured']
        },
        {
          fields: ['name']
        }
      ]
    }
  );

  return Product;
};
