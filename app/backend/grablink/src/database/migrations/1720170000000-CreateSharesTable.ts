import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSharesTable1720170000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shares',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '6',
            isUnique: true,
          },
          {
            name: 'url',
            type: 'text',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
          },
          {
            name: 'processed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'accessCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_shares_code',
            columnNames: ['code'],
            isUnique: true,
          },
          {
            name: 'IDX_shares_expiresAt',
            columnNames: ['expiresAt'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shares');
  }
}
