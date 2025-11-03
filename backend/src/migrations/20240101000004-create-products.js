module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      supplier_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      price_usd: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      price_zwl: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'unit'
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('products', ['sku'], {
      unique: true,
      name: 'products_sku_unique'
    });

    await queryInterface.addIndex('products', ['category_id'], {
      name: 'products_category_id_idx'
    });

    await queryInterface.addIndex('products', ['supplier_id'], {
      name: 'products_supplier_id_idx'
    });

    await queryInterface.addIndex('products', ['is_active'], {
      name: 'products_is_active_idx'
    });

    await queryInterface.addIndex('products', ['is_featured'], {
      name: 'products_is_featured_idx'
    });

    await queryInterface.addIndex('products', ['name'], {
      name: 'products_name_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
  }
};
