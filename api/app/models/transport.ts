import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Transport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare co2_per_km: number

  @column()
  declare average_speed: number
}
