import { ConflictError } from '@/common/domain/errors/conflict-error'
import { NotFoundError } from '@/common/domain/errors/not-found-error'
import { InMemoryRepository } from '@/common/domain/repositories/in-memory.repository'
import { UserModel } from '@/users/domain/models/user.model'
import { UsersRepository } from '@/users/domain/repositories/users.repository'

export class UsersInMemoryRepository
  extends InMemoryRepository<UserModel>
  implements UsersRepository
{
  sortableFields: string[] = ['name', 'email', 'created_at']

  async findByEmail(email: string): Promise<UserModel> {
    const model = this.items.find(item => item.email === email)
    if (!model) {
      throw new NotFoundError(`User not found using email ${email}`)
    }
    return model
  }

  async findByName(name: string): Promise<UserModel> {
    const model = this.items.find(item => item.name === name)
    if (!model) {
      throw new NotFoundError(`User not found using name ${name}`)
    }
    return model
  }

  async conflictingEmail(email: string): Promise<void> {
    const user = this.items.find((item: any) => item.email === email)
    if (user) {
      throw new ConflictError('Email already used on another user')
    }
  }

  protected async applyFilter(
    items: UserModel[],
    filter: string,
  ): Promise<UserModel[]> {
    if (!filter) {
      return items
    }
    return items.filter(item => {
      return item.name.toLowerCase().includes(filter.toLowerCase())
    })
  }

  protected async applySort(
    items: UserModel[],
    sort: string | null,
    sortDir: string | null,
  ): Promise<UserModel[]> {
    return super.applySort(items, sort ?? 'created_at', sortDir ?? 'desc')
  }
}
