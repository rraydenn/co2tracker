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

router.post('/users', [UsersController, 'create'])

router.get('/users/me', [UsersController, 'getMyFullName'])

router.post('/login', [UsersController, 'login'])

router.post('/logout', [UsersController, 'logout'])

router.get('/api', async () => {
  return { message: 'Welcome to my API' }
})
