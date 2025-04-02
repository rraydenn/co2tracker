import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'favorite_addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id')
        .unsigned()
        .notNullable()
        .references('id').inTable('users')
        .onDelete('CASCADE')
      
      table.integer('address_id')
        .unsigned()
        .notNullable()
        .references('id').inTable('addresses')
        .onDelete('CASCADE')
      
      table.string('alias')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}