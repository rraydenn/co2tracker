import vine from '@vinejs/vine'

const addressSchema = vine.object({
  full_address: vine.string().trim().minLength(5).maxLength(255),
  latitude: vine.number(),
  longitude: vine.number()
})

/**
 * Validator pour la création d'un trajet
 */
export const createHistoryValidator = vine.compile(
  vine.object({
    transport_id: vine.number(),
    start_address_id: vine.number().optional(),
    end_address_id: vine.number().optional(),
    start_address: addressSchema.optional(),
    end_address: addressSchema.optional(),
    distance_km: vine.number().positive(),
  })
)

/**
 * Validator pour la mise à jour d'un trajet
 */
export const updateHistoryValidator = vine.compile(
  vine.object({
    transport_id: vine.number().optional(),
    start_address_id: vine.number().optional(),
    end_address_id: vine.number().optional(),
    distance_km: vine.number().positive().optional(),
    co2_total: vine.number().positive().optional(),
  })
)