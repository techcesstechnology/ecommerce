const { Model, DataTypes } = require('sequelize');

// Note: OrderItem does not use soft delete (paranoid mode) because it represents
// a permanent historical record of what was purchased in an order. This is important
// for audit trails, tax records, and financial reporting. When an order is deleted,
// its items are cascade deleted, which is appropriate for this relationship.

module.exports = (sequelize) => {
  class OrderItem extends Model {
    static associate(models) {
      // OrderItem belongs to Order
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      
      // OrderItem belongs to Product
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        }
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Product name at time of order'
      },
      product_sku: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Product SKU at time of order'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      }
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'order_items',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['order_id']
        },
        {
          fields: ['product_id']
        }
      ]
    }
  );

  return OrderItem;
};
