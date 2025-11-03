const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      // Order belongs to User
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Order has many OrderItems
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'order_items'
      });
      
      // Order has one Delivery
      Order.hasOne(models.Delivery, {
        foreignKey: 'order_id',
        as: 'delivery'
      });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      order_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded'
        ),
        defaultValue: 'pending',
        allowNull: false
      },
      currency: {
        type: DataTypes.ENUM('USD', 'ZWL'),
        defaultValue: 'USD',
        allowNull: false
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      shipping_city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shipping_country: {
        type: DataTypes.STRING,
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
      underscored: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ['order_number']
        },
        {
          fields: ['user_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['payment_status']
        },
        {
          fields: ['created_at']
        }
      ]
    }
  );

  return Order;
};
