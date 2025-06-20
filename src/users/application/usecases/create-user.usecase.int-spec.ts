import 'reflect-metadata'
import { UsersInMemoryRepository } from '@/users/infrastructure/in-memory/users-in-memory.repository'
import { CreateUserUseCase } from './create-user.usecase'
import { HashProvider } from '@/common/domain/providers/hash-provider'
import { BcryptjsHashProvider } from '@/common/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { UsersDataBuilder } from '@/users/infrastructure/testing/helpers/users-data-builder'
import { ConflictError } from '@/common/domain/errors/conflict-error'
import { BadRequestError } from '@/common/domain/errors/bad-request-error'

describe('CreateUserUseCase Integration Tests', () => {
  let createUserUseCase: CreateUserUseCase.UseCase
  let repository: UsersInMemoryRepository
  let hashProvider: HashProvider

  beforeEach(() => {
    repository = new UsersInMemoryRepository()
    hashProvider = new BcryptjsHashProvider()
    createUserUseCase = new CreateUserUseCase.UseCase(repository, hashProvider)
  })

  it('should create a user', async () => {
    const spyInsert = jest.spyOn(repository, 'insert')
    const props = UsersDataBuilder({})
    const result = await createUserUseCase.execute({
      name: props.name,
      email: props.email,
      password: props.password,
    })
    expect(result.id).toBeDefined()
    expect(result.created_at).toBeInstanceOf(Date)
    expect(spyInsert).toHaveBeenCalledTimes(1)
  })

  it('should encrypt the users password when registering', async () => {
    const props = UsersDataBuilder({ password: '123456' })
    const result = await createUserUseCase.execute(props)

    const isPasswordCorrectlyHashed = await hashProvider.compareHash(
      '123456',
      result.password,
    )

    expect(isPasswordCorrectlyHashed).toBeTruthy()
  })

  it('should throws error when name not provided', async () => {
    const props = { name: null, email: 'a@a.com', password: '123456' }
    await expect(() => createUserUseCase.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })

  it('should throws error when email not provided', async () => {
    const props = { name: 'Test name', email: null, password: '123456' }
    await expect(() => createUserUseCase.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })

  it('should throws error when password not provided', async () => {
    const props = { name: 'Test name', email: 'a@a.com', password: null }
    await expect(() => createUserUseCase.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })

  it('should not be able to register with same email twice', async () => {
    const props = {
      name: 'test name',
      email: 'a@a.com',
      password: '123456',
    }
    await createUserUseCase.execute(props)

    await expect(() => createUserUseCase.execute(props)).rejects.toBeInstanceOf(
      ConflictError,
    )
  })
})
