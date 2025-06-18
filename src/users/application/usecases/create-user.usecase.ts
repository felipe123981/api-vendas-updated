import { inject, injectable } from 'tsyringe'
import { UserOutput } from '../dtos/user-output.dtos'
import { UsersRepository } from '@/users/domain/repositories/users.repository'
import { BadRequestError } from '@/common/domain/errors/BadRequestError'

export namespace CreateUserUseCase {
  export type Input = {
    name: string
    email: string
    password: string
  }

  export type Output = UserOutput

  @injectable()
  export class UseCase {
    constructor(
      @inject('UsersRepository')
      private usersRepository: UsersRepository,
    ) {}
    async execute(input: Input): Promise<Output> {
      if (!input.name || !input.email || !input.password) {
        throw new BadRequestError('Input data not provided or invalid')
      }

      await this.usersRepository.conflictingEmail(input.email)

      const user = this.usersRepository.create(input)
      return this.usersRepository.insert(user)
    }
  }
}
