import db from '@adonisjs/lucid/services/db'
import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class UsersController {
  /**
   * @index
   * @summary Get array of users
   * @description Returns an array of users with id, fullname, email, created at, updated at.
   * @responseBody 200 - <User[]>
   */
  index() {
    return db.query().select('id', 'full_name', 'email', 'created_at', 'updated_at').from('users')
  }

  /**
   * @login
   * @summary Authenticate user
   * @description Authenticates a user and returns an access token.
   */
  async login({ request }: HttpContext) {
    const body = request.body()
    const email = body.email as string
    const password = body.password as string

    const user = await User.verifyCredentials(email, password)

    if (user) {
      const token = await User.accessTokens.create(user)
      console.log('Logged in')
      
      return {
        type: 'bearer',
        token: token.value!.release(),
      }
    }
  }

  /**
   * @logout
   * @summary Logout user
   * @description Logs out the authenticated user by deleting their access token.
   */
  async logout({ auth }: HttpContext) {
    const user = await auth.authenticate()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
  }

  /**
   * @create
   * @summary Create a new user
   * @description Creates a new user and stores it in the database.
   * @responseBody 201 - <User> // returns no content
   */
  async create({ request, response }: HttpContext) {
    const body = request.body()
    body.created_at = DateTime.now()
    body.updated_at = DateTime.now()

    const user: User = body as User
    user.password = await hash.make(user.password)

    await db.table('users').insert(user)
    response.status(201)
  }

  /**
   * @getMyInfo
   * @summary Get authenticated user's information
   * @description Retrieves the authenticated user's information.
   * @responseBody 200 - <User>.only(full_name, created_at)
   */
  async getMyInfo({ auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) {
      return { message: 'User not found' }
    }
    return {
      full_name: user.fullName,
      created_at: user.createdAt,
    }
  }
}
