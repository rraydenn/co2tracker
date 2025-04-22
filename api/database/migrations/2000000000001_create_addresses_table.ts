import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('full_address').notNullable()
      table.float('latitude').notNullable()
      table.float('longitude').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}