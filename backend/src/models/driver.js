const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Driver extends Model {
    static associate(models) {
      // Driver has many Deliveries
      Driver.hasMany(models.Delivery, {
        foreignKey: 'driver_id',
        as: 'deliveries'
      });
    }
  }

  Driver.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      license_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      vehicle_type: {
        type: DataTypes.STRING,
        allowNull: true
      },
      vehicle_number: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Driver',
      tableName: 'drivers',
      timestamps: true,
      underscored: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ['email']
        },
        {
          unique: true,
          fields: ['license_number']
        },
        {
          fields: ['is_available']
        },
        {
          fields: ['is_active']
        }
      ]
    }
  );

  return Driver;
};
