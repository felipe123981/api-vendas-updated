import { Router } from 'express'
import { createProductController } from '../controllers/create-product.controller'

const productsRouter = Router()
productsRouter.post('/', createProductController)

export { productsRouter }
