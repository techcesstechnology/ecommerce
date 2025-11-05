import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1699999999999 implements MigrationInterface {
  name = 'InitialSchema1699999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            default: "'customer'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create index on email
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
      })
    );

    // Create categories table
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'imageUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sortOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create indexes on categories
    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_categories_name',
        columnNames: ['name'],
      })
    );

    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_categories_slug',
        columnNames: ['slug'],
        isUnique: true,
      })
    );

    // Create products table
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'sku',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'compareAtPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'stockQuantity',
            type: 'integer',
            default: 0,
          },
          {
            name: 'lowStockThreshold',
            type: 'integer',
            default: 0,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'imageUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'images',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isFeatured',
            type: 'boolean',
            default: false,
          },
          {
            name: 'categoryId',
            type: 'uuid',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create indexes on products
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_name',
        columnNames: ['name'],
      })
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_sku',
        columnNames: ['sku'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_categoryId',
        columnNames: ['categoryId'],
      })
    );

    // Add foreign key for products -> categories
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        name: 'FK_products_categories',
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      })
    );

    // Create orders table
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'orderNumber',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'items',
            type: 'jsonb',
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'tax',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'shippingCost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'paymentStatus',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'shippingAddress',
            type: 'jsonb',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create indexes on orders
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_orderNumber',
        columnNames: ['orderNumber'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_userId',
        columnNames: ['userId'],
      })
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_status',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_createdAt',
        columnNames: ['createdAt'],
      })
    );

    // Add foreign key for orders -> users
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'FK_orders_users',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      })
    );

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'userEmail',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'resourceId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'inet',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create indexes on audit_logs
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_userId',
        columnNames: ['userId'],
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_resource',
        columnNames: ['resource'],
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_action',
        columnNames: ['action'],
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_timestamp',
        columnNames: ['timestamp'],
      })
    );

    // Add foreign key for audit_logs -> users
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        name: 'FK_audit_logs_users',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('audit_logs', 'FK_audit_logs_users');
    await queryRunner.dropForeignKey('orders', 'FK_orders_users');
    await queryRunner.dropForeignKey('products', 'FK_products_categories');

    // Drop tables in reverse order
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('orders');
    await queryRunner.dropTable('products');
    await queryRunner.dropTable('categories');
    await queryRunner.dropTable('users');
  }
}
