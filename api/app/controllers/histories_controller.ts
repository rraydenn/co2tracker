import type { HttpContext } from '@adonisjs/core/http'
import History from '#models/history'
import Transport from '#models/transport'
import Address from '#models/address'
import { createHistoryValidator, updateHistoryValidator } from '#validators/history'

export default class HistoriesController {
  /**
   * Cherche une adresse existante basée sur les coordonnées ou l'adresse complète
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
   * Récupérer l'historique des trajets de l'utilisateur connecté
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
   * Récupérer un trajet spécifique
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
   * Créer un nouveau trajet dans l'historique
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
   * Supprimer un trajet
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