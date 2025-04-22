import Address from '#models/address'
import type { HttpContext } from '@adonisjs/core/http'

export default class AddressesController {
    /**
     * @index
     * @summary Get array of addresses
     * @description Retrieves all addresses.
     * @param {HttpContext} context - The HTTP context containing the response object.
     * @returns {Promise<void>} A JSON response with all addresses.
     */
    async index({ response }: HttpContext) {
        const addresses = await Address.all()
        return response.json(addresses)
    }

    /**
     * @show
     * @summary Get a specific address
     * @description Retrieves a specific address by ID.
     * @param {HttpContext} context - The HTTP context containing the parameters and response objects.
     * @returns {Promise<void>} A JSON response with the specific address or a not found message.
     */
    async show({params, response}: HttpContext) {
        const address = await Address.find(params.id)
        if(!address) {
            return response.notFound({message: 'Adresse introuvable'})
        }

        return response.json(address)
    }

    /**
     * @create
     * @summary Create a new address
     * @description Creates a new address.
     * @param {HttpContext} context - The HTTP context containing the request and response objects.
     * @returns {Promise<void>} A JSON response with the created address.
     */
    async create({request, response}: HttpContext) {
        const address = await Address.create(request.body())
        return response.created(address)
    }

    /**
     * @update
     * @summary Update an existing address
     * @description Updates an existing address by ID.
     * @param {HttpContext} context - The HTTP context containing the parameters, request, and response objects.
     * @returns {Promise<void>} A JSON response with the updated address or a not found message.
     */
    async update({params, request, response}: HttpContext) {
        const address = await Address.find(params.id)
        if (!address) {
            return response.notFound({message: 'Adresse introuvable'})
        }

        address.merge(request.body())
        await address.save()

        return response.json(address)
    }

    /**
     * @destroy
     * @summary Delete a specific address
     * @description Deletes a specific address by ID.
     * @param {HttpContext} context - The HTTP context containing the parameters and response objects.
     * @returns {Promise<void>} A no content response or a not found message.
     */
    async destroy({params, response}: HttpContext) {
        const address = await Address.find(params.id)
        if(!address) {
            return response.notFound({message: 'Adresse introuvable'})
        }

        await address.delete()
        return response.noContent()
    }

}