import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

test.group('Auth flow (UsersController)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('User can be created via /api/users', async ({ client, assert }) => {
    const response = await client.post('/api/users').json({
      full_name: 'Jean Dupont',
      email: 'jean@example.com',
      password: 'securepass123',
    })

    response.assertStatus(201)
    const user = await User.findBy('email', 'jean@example.com')
    assert.exists(user)
  })

  test('User can login with correct credentials', async ({ client, assert }) => {
    await client.post('/api/users').json({ // const user = 
      full_name: 'Marie Dupont',
      email: 'marie@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/login').json({
      email: 'marie@example.com',
      password: 'password123',
    })

    response.assertStatus(200)
    assert.exists(response.body().token)
  })

  test('Fails login with invalid password', async ({ client }) => {
    await User.create({
      fullName: 'Fake User',
      email: 'fake@example.com',
      password: await hash.make('realpassword'),
    })

    const response = await client.post('/api/login').json({
      email: 'fake@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(401)
  })

  test('Authenticated user can call /api/users/me and get user info', async ({
    client,
    assert,
  }) => {
    await client.post('/api/users').json({ // const user = 
      full_name: 'Infos User',
      email: 'info@example.com',
      password: 'infopass',
    })

    const login = await client.post('/api/login').json({
      email: 'info@example.com',
      password: 'infopass',
    })

    const token = login.body().token
    const response = await client.get('/api/users/me').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().full_name, 'Infos User')
    assert.exists(response.body().co2_total)
    assert.exists(response.body().distance_km)
  })

  test('Cannot access /api/users/me without token', async ({ client }) => {
    const response = await client.get('/api/users/me')
    response.assertStatus(401)
  })

  test('User can logout via /api/logout and token is revoked', async ({ client }) => {
    await client.post('/api/users').json({ //const user = 
      full_name: 'Logout',
      email: 'logout@example.com',
      password: 'logoutpass',
    })

    const login = await client.post('/api/login').json({
      email: 'logout@example.com',
      password: 'logoutpass',
    })

    const token = login.body().token
    await client.post('/api/logout').header('Authorization', `Bearer ${token}`)

    const me = await client.get('/api/users/me').header('Authorization', `Bearer ${token}`)
    me.assertStatus(401)
  })
})
