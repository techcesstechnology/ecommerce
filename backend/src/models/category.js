const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model {
    static associate(models) {
      // Category has many Products
      Category.hasMany(models.Product, {
        foreignKey: 'category_id',
        as: 'products'
      });
      
      // Self-referencing for parent-child categories
      Category.hasMany(models.Category, {
        foreignKey: 'parent_id',
        as: 'subcategories'
      });
      
      Category.belongsTo(models.Category, {
        foreignKey: 'parent_id',
        as: 'parent'
      });
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        }
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',
      timestamps: true,
      underscored: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ['name']
        },
        {
          fields: ['parent_id']
        },
        {
          fields: ['is_active']
        }
      ]
    }
  );

  return Category;
};
