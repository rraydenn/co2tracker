import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import History from './history.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Address extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  
  @column({})
  declare full_address: string

  @column({})
  declare latitude: number

  @column({})
  declare longitude: number

  @hasMany(() => History, {
    foreignKey: 'start_address_id',
  })
  declare startHistories: HasMany<typeof History>

  @hasMany(() => History, {
    foreignKey: 'end_address_id',
  })
  declare endHistories: HasMany<typeof History>

  @hasMany(() => FavoriteAddress)
  declare favoriteAddresses: HasMany<typeof FavoriteAddress>
}