import 'reflect-metadata'
import { AuthenticateUserUseCase } from './authenticate-user.usecase'
import { UsersInMemoryRepository } from '@/users/infrastructure/in-memory/users-in-memory.repository'
import { HashProvider } from '@/common/domain/providers/hash-provider'
import { BcryptjsHashProvider } from '@/common/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { UsersDataBuilder } from '@/users/infrastructure/testing/helpers/users-data-builder'
import { InvalidCredentialsError } from '@/common/domain/errors/invalid-credentials-error'
import { NotFoundError } from '@/common/domain/errors/not-found-error'

describe('AuthenticateUserUseCase Unit Tests', () => {
  let sut: AuthenticateUserUseCase.UseCase
  let repository: UsersInMemoryRepository
  let hashProvider: HashProvider

  beforeEach(() => {
    repository = new UsersInMemoryRepository()
    hashProvider = new BcryptjsHashProvider()
    sut = new AuthenticateUserUseCase.UseCase(repository, hashProvider)
  })

  it('should authenticate a user', async () => {
    const spyFindByEmail = jest.spyOn(repository, 'findByEmail')
    await repository.insert(
      UsersDataBuilder({
        email: 'a@a.com',
        password: await hashProvider.generateHash('123456'),
      }),
    )

    const result = await sut.execute({
      email: 'a@a.com',
      password: '123456',
    })
    expect(result.email).toEqual('a@a.com')
    expect(spyFindByEmail).toHaveBeenCalledTimes(1)
  })

  it('should not be able to authenticate with wrong email', async () => {
    await expect(() =>
      sut.execute({
        email: 'a@a.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    await repository.insert(
      UsersDataBuilder({
        email: 'a@a.com',
        password: await hashProvider.generateHash('123456'),
      }),
    )

    await expect(() =>
      sut.execute({
        email: 'a@a.com',
        password: 'fake',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
