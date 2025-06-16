import { dataSource } from '@/common/infrastructure/typeorm'
import { UsersTypeormRepository } from '@/users/infrastructure/typeorm/repositories/users-typeorm.repository'
import { container } from 'tsyringe'
import { User } from '../typeorm/entities/users.entity'

container.registerSingleton('UsersRepository', UsersTypeormRepository)
container.registerInstance(
  'UsersDefaultRepositoryTypeorm',
  dataSource.getRepository(User),
)
