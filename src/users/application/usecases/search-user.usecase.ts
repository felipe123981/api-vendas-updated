import { inject, injectable } from 'tsyringe'
import {
  PaginationOutputDto,
  PaginationOutputMapper,
} from '@/products/application/dtos/pagination-output.dto'
import { SearchInputDto } from '@/products/application/dtos/search-input.dto'
import { UserModel } from '@/users/domain/models/user.model'
import { UsersRepository } from '@/users/domain/repositories/users.repository'

export namespace SearchUserUseCase {
  export type Input = SearchInputDto

  export type Output = PaginationOutputDto<UserModel>

  @injectable()
  export class UseCase {
    constructor(
      @inject('UsersRepository')
      private usersRepository: UsersRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const searchResult = await this.usersRepository.search(input)
      return PaginationOutputMapper.toOutput(searchResult.items, searchResult)
    }
  }
}
