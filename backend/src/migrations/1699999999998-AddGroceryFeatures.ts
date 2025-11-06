import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class AddGroceryFeatures1699999999998 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create carts table
    await queryRunner.createTable(
      new Table({
        name: 'carts',
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
            name: 'promoCode',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'discount',
            type: 'decimal',
            precision: 10,
            scale: 2,
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

    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_carts_userId',
        columnNames: ['userId'],
        isUnique: true,
      })
    );

    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    // Create cart_items table
    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cartId',
            type: 'uuid',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'quantity',
            type: 'integer',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
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

    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_cart_items_cartId_productId',
        columnNames: ['cartId', 'productId'],
        isUnique: true,
      })
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['cartId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'carts',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      })
    );

    // Create reviews table
    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'rating',
            type: 'integer',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'verifiedPurchase',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isApproved',
            type: 'boolean',
            default: true,
          },
          {
            name: 'helpfulCount',
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

    await queryRunner.createIndex(
      'reviews',
      new TableIndex({
        name: 'IDX_reviews_productId',
        columnNames: ['productId'],
      })
    );

    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    // Add review-related columns to products table
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN "averageRating" DECIMAL(3,2) DEFAULT 0,
      ADD COLUMN "reviewCount" INTEGER DEFAULT 0,
      ADD COLUMN "salePrice" DECIMAL(10,2),
      ADD COLUMN "saleStartDate" TIMESTAMP,
      ADD COLUMN "saleEndDate" TIMESTAMP
    `);

    // Create wishlists table
    await queryRunner.createTable(
      new Table({
        name: 'wishlists',
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
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'isPublic',
            type: 'boolean',
            default: false,
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

    await queryRunner.createIndex(
      'wishlists',
      new TableIndex({
        name: 'IDX_wishlists_userId',
        columnNames: ['userId'],
        isUnique: true,
      })
    );

    await queryRunner.createForeignKey(
      'wishlists',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    // Create wishlist_items table
    await queryRunner.createTable(
      new Table({
        name: 'wishlist_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'wishlistId',
            type: 'uuid',
          },
          {
            name: 'productId',
            type: 'uuid',
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
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      'wishlist_items',
      new TableIndex({
        name: 'IDX_wishlist_items_wishlistId_productId',
        columnNames: ['wishlistId', 'productId'],
        isUnique: true,
      })
    );

    await queryRunner.createForeignKey(
      'wishlist_items',
      new TableForeignKey({
        columnNames: ['wishlistId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'wishlists',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'wishlist_items',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      })
    );

    // Create promotions table
    await queryRunner.createTable(
      new Table({
        name: 'promotions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'value',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'minPurchaseAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'maxDiscountAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'startDate',
            type: 'timestamp',
          },
          {
            name: 'endDate',
            type: 'timestamp',
          },
          {
            name: 'usageLimit',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'usageCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'applicableCategories',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'applicableProducts',
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

    await queryRunner.createIndex(
      'promotions',
      new TableIndex({
        name: 'IDX_promotions_code',
        columnNames: ['code'],
        isUnique: true,
      })
    );

    // Create addresses table
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
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
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'fullName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'addressLine1',
            type: 'text',
          },
          {
            name: 'addressLine2',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'province',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'postalCode',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            default: "'Zimbabwe'",
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
          },
          {
            name: 'deliveryInstructions',
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

    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'IDX_addresses_userId',
        columnNames: ['userId'],
      })
    );

    await queryRunner.createForeignKey(
      'addresses',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    // Create delivery_slots table
    await queryRunner.createTable(
      new Table({
        name: 'delivery_slots',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'startTime',
            type: 'time',
          },
          {
            name: 'endTime',
            type: 'time',
          },
          {
            name: 'maxOrders',
            type: 'integer',
          },
          {
            name: 'currentOrders',
            type: 'integer',
            default: 0,
          },
          {
            name: 'deliveryFee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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

    await queryRunner.createIndex(
      'delivery_slots',
      new TableIndex({
        name: 'IDX_delivery_slots_date_startTime',
        columnNames: ['date', 'startTime'],
      })
    );

    // Add delivery and promotion columns to orders table
    await queryRunner.query(`
      ALTER TABLE orders
      ADD COLUMN "deliverySlotId" UUID,
      ADD COLUMN "deliveryDate" DATE,
      ADD COLUMN "deliveryTimeStart" TIME,
      ADD COLUMN "deliveryTimeEnd" TIME,
      ADD COLUMN "discount" DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN "promoCode" VARCHAR(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from orders table
    await queryRunner.query(`
      ALTER TABLE orders
      DROP COLUMN "deliverySlotId",
      DROP COLUMN "deliveryDate",
      DROP COLUMN "deliveryTimeStart",
      DROP COLUMN "deliveryTimeEnd",
      DROP COLUMN "discount",
      DROP COLUMN "promoCode"
    `);

    // Drop tables in reverse order
    await queryRunner.dropTable('delivery_slots');
    await queryRunner.dropTable('addresses');
    await queryRunner.dropTable('promotions');
    await queryRunner.dropTable('wishlist_items');
    await queryRunner.dropTable('wishlists');

    // Remove columns from products table
    await queryRunner.query(`
      ALTER TABLE products
      DROP COLUMN "averageRating",
      DROP COLUMN "reviewCount",
      DROP COLUMN "salePrice",
      DROP COLUMN "saleStartDate",
      DROP COLUMN "saleEndDate"
    `);

    await queryRunner.dropTable('reviews');
    await queryRunner.dropTable('cart_items');
    await queryRunner.dropTable('carts');
  }
}
