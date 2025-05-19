import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Address from '#models/address'

test.group('Address flow (AddressesController)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('Address can be created via /api/address', async ({ client, assert }) => {
    const response = await client.post('/api/address').json({
      full_address: '123 Main Street, Paris',
      latitude: 48.8566,
      longitude: 2.3522
    })

    response.assertStatus(201)

    const address = await Address.findBy('full_address', '123 Main Street, Paris')
    assert.exists(address)
    assert.equal(address?.latitude, 48.8566)
    assert.equal(address?.longitude, 2.3522)
  })

  test('All addresses can be retrieved via /api/address', async ({ client, assert }) => {
    await Address.createMany([
      {
        full_address: '456 First Street, Paris',
        latitude: 48.8606,
        longitude: 2.3376
      },
      {
        full_address: '789 Second Street, Paris',
        latitude: 48.8706,
        longitude: 2.3476
      }
    ])

    const response = await client.get('/api/address')
    response.assertStatus(200)
    const addresses = response.body()
    assert.lengthOf(addresses, 2)
    assert.includeMembers(
      addresses.map((a: any) => a.fullAddress),
      ['456 First Street, Paris', '789 Second Street, Paris']
    )
  })

  test('A specific address can be retrieved via /api/address/:id', async ({ client, assert }) => {
    const address = await Address.create({
      full_address: '321 Specific Street, Paris',
      latitude: 48.8806,
      longitude: 2.3576
    })

    const response = await client.get(`/api/address/${address.id}`)
    response.assertStatus(200)
    assert.equal(response.body().fullAddress, '321 Specific Street, Paris')
    assert.equal(response.body().latitude, 48.8806)
    assert.equal(response.body().longitude, 2.3576)
  })

  test('Returns 404 for nonexistent address on GET /api/address/:id', async ({ client }) => {
    const response = await client.get('/api/address/999')
    response.assertStatus(404)
    response.assertBodyContains({ message: 'Adresse introuvable' })
  })

  test('Address can be updated via /api/address/:id', async ({ client, assert }) => {
    const address = await Address.create({
      full_address: 'Original Street, Paris',
      latitude: 48.8566,
      longitude: 2.3522
    })

    const response = await client.put(`/api/address/${address.id}`).json({
      full_address: 'Updated Street, Paris',
      latitude: 48.8606,
      longitude: 2.3376
    })

    response.assertStatus(200)
    assert.equal(response.body().fullAddress, 'Updated Street, Paris')
    assert.equal(response.body().latitude, 48.8606)
    assert.equal(response.body().longitude, 2.3376)
  })

  test('Address can be deleted via /api/address/:id', async ({ client, assert }) => {
    const address = await Address.create({
      full_address: 'Delete Street, Paris',
      latitude: 48.8566,
      longitude: 2.3522
    })

    const response = await client.delete(`/api/address/${address.id}`)
    response.assertStatus(204)

    const deleted = await Address.find(address.id)
    assert.isNull(deleted)
  })

  test('Returns 404 when deleting nonexistent address', async ({ client }) => {
    const response = await client.delete('/api/address/999')
    response.assertStatus(404)
    response.assertBodyContains({ message: 'Adresse introuvable' })
  })
}) 