import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Address from './address.js'

export default class FavoriteAddresse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number


  @column()
  declare address_id: number

  @column()
  declare alias: string | null

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>

  @belongsTo(() => Address)
  public address!: BelongsTo<typeof Address>
}