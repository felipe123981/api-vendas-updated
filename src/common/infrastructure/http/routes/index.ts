import { productsRouter } from '@/products/http/routes/products.routes'
import { usersRouter } from '@/users/infrastructure/http/routes/users.route'
import { Router } from 'express'

const routes = Router()

routes.get('/', (req, res) => {
  return res.status(200).json({ message: 'Olá Dev!' })
})

routes.use('/products', productsRouter)

routes.use('/users', usersRouter)

export { routes }
