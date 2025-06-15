import { BadRequestError } from '@/common/domain/errors/BadRequestError'
import { ProductsRepository } from '@/products/domain/repositories/products.repository'
import { inject, injectable } from 'tsyringe'
import { ProductOutput } from '../dtos/product-output.dto'

export namespace CreateProductUseCase {
  export type Input = {
    name: string
    price: number
    quantity: number
  }

  export type Output = ProductOutput

  @injectable()
  export class UseCase {
    constructor(
      @inject('ProductRepository')
      private productsRepository: ProductsRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      if (!input.name || input.price <= 0 || input.quantity <= 0) {
        throw new BadRequestError('Input data not provided or invalid')
      }

      await this.productsRepository.conflictingName(input.name)

      const product = this.productsRepository.create(input)
      const createdProduct: ProductOutput =
        await this.productsRepository.insert(product)

      return createdProduct
    }
  }
}
