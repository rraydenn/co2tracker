import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.float('co2_per_km').notNullable()
      table.float('average_speed').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}