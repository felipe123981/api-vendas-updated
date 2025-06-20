import { Router } from 'express'
import { authenticateUserController } from '../controllers/authenticate-user.controller'

const authRouter = Router()

authRouter.post('/login', authenticateUserController)

export { authRouter }
