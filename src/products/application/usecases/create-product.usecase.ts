import { BadRequestError } from '@/common/domain/errors/BadRequestError'
import { ProductsRepository } from '@/products/domain/repositories/products.repository'

export namespace CreateProductUseCase {
  export type Input = {
    name: string
    price: number
    quantity: number
  }

  export type Output = {
    id: string
    name: string
    price: number
    quantity: number
    created_at: Date
    updated_at: Date
  }

  export class UseCase {
    constructor(private productRepository: ProductsRepository) {}

    async execute(input: Input): Promise<Output> {
      if (!input.name || input.price <= 0 || input.quantity <= 0) {
        throw new BadRequestError('Input data not provided or invalid')
      }

      await this.productRepository.conflictingName(input.name)
      const product = this.productRepository.create(input)

      await this.productRepository.insert(product)

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }
    }
  }
}
