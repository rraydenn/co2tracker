import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Transport from '#models/transport'

test.group('Transport flow (TransportsController)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('Transport can be created via /api/transports', async ({ client, assert }) => {
    const response = await client.post('/api/transports').json({
      name: 'Bus',
      co2_per_km: 40,
      average_speed: 50,
    })

    response.assertStatus(201)

    const transport = await Transport.findBy('name', 'Bus')
    assert.exists(transport)
  })

  test('All transports can be retrieved via /api/transports', async ({ client, assert }) => {
    await Transport.createMany([
      { name: 'Train', co2_per_km: 25, average_speed: 100 },
      { name: 'Bike', co2_per_km: 0, average_speed: 15 },
    ])

    const response = await client.get('/api/transports')
    response.assertStatus(200)
    const names = response.body().map((t: Transport) => t.name)
    assert.includeMembers(names, ['Train', 'Bike'])
  })

  test('A specific transport can be retrieved via /api/transports/:id', async ({
    client,
    assert,
  }) => {
    const transport = await Transport.create({
      name: 'Tramway',
      co2_per_km: 15,
      average_speed: 30,
    })

    const response = await client.get(`/api/transports/${transport.id}`)
    response.assertStatus(200)
    assert.equal(response.body().name, 'Tramway')
  })

  test('Returns 404 for nonexistent transport on GET /api/transports/:id', async ({ client }) => {
    const response = await client.get('/api/transports/999')
    response.assertStatus(404)
    response.assertBodyContains({ message: 'Transport not found' })
  })

  test('Transport can be updated with PUT /api/transports/:id', async ({ client, assert }) => {
    const transport = await Transport.create({
      name: 'Scooter',
      co2_per_km: 10,
      average_speed: 25,
    })

    const response = await client.put(`/api/transports/${transport.id}`).json({
      name: 'Electric Scooter',
      co2_per_km: 5,
      average_speed: 20,
    })

    response.assertStatus(200)
    assert.equal(response.body().name, 'Electric Scooter')
  })

  test('Transport can be partially updated with PATCH /api/transports/:id', async ({
    client,
    assert,
  }) => {
    const transport = await Transport.create({
      name: 'Boat',
      co2_per_km: 70,
      average_speed: 25,
    })

    const response = await client.patch(`/api/transports/${transport.id}`).json({
      average_speed: 30,
    })

    response.assertStatus(200)
    console.log('PATCH response:', response.body()) // pour voir la vraie structure
    assert.equal(response.body().averageSpeed, 30)
  })

  test('Transport can be deleted via /api/transports/:id', async ({ client, assert }) => {
    const transport = await Transport.create({
      name: 'Plane',
      co2_per_km: 300,
      average_speed: 850,
    })

    const response = await client.delete(`/api/transports/${transport.id}`)
    response.assertStatus(204)

    const deleted = await Transport.find(transport.id)
    assert.isNull(deleted)
  })

  test('Returns 404 when deleting nonexistent transport', async ({ client }) => {
    const response = await client.delete('/api/transports/999')
    response.assertStatus(404)
    response.assertBodyContains({ message: 'Transport not found' })
  })
})
