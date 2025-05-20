import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Address from './address.js'
import Transport from './transport.js'

export default class History extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare transportId: number

  @column()
  declare startAddressId: number

  @column()
  declare endAddressId: number

  @column()
  declare distance_km: number

  @column({columnName: "co2_total"})
  declare co2_total: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Transport)
  declare transport: BelongsTo<typeof Transport>

  @belongsTo(() => Address, {
    foreignKey: 'startAddressId',
  })
  declare startAddress: BelongsTo<typeof Address>

  @belongsTo(() => Address, {
    foreignKey: 'endAddressId',
  })
  declare endAddress: BelongsTo<typeof Address>

}