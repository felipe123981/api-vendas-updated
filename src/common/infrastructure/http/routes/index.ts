import { Router } from 'express'

const routes = Router()

routes.get('/', (req, resp) => {
  return resp.status(200).json({ message: 'Hello Dev!' })
})

export { routes }
