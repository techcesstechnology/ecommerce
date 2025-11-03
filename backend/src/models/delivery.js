const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Delivery extends Model {
    static associate(models) {
      // Delivery belongs to Order
      Delivery.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      
      // Delivery belongs to Driver
      Delivery.belongsTo(models.Driver, {
        foreignKey: 'driver_id',
        as: 'driver'
      });
    }
  }

  Delivery.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'id'
        }
      },
      driver_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'drivers',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'assigned',
          'in_transit',
          'delivered',
          'failed',
          'cancelled'
        ),
        defaultValue: 'pending',
        allowNull: false
      },
      scheduled_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      actual_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      delivery_address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      delivery_city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      delivery_country: {
        type: DataTypes.STRING,
        allowNull: false
      },
      recipient_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      recipient_phone: {
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
      modelName: 'Delivery',
      tableName: 'deliveries',
      timestamps: true,
      underscored: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ['order_id']
        },
        {
          fields: ['driver_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['scheduled_date']
        }
      ]
    }
  );

  return Delivery;
};
