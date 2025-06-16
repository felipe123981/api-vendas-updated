import 'reflect-metadata'
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repositories/products-in-memory.repository'
import { ProductsDataBuilder } from '@/products/infrastructure/testing/helpers/products-data-builder'
import { NotFoundError } from '@/common/domain/errors/NotFoundError'
import { DeleteProductUseCase } from './delete-product.usecase'

describe('DeleteProductUseCase Unit Tests', () => {
  let sut: DeleteProductUseCase.UseCase
  let repository: ProductsInMemoryRepository

  beforeEach(() => {
    repository = new ProductsInMemoryRepository()
    sut = new DeleteProductUseCase.UseCase(repository)
  })

  test('should throws error when product not found', async () => {
    await expect(async () => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      NotFoundError,
    )
    await expect(async () => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      new NotFoundError(`Model not found with ID: fakeId`),
    )
  })

  test('should be able to delete a product', async () => {
    const spyDelete = jest.spyOn(repository, 'delete')
    const product = await repository.insert(ProductsDataBuilder({}))
    expect(repository.items.length).toBe(1)

    await sut.execute({ id: product.id })
    expect(spyDelete).toHaveBeenCalledTimes(1)
    expect(repository.items.length).toBe(0)
  })
})
