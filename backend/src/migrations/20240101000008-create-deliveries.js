module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('deliveries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM(
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
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_delivery_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivery_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      delivery_city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      delivery_country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      recipient_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      recipient_phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('deliveries', ['order_id'], {
      unique: true,
      name: 'deliveries_order_id_unique'
    });

    await queryInterface.addIndex('deliveries', ['driver_id'], {
      name: 'deliveries_driver_id_idx'
    });

    await queryInterface.addIndex('deliveries', ['status'], {
      name: 'deliveries_status_idx'
    });

    await queryInterface.addIndex('deliveries', ['scheduled_date'], {
      name: 'deliveries_scheduled_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('deliveries');
  }
};
