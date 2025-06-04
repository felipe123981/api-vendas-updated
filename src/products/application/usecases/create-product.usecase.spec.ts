import { ProductsRepository } from '@/products/domain/repositories/products.repository'
import { CreateProductUseCase } from './create-product.usecase'
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repositories/products-in-memory.repository'
import { ConflictError } from '@/common/domain/errors/ConflictError'
import { BadRequestError } from '@/common/domain/errors/BadRequestError'

describe('CreateProductUseCase', () => {
  let sut: CreateProductUseCase.UseCase
  let repository: ProductsRepository

  beforeEach(() => {
    repository = new ProductsInMemoryRepository()
    sut = new CreateProductUseCase.UseCase(repository)
  })

  it('should create a product', async () => {
    const spyInsert = jest.spyOn(repository, 'insert')
    const props = {
      name: 'Product 1',
      price: 100,
      quantity: 10,
    }
    const result = await sut.execute(props)
    expect(result.id).toBeDefined()
    expect(result.created_at).toBeDefined()
    expect(result.name).toBe(props.name)
    expect(spyInsert).toHaveBeenCalledTimes(1)
  })

  it('shoud not be possible to register a product with the name of another product', async () => {
    const props = {
      name: 'Product 1',
      price: 100,
      quantity: 10,
    }
    await sut.execute(props)
    await expect(sut.execute(props)).rejects.toBeInstanceOf(ConflictError)
  })

  it('should throw an error if name is not provided', async () => {
    const props = {
      name: '',
      price: 100,
      quantity: 10,
    }
    await expect(sut.execute(props)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('should throw an error if price is not provided', async () => {
    const props = {
      name: 'Product 1',
      price: 0,
      quantity: 10,
    }
    await expect(sut.execute(props)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('should throw an error if quantity is not provided', async () => {
    const props = {
      name: 'Product 1',
      price: 100,
      quantity: 0,
    }
    await expect(sut.execute(props)).rejects.toBeInstanceOf(BadRequestError)
  })
})
