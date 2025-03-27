/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/users_controller')

router.post('/api/users', [UsersController, 'create'])

router.get('/api/users/me', [UsersController, 'getMyFullName'])

router.post('/api/login', [UsersController, 'login'])

router.post('/api/logout', [UsersController, 'logout'])

router.get('/api', async () => {
  return { message: 'Welcome to my adonis api' }
})
