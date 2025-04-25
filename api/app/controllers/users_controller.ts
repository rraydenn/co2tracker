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
   * @requestBody {"email": "string", "password": "string"} 
   */
  async login({ request, response }: HttpContext) {
    const body = request.body()
    const email = body.email as string
    const password = body.password as string

    const user = await User.verifyCredentials(email, password)
      .catch(() => {
      return response.unauthorized({ error: 'Invalid credentials' })
    })
    
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
   * @responseBody 409 - {error: "Email already exists"} // if email already exists
   * @requestBody {"full_name": "string", "email": "exemple@exemple", "password": "string"} 
   */
  async create({ request, response }: HttpContext) {
    const body = request.body()
    body.created_at = DateTime.now()
    body.updated_at = DateTime.now()

    const existingUser = await db.query()
    .from('users').where('email', body.email)
    .first()
    if (existingUser) {
      return response.conflict({error: "Email already exists"})
    }
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

    const result = await db.query()
      .from('histories')
      .where('user_id', user.id)
      .select(
        db.raw('SUM(co2_total) as total_co2'),
        db.raw('SUM(distance_km) as total_distance_km')
      )
      .first();

    const total_co2 = result.total_co2;
    const total_distance_km = result.total_distance_km;

    return {
      full_name: user.fullName,
      created_at: user.createdAt,
      distance_km: total_distance_km,
      co2_total: total_co2,
    }
  }

  async getRanking({ response }: HttpContext) {
    const ranking = await db
      .from('users')
      .leftJoin('histories', 'users.id', 'histories.user_id')
      .select(
        'users.id',
        'users.full_name',
        db.raw('COALESCE(SUM(histories.co2_total), 0) as total_co2'),
        db.raw('COALESCE(SUM(histories.distance_km), 0) as total_distance')
      )
      .groupBy('users.id', 'users.full_name')
      .orderBy('total_distance', 'asc').limit(100)

    const rankedUsers = ranking.map((user, index) => ({
      rank: index + 1,
      full_name: user.full_name,
      total_co2: Number(user.total_co2),
      total_distance: Number(user.total_distance)
    }))

    return response.ok(rankedUsers)
  }

}
