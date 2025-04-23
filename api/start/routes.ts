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

router.post('/api/users', [UsersController, 'create'])

router.get('/api/users', [UsersController, 'index'])

router.get('/api/users/me', [UsersController, 'getMyInfo'])

router.post('/api/login', [UsersController, 'login'])

router.post('/api/logout', [UsersController, 'logout'])

router.get('/api/transports', [TransportsController, 'index'])

router.post('/api/transports', [TransportsController, 'create'])

router.delete('/api/transports/:id', [TransportsController, 'delete'])

router.get('/api/transports/:id', [TransportsController, 'get'])

router.put('/api/transports/:id', [TransportsController, 'put'])

router.patch('/api/transports/:id', [TransportsController, 'patch'])


router.get('/api/address', [AddressController, 'index'])
router.post('/api/address', [AddressController, 'create'])
router.delete('/api/address/:id', [AddressController, 'destroy'])
router.get('/api/address/:id', [AddressController, 'show'])
router.put('/api/address/:id', [AddressController, 'update'])

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


router.get("/swagger", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});


router.get("/docs", async () => {
  return AutoSwagger.default.ui("/swagger", swagger);
});