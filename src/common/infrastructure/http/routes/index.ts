import { productsRouter } from '@/products/http/routes/products.routes'
import { Router } from 'express'

const routes = Router()

routes.get('/', (req, resp) => {
  return resp.status(200).json({ message: 'Hello Dev!' })
})
routes.use('/products', productsRouter)

export { routes }
