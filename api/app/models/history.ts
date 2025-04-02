import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'

import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Address from './address.js'
import Transport from './transport.js'

export default class History extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare transport_id: number

  @column()
  declare start_address_id: number

  @column()
  declare end_address_id: number

  @column()
  declare distance_km: number

  @column()
  declare co2_total: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Transport)
  declare transport: BelongsTo<typeof Transport>

  @belongsTo(() => Address, {
    foreignKey: 'start_address_id',
  })
  declare startAddress: BelongsTo<typeof Address>

  @belongsTo(() => Address, {
    foreignKey: 'end_address_id',
  })
  declare endAddress: BelongsTo<typeof Address>
}