/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { Exception } from '@adonisjs/core/exceptions'
import router from '@adonisjs/core/services/router'
import { STATUS_CODES } from 'http'

const UsersController = () => import('#controllers/users_controller')

router.post('/users', [UsersController, 'create'])

router.get('/users/me', [UsersController, 'getMyFullName'])

router.post('/login', [UsersController, 'login'])

router.post('/logout', [UsersController, 'logout'])


router.get('/', async () => {
  return { message: 'Welcome to my API' }
})
