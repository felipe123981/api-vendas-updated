import { ConflictError } from '@/common/domain/errors/conflict-error'
import { NotFoundError } from '@/common/domain/errors/not-found-error'
import { InMemoryRepository } from '@/common/domain/repositories/in-memory.repository'
import { ProductModel } from '@/products/domain/model/products.model'
import {
  ProductId,
  ProductsRepository,
} from '@/products/domain/repositories/products.repository'

export class ProductsInMemoryRepository
  extends InMemoryRepository<ProductModel>
  implements ProductsRepository
{
  sortableFields: string[] = ['name', 'created_at']

  async findByName(name: string): Promise<ProductModel> {
    const product = this.items.find(item => item.name === name)
    if (!product) {
      throw new NotFoundError(`Product not found using name: ${name}`)
    }

    return product
  }

  async findAllByIds(ProductIds: ProductId[]): Promise<ProductModel[]> {
    const existingProducts = []
    for (const productId of ProductIds) {
      const model = this.items.find(item => item.id === productId.id)
      if (!model) {
        throw new NotFoundError(`Product not found using id: ${productId.id}`)
      }
      existingProducts.push(model)
    }

    return existingProducts
  }

  async conflictingName(name: string): Promise<void> {
    const product = this.items.find(item => item.name === name)
    if (product) {
      throw new ConflictError('Name already used on another product.')
    }
  }

  protected async applyFilter(
    items: ProductModel[],
    filter: string | null,
  ): Promise<ProductModel[]> {
    if (!filter) return items
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase()),
    )
  }

  protected async applySort(
    items: ProductModel[],
    sort: string | null,
    sort_dir: string | null,
  ): Promise<ProductModel[]> {
    return super.applySort(items, sort ?? 'created_at', sort_dir ?? 'desc')
  }
}
