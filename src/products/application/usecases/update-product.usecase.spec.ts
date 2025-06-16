import 'reflect-metadata'
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repositories/products-in-memory.repository'
import { UpdateProductUseCase } from './update-product.usecase'
import { NotFoundError } from '@/common/domain/errors/NotFoundError'

describe('UpdateProductUseCase Unit Tests', () => {
  let sut: UpdateProductUseCase.UseCase
  let repository: ProductsInMemoryRepository

  beforeEach(() => {
    repository = new ProductsInMemoryRepository()
    sut = new UpdateProductUseCase.UseCase(repository)
  })

  test('should throws error when product not found', async () => {
    await expect(sut.execute({ id: 'fake-id' })).rejects.toBeInstanceOf(
      NotFoundError,
    )
  })

  test('should be able to update a product', async () => {
    const spyUpdate = jest.spyOn(repository, 'update')
    const props = {
      name: 'Product 1',
      price: 10,
      quantity: 5,
    }
    const model = repository.create(props)
    await repository.insert(model)

    const newData = {
      id: model.id,
      name: 'new name',
      price: 500,
      quantity: 20,
    }
    const result = await sut.execute(newData)
    expect(result.name).toEqual(newData.name)
    expect(result.price).toEqual(newData.price)
    expect(result.quantity).toEqual(newData.quantity)
    expect(spyUpdate).toHaveBeenCalledTimes(1)
  })
})
