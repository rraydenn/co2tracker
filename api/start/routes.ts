/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import AutoSwagger from "adonis-autoswagger";
import swagger from "#config/swagger";

const UsersController = () => import('#controllers/users_controller')
const TransportsController = () => import('#controllers/transports_controller')
const AddressController = () => import('#controllers/addresses_controller')
const HistoryController = () => import('#controllers/histories_controller')


router.group(() => {
  router.post('/', [UsersController, 'create'])
  router.get('/', [UsersController, 'index'])
  router.get('/me', [UsersController, 'getMyInfo'])
  router.get('/ranking', [UsersController, 'getRanking'])
})
  .prefix('/api/users')

router.group(() => {
  router.post('/login', [UsersController, 'login'])
  router.post('/logout', [UsersController, 'logout'])
})
  .prefix('/api')

router.group(() => {
  router.get('/', [TransportsController, 'index'])
  router.post('/', [TransportsController, 'create'])
  router.delete('/:id', [TransportsController, 'delete'])
  router.get('/:id', [TransportsController, 'get'])
  router.put('/:id', [TransportsController, 'put'])
  router.patch('/:id', [TransportsController, 'patch'])
})
  .prefix('api/transports')


router.group(() => {
  router.get('/', [AddressController, 'index'])
  router.post('/', [AddressController, 'create'])
  router.delete('/:id', [AddressController, 'destroy'])
  router.get('/:id', [AddressController, 'show'])
  router.put('/:id', [AddressController, 'update'])
})
  .prefix('api/address')


router.group(() => {
  router.get('/', [HistoryController, 'index'])
  router.post('/', [HistoryController, 'create'])
  router.get('/:id', [HistoryController, 'show'])
  router.delete('/:id', [HistoryController, 'destroy'])
})
  .prefix('/api/users/history')
  .use(middleware.auth())


router.get('/api', async () => {
  return { message: 'Welcome to my adonis api' }
})


router.get("/api/swagger", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});


router.get("/api/docs", async () => {
  return AutoSwagger.default.ui("/api/swagger", swagger);
});