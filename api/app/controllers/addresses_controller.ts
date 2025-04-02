import Address from '#models/address'
import type { HttpContext } from '@adonisjs/core/http'

export default class AddressesController {
    async index({ response }: HttpContext) {
        const addresses = await Address.all()
        return response.json(addresses)
    }

    async show({params, response}: HttpContext) {
        const address = await Address.find(params.id)
        if(!address) {
            return response.notFound({message: 'Adresse introuvable'})
        }

        return response.json(address)
    }

    async create({request, response}: HttpContext) {
        const address = await Address.create(request.body())
        return response.created(address)
    }

    async update({params, request, response}: HttpContext) {
        const address = await Address.find(params.id)
        if (!address) {
            return response.notFound({message: 'Adresse introuvable'})
        }

        address.merge(request.body())
        await address.save()

        return response.json(address)
    }

    async destroy({params, response}: HttpContext) {
        const address = await Address.find(params.id)
        if(!address) {
            return response.notFound({message: 'Adresse introuvable'})
        }

        await address.delete()
        return response.noContent()
    }

}