import 'reflect-metadata'
import { UpdateAvatarUseCase } from './update-avatar.usecase'
import { UsersRepository } from '@/users/domain/repositories/users.repository'
import { UploaderProvider } from '@/common/domain/providers/uploader.provider'
import { UsersInMemoryRepository } from '@/users/infrastructure/in-memory/users-in-memory.repository'
import { FakerUploader } from '@/common/infrastructure/providers/storage-provider/testing/faker.uploader'
import { NotFoundError } from '@/common/domain/errors/not-found-error'
import { BadRequestError } from '@/common/domain/errors/bad-request-error'
import { UsersDataBuilder } from '@/users/infrastructure/testing/helpers/users-data-builder'

describe('UpdateAvatarUseCase Unit Tests', () => {
  let sut: UpdateAvatarUseCase.UseCase
  let repository: UsersRepository
  let uploader: UploaderProvider

  beforeEach(() => {
    repository = new UsersInMemoryRepository()
    uploader = new FakerUploader()
    sut = new UpdateAvatarUseCase.UseCase(repository, uploader)
  })

  it('should throws error when user not found', async () => {
    const input: UpdateAvatarUseCase.Input = {
      user_id: 'fakeId',
      filename: 'file.png',
      filesize: 1000,
      filetype: 'image/png',
      body: Buffer.from(''),
    }
    await expect(async () => sut.execute(input)).rejects.toThrow(NotFoundError)
    await expect(async () => sut.execute(input)).rejects.toThrow(
      new NotFoundError(`Model not found with ID: fakeId`),
    )
  })

  it('should throws error when file size is greater than 3MB', async () => {
    const user = UsersDataBuilder({})
    await repository.insert(user)
    const input: UpdateAvatarUseCase.Input = {
      user_id: user.id,
      filename: 'file.png',
      filesize: 15000000,
      filetype: 'image/png',
      body: Buffer.from(''),
    }
    await expect(async () => sut.execute(input)).rejects.toThrow(
      BadRequestError,
    )
    await expect(async () => sut.execute(input)).rejects.toThrow(
      new BadRequestError('File size must be less than 3MB'),
    )
  })

  it('should throws error when the file type is invalid', async () => {
    const user = UsersDataBuilder({})
    await repository.insert(user)
    const input: UpdateAvatarUseCase.Input = {
      user_id: user.id,
      filename: 'file.png',
      filesize: 1000,
      filetype: 'test/fake',
      body: Buffer.from(''),
    }
    await expect(async () => sut.execute(input)).rejects.toThrow(
      BadRequestError,
    )
    await expect(async () => sut.execute(input)).rejects.toThrow(
      new BadRequestError('.jpg, .jpeg, .png and .webp files are accepted'),
    )
  })

  it('should be able to update a user avatar image', async () => {
    const spyFindById = jest.spyOn(repository, 'findById')
    const user = await repository.insert(
      UsersDataBuilder({ avatar: 'file.png' }),
    )
    const input: UpdateAvatarUseCase.Input = {
      user_id: user.id,
      filename: 'file.png',
      filesize: 1000,
      filetype: 'image/png',
      body: Buffer.from(''),
    }
    const result = await sut.execute(input)
    expect(spyFindById).toHaveBeenCalledTimes(1)
    expect(result.id).toEqual(user.id)
    expect(result.avatar).toContain('file.png')
  })
})
