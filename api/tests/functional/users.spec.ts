import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { UserFactory } from '#database/factories/user_factory'

test.group('User Model + Factory', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('can create a user with factory', async ({ assert }) => {
    const user = await UserFactory.create()
    assert.exists(user.id)
    assert.isDefined(user.email)
  })

  test('can create multiple users with factory', async ({ assert }) => {
    const users = await UserFactory.createMany(5)
    assert.lengthOf(users, 5)
  })

  test('can override user fields with .merge()', async ({ assert }) => {
    const user = await UserFactory.merge({ email: 'custom@mail.com' }).create()
    assert.equal(user.email, 'custom@mail.com')
  })

  test('should not allow duplicate email', async ({ assert }) => {
    const email = 'duplicate@test.com'
    await UserFactory.merge({ email }).create()

    let errorThrown = false
    try {
      await UserFactory.merge({ email }).create()
    } catch (error) {
      errorThrown = true
      assert.include(error.message, 'duplicate key')
    }

    assert.isTrue(errorThrown)
  })

  test('user should not expose password in JSON', async ({ assert }) => {
    const user = await UserFactory.create()
    const serialized = user.serialize()
    assert.isUndefined(serialized.password)
  })
})

