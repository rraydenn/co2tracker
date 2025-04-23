// import type { HttpContext } from '@adonisjs/core/http'
import Transport from '#models/transport'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class TransportsController {
    /**
     * @index
     * @summary Get array of transports
     * @description Retrieves all transports with their details.
     * @responseBody 200 - <Transport[]> 
     */
    index({response}: HttpContext) {
        response.status(200)
        return db.query().select('id', 'name', 'co2_per_km', 'average_speed').from('transports')
    }

    /**
     * @create
     * @summary Create a new transport
     * @description Creates a new transport entry in the database.
     * @responseBody 201 - {} // returns no content
     */
    async create({ request, response }: HttpContext) {
        const body = request.body()
    
        const transport: Transport = body as Transport
    
        await db.table('transports').insert(transport)
        response.status(201)
    }

    /**
     * @delete
     * @summary Delete a transport
     * @description Deletes a specific transport by ID.
     * @responseBody 204 - {} // returns no content
     */
    async delete({ params, response }: HttpContext) {
        const transport = await Transport.find(params.id)
        if (!transport) {
          return response.notFound({ message: 'Transport not found' })
        }
        await transport.delete()
        return response.noContent()
    }

    /**
     * @get
     * @summary Get a specific transport
     * @description Retrieves a specific transport by ID.
     * @responseBody 200 - <Transport> // returns model specification
     */
    async get({ params, response }: HttpContext) {
        const transport = await Transport.find(params.id)
        if (!transport) {
          return response.notFound({ message: 'Transport not found' })
        }
        return  response.json(transport)
    }

    /**
     * @put
     * @summary Update a transport
     * @description Updates an existing transport by ID with provided data.
     * @responseBody 200 - <Transport> // returns model specification
     */
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

    /**
     * @patch
     * @summary Partially update a transport
     * @description Partially updates an existing transport by ID with provided data.
     * @responseBody 200 - <Transport> // returns model specification
     */
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
