module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('drivers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      license_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      vehicle_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      vehicle_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.addIndex('drivers', ['email'], {
      unique: true,
      name: 'drivers_email_unique',
      where: {
        email: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    await queryInterface.addIndex('drivers', ['license_number'], {
      unique: true,
      name: 'drivers_license_number_unique'
    });

    await queryInterface.addIndex('drivers', ['is_available'], {
      name: 'drivers_is_available_idx'
    });

    await queryInterface.addIndex('drivers', ['is_active'], {
      name: 'drivers_is_active_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('drivers');
  }
};
