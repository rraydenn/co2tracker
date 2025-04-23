import type { HttpContext } from '@adonisjs/core/http'
import History from '#models/history'
import Transport from '#models/transport'
import Address from '#models/address'
import { createHistoryValidator } from '#validators/history'

export default class HistoriesController {
  /**
   * @summary Find an existing address
   * @description Searches for an existing address based on coordinates or full address.
   * @param {Object} addressData - The address data containing full address, latitude, and longitude.
   * @returns {Promise<Address|null>} The found address or null if not found.
   */
  private async findExistingAddress(addressData: {
    full_address: string
    latitude: number
    longitude: number
  }) {
    // D'abord, chercher par coordonnées exactes
    const addressByCoords = await Address.query()
      .where('latitude', addressData.latitude)
      .where('longitude', addressData.longitude)
      .first()

    if (addressByCoords) {
      return addressByCoords
    }

    // Sinon, chercher par adresse complète
    const addressByFullAddress = await Address.query()
      .where('full_address', addressData.full_address)
      .first()

    return addressByFullAddress
  }

  /**
   * @index
   * @summary Get user's travel history
   * @description Retrieves the travel history of the authenticated user.
   * @responseBody 200 - <History[]> // returns array of travel history objects
   */
  async index({ auth, response }: HttpContext) {

    const history = await History.query()
      .where('user_id', auth.user!.id)
      .preload('transport')
      .preload('startAddress')
      .preload('endAddress')

    return response.json(history)
  }

  /**
   * @show
   * @summary Get a specific travel history entry
   * @description Retrieves a specific travel history entry.
    * @responseBody 200 - <History> // returns a specific travel history object
   */
  async show({ auth, params, response }: HttpContext) {
    const history = await History.query()
      .where('id', params.id)
      .where('user_id', auth.user!.id)
      .preload('transport')
      .preload('startAddress')
      .preload('endAddress')
      .first()

    if (!history) {
      return response.notFound({ message: 'Travel history not found' })
    }

    return response.json(history)
  }

  /**
   * @create
   * @summary Create a new travel history entry
   * @description Creates a new travel history entry.
   */
  async create({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(createHistoryValidator)
    
    // Vérifier/Créer l'adresse de départ
    let startAddress = data.start_address_id ? await Address.find(data.start_address_id) : null
    if (!startAddress && data.start_address) {
      // Chercher une adresse existante similaire
      startAddress = await this.findExistingAddress(data.start_address)
      if (!startAddress) {
        // Créer nouvelle adresse si aucune similaire n'existe
        startAddress = await Address.create(data.start_address)
      }
      data.start_address_id = startAddress.id
    }

    // Vérifier/Créer l'adresse d'arrivée
    let endAddress = data.end_address_id ? await Address.find(data.end_address_id) : null
    if (!endAddress && data.end_address) {
      // Chercher une adresse existante similaire
      endAddress = await this.findExistingAddress(data.end_address)
      if (!endAddress) {
        // Créer nouvelle adresse si aucune similaire n'existe
        endAddress = await Address.create(data.end_address)
      }
      data.end_address_id = endAddress.id
    }

    if (!data.start_address_id || !data.end_address_id) {
      return response.badRequest({ 
        message: 'Both start and end addresses are required. Provide either IDs or full address details.' 
      })
    }

    // Calculer le CO2 total en fonction de la distance et du transport
    const transport = await Transport.findOrFail(data.transport_id)
    const co2_total = data.distance_km * transport.co2_per_km

    const history = await History.create({
      userId: auth.user!.id,
      transportId: data.transport_id,
      startAddressId: data.start_address_id,
      endAddressId: data.end_address_id,
      distance_km: data.distance_km,
      co2_total
    })

    await history.load((loader) => {
      loader.load('transport')
      loader.load('startAddress')
      loader.load('endAddress')
    })

    return response.created(history)
  }

  /**
   * @destroy
   * @summary Delete a specific travel history entry
   * @description Deletes a specific travel history entry.
   * @responseBody 204 - {}
   */
  async destroy({ auth, params, response }: HttpContext) {
    const history = await History.query()
      .where('id', params.id)
      .where('user_id', auth.user!.id)
      .first()

    if (!history) {
      return response.notFound({ message: 'Travel history not found' })
    }

    await history.delete()
    return response.noContent()
  }
}