import { inject, injectable } from 'tsyringe'
import { UserOutput } from '@/users/application/dtos/user-output.dto'
import { UsersRepository } from '@/users/domain/repositories/users.repository'
import { UploaderProvider } from '@/common/domain/providers/uploader.provider'
import { BadRequestError } from '@/common/domain/errors/bad-request-error'
import { randomUUID } from 'node:crypto'

export namespace UpdateAvatarUseCase {
  export type Input = {
    user_id: string
    filename: string
    filesize: number
    filetype: string
    body: Buffer
  }

  export type Output = UserOutput

  export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3MB

  export const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]

  @injectable()
  export class UseCase {
    constructor(
      @inject('UsersRepository')
      private usersRepository: UsersRepository,
      @inject('UploaderProvider')
      private uploader: UploaderProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { user_id, filename, filesize, filetype, body } = input

      if (!ACCEPTED_IMAGE_TYPES.includes(filetype)) {
        throw new BadRequestError('Invalid file type')
      }

      if (filesize > MAX_UPLOAD_SIZE) {
        throw new BadRequestError('File size must be less than 3MB')
      }

      const user = await this.usersRepository.findById(user_id)

      const uniqueFilename = `${randomUUID()}-${filename}`

      await this.uploader.upload({
        filename: uniqueFilename,
        filetype,
        body,
      })

      user.avatar = uniqueFilename

      return this.usersRepository.update(user)
    }
  }
}
