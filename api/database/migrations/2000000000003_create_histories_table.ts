import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id')
        .unsigned()
        .notNullable()
        .references('id').inTable('users')
        .onDelete('CASCADE')

      table.integer('transport_id')
        .unsigned()
        .notNullable()
        .references('id').inTable('transports')
        .onDelete('CASCADE')

      table.integer('start_address_id')
        .unsigned()
        .notNullable()
        .references('id').inTable('addresses')
        .onDelete('CASCADE')

      table.integer('end_address_id')
        .unsigned()
        .notNullable()
        .references('id').inTable('addresses')
        .onDelete('CASCADE')

      table.float('distance_km').notNullable()
      table.float('co2_total').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}