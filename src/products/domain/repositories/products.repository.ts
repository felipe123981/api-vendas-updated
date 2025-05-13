import { RepositoryInterface } from '@/common/domain/repositories/repository.interface'
import { ProductModel } from '../model/products.model'

export type CreateProductProps = {
  id: string
  name: string
  price: number
  quantity: number
  created_at: Date
  updated_at: Date
}

export type ProductId = {
  id: string
}

export interface ProductRepository
  extends RepositoryInterface<ProductModel, CreateProductProps> {
  findByName(name: string): Promise<ProductModel>
  findAllByIds(ids: ProductId[]): Promise<ProductModel[]>
  conflictingName(name: string): Promise<void>
}
