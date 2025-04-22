import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Address extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  
  @column({})
  declare full_address: string

  @column({})
  declare latitude: number

  @column({})
  declare longitude: number
}