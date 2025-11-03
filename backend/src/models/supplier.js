const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Supplier extends Model {
    static associate(models) {
      // Supplier has many Products
      Supplier.hasMany(models.Product, {
        foreignKey: 'supplier_id',
        as: 'products'
      });
    }
  }

  Supplier.init(
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
      contact_person: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true
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
      modelName: 'Supplier',
      tableName: 'suppliers',
      timestamps: true,
      underscored: true,
      paranoid: true,
      indexes: [
        {
          fields: ['name']
        },
        {
          fields: ['is_active']
        }
      ]
    }
  );

  return Supplier;
};
