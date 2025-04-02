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

const TransportsController = () => import('#controllers/transports_controller')

router.post('/api/users', [UsersController, 'create'])

router.get('/api/users/me', [UsersController, 'getMyFullName'])

router.post('/api/login', [UsersController, 'login'])

router.post('/api/logout', [UsersController, 'logout'])

router.get('/api/transports', [TransportsController, 'index'])

router.post('/api/transports', [TransportsController, 'create'])

router.delete('/api/transports/:id', [TransportsController, 'delete'])

router.get('/api/transports/:id', [TransportsController, 'get'])

router.put('/api/transports/:id', [TransportsController, 'put'])

router.patch('/api/transports/:id', [TransportsController, 'patch'])

router.get('/api', async () => {
  return { message: 'Welcome to my adonis api' }
})
