import { env } from '../env'
import { dataSource } from '../typeorm'
import { app } from './app'
import '@/common/infrastructure/container'

dataSource
  .initialize()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}! 🏆`)
      console.log('API docs available at GET /docs 📚')
    })
  })
  .catch(error => {
    console.error('Error initializing data source:', error)
  })
