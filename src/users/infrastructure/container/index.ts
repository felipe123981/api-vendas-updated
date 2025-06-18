import { container } from 'tsyringe'
import { User } from '../typeorm/entities/users.entity'
import { CreateUserUseCase } from '@/users/application/usecases/create-user.usecase'
import { UsersTypeormRepository } from '../typeorm/repositories/users-typeorm.repository'
import { dataSource } from '@/common/infrastructure/typeorm'

container.registerSingleton('UsersRepository', UsersTypeormRepository)
container.registerInstance(
  'UsersDefaultRepositoryTypeorm',
  dataSource.getRepository(User),
)
container.registerSingleton('CreateUserUseCase', CreateUserUseCase.UseCase)
