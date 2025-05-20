import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import History from '#models/history'
import Transport from '#models/transport'
import Address from '#models/address'
import User from '#models/user'

async function getAuthToken(client: any) {
  // First create a user
  await client.post('/api/users').json({
    full_name: 'Marie Dupont',
    email: 'marie@example.com',
    password: 'password123',
  })
  
  // Get the user from the database
  const user = await User.findBy('email', 'marie@example.com')
  if (!user) {
    throw new Error('Failed to create user')
  }
  
  // Then login to get the token
  const loginResponse = await client.post('/api/login').json({
    email: 'marie@example.com',
    password: 'password123'
  })

  return {
    token: loginResponse.body().token,
    user: user
  }
}

test.group('History flow (HistoriesController)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('History can be created via /api/users/history', async ({ client, assert }) => {
    const { token, user } = await getAuthToken(client)
    
    // Create required related records
    const transport = await Transport.create({
      name: 'Car',
      co2_per_km: 0.2,
      average_speed: 50
    })
    const startAddress = await Address.create({
      full_address: '123 Start Street, Paris',
      latitude: 48.8566,
      longitude: 2.3522
    })
    const endAddress = await Address.create({
      full_address: '456 End Street, Paris',
      latitude: 48.8606,
      longitude: 2.3376
    })

    const response = await client.post('/api/users/history')
      .header('Authorization', `Bearer ${token}`)
      .json({
        transport_id: transport.id,
        start_address_id: startAddress.id,
        end_address_id: endAddress.id,
        distance_km: 5.5
      })

    response.assertStatus(201)

    const history = await History.findBy('userId', user.id)
    assert.exists(history)
    assert.equal(history?.distance_km, 5.5)
    assert.equal(history?.co2_total, 1.1) // 5.5 * 0.2
  })

  test('All histories can be retrieved via /api/users/history', async ({ client, assert }) => {
    const { token, user } = await getAuthToken(client)
    
    // Create test data
    const transport = await Transport.create({
      name: 'Bike',
      co2_per_km: 0,
      average_speed: 15
    })
    const startAddress = await Address.create({
      full_address: 'Start Point, Paris',
      latitude: 48.8566,
      longitude: 2.3522
    })
    const endAddress = await Address.create({
      full_address: 'End Point, Paris',
      latitude: 48.8606,
      longitude: 2.3376
    })

    await History.createMany([
      {
        userId: user.id,
        transportId: transport.id,
        startAddressId: startAddress.id,
        endAddressId: endAddress.id,
        distance_km: 3.5,
        co2_total: 0
      },
      {
        userId: user.id,
        transportId: transport.id,
        startAddressId: startAddress.id,
        endAddressId: endAddress.id,
        distance_km: 4.5,
        co2_total: 0
      }
    ])

    const response = await client.get('/api/users/history')
      .header('Authorization', `Bearer ${token}`)
    response.assertStatus(200)
    const histories = response.body()
    assert.lengthOf(histories, 2)
    assert.includeMembers(
      histories.map((h: any) => h.distanceKm),
      [3.5, 4.5]
    )
  })

  test('A specific history can be retrieved via /api/users/history/:id', async ({ client, assert }) => {
    const { token, user } = await getAuthToken(client)
    
    const transport = await Transport.create({
      name: 'Bus',
      co2_per_km: 0.1,
      average_speed: 30
    })
    const startAddress = await Address.create({
      full_address: 'Bus Start, Paris',
      latitude: 48.8566,
      longitude: 2.3522
    })
    const endAddress = await Address.create({
      full_address: 'Bus End, Paris',
      latitude: 48.8606,
      longitude: 2.3376
    })

    const history = await History.create({
      userId: user.id,
      transportId: transport.id,
      startAddressId: startAddress.id,
      endAddressId: endAddress.id,
      distance_km: 7.5,
      co2_total: 0.75
    })

    const response = await client.get(`/api/users/history/${history.id}`)
      .header('Authorization', `Bearer ${token}`)
    response.assertStatus(200)
    assert.equal(response.body().distanceKm, 7.5)
    assert.equal(response.body().co2Total, 0.75)
  })

  test('Returns 404 for nonexistent history on GET /api/users/history/:id', async ({ client }) => {
    const { token } = await getAuthToken(client)
    
    const response = await client.get('/api/users/history/999')
      .header('Authorization', `Bearer ${token}`)
    response.assertStatus(404)
    response.assertBodyContains({ message: 'Travel history not found' })
  })

  test('History can be deleted via /api/users/history/:id', async ({ client, assert }) => {
    const { token, user } = await getAuthToken(client)
    
    const transport = await Transport.create({
      name: 'Walking',
      co2_per_km: 0,
      average_speed: 5
    })
    const startAddress = await Address.create({
      full_address: 'Walk Start, Paris',
      latitude: 48.8566,
      longitude: 2.3522
    })
    const endAddress = await Address.create({
      full_address: 'Walk End, Paris',
      latitude: 48.8606,
      longitude: 2.3376
    })

    const history = await History.create({
      userId: user.id,
      transportId: transport.id,
      startAddressId: startAddress.id,
      endAddressId: endAddress.id,
      distance_km: 2,
      co2_total: 0
    })

    const response = await client.delete(`/api/users/history/${history.id}`)
      .header('Authorization', `Bearer ${token}`)
    response.assertStatus(204)

    const deleted = await History.find(history.id)
    assert.isNull(deleted)
  })

  test('Returns 404 when deleting nonexistent history', async ({ client }) => {
    const { token } = await getAuthToken(client)
    
    const response = await client.delete('/api/users/history/999')
      .header('Authorization', `Bearer ${token}`)
    response.assertStatus(404)
    response.assertBodyContains({ message: 'Travel history not found' })
  })

  test('Returns 401 when accessing without token', async ({ client }) => {
    const response = await client.get('/api/users/history')
    response.assertStatus(401)
  })
}) 