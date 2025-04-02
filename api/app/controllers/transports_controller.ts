// import type { HttpContext } from '@adonisjs/core/http'
import Transport from '#models/transport'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class TransportsController {
    index() {
        return db.query().select('id', 'name', 'co2_per_km', 'average_speed').from('transports')
    }

    async create({ request, response }: HttpContext) {
        const body = request.body()
    
        const transport: Transport = body as Transport
    
        await db.table('transports').insert(transport)
        response.status(201)
    }

    async delete({ params, response }: HttpContext) {
        const transport = await Transport.find(params.id)
        if (!transport) {
          return response.notFound({ message: 'Transport not found' })
        }
        await transport.delete()
        return response.noContent()
    }

    async get({ params, response }: HttpContext) {
        const transport = await Transport.find(params.id)
        if (!transport) {
          return response.notFound({ message: 'Transport not found' })
        }
        return  response.json(transport)
    }

    async put({ request, params, response }: HttpContext) {
        const transport = await Transport.find(params.id)
        if (!transport) {
          return response.notFound({ message: 'Transport not found' })
        }
        const data = request.only(['name', 'co2_per_km', 'average_speed'])
        transport.merge(data)
        await transport.save()
        return response.ok(transport)
    }

    async patch({ request, params, response }: HttpContext) {
        const transport = await Transport.find(params.id)
        if (!transport) {
          return response.notFound({ message: 'Transport not found' })
        }
        const data = request.all()
        transport.merge(data)
        await transport.save()
        return response.ok(transport)
    }
}
