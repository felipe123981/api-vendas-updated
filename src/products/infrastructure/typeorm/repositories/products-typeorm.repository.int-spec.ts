import { testDataSource } from '@/common/infrastructure/typeorm/testing/data-source'
import { ProductsTypeormRepository } from './products-typeorm.repository'
import { Product } from '../entities/products.entity'
import { NotFoundError } from '@/common/domain/errors/NotFoundError'
import { randomUUID } from 'node:crypto'
import { ProductsDataBuilder } from '../../testing/helpers/products-data-builder'
import { ConflictError } from '@/common/domain/errors/ConflictError'
import { ProductModel } from '@/products/domain/model/products.model'

describe('ProductsTypeormRepository integration tests', () => {
  let ormRepository: ProductsTypeormRepository

  beforeAll(async () => {
    await testDataSource.initialize()
  })

  afterAll(async () => {
    await testDataSource.destroy()
  })

  beforeEach(async () => {
    await testDataSource.manager.query('DELETE FROM products')
    ormRepository = new ProductsTypeormRepository()
    ormRepository.productsRepository = testDataSource.getRepository(Product)
  })

  describe('findById', () => {
    it('should generate an error when the product is not found', async () => {
      const id = randomUUID()
      await expect(ormRepository.findById(id)).rejects.toThrow(
        new NotFoundError(`Product not found using ID ${id}`),
      )
    })

    it('should finds a product by id', async () => {
      const data = ProductsDataBuilder({})
      const product = testDataSource.manager.create(Product, data)
      await testDataSource.manager.save(product)

      const result = await ormRepository.findById(product.id)
      expect(result.id).toEqual(product.id)
      expect(result.name).toEqual(product.name)
    })
  })

  describe('create', () => {
    it('should create a new product object', () => {
      const data = ProductsDataBuilder({ name: 'Product 1' })
      const result = ormRepository.create(data)

      expect(result).toBeInstanceOf(Product)
      expect(result.name).toEqual(data.name)
    })
  })

  describe('insert', () => {
    it('should insert a new product', async () => {
      const data = ProductsDataBuilder({ name: 'Product 1' })
      const result = await ormRepository.insert(data)

      expect(result.name).toEqual(data.name)
    })
  })

  describe('update', () => {
    it('should generate an error when the product is not found', async () => {
      const data = ProductsDataBuilder({})
      await expect(ormRepository.update(data)).rejects.toThrow(
        new NotFoundError(`Product not found using ID ${data.id}`),
      )
    })

    it('should update a product', async () => {
      const data = ProductsDataBuilder({})
      const product = testDataSource.manager.create(Product, data)
      await testDataSource.manager.save(product)
      product.name = 'Updated name'

      const result = await ormRepository.update(product)
      expect(result.name).toEqual('Updated name')
    })
  })

  describe('delete', () => {
    it('should generate an error when the product is not found', async () => {
      const id = randomUUID()
      await expect(ormRepository.delete(id)).rejects.toThrow(
        new NotFoundError(`Product not found using ID ${id}`),
      )
    })

    it('should delete a product', async () => {
      const data = ProductsDataBuilder({})
      const product = testDataSource.manager.create(Product, data)
      await testDataSource.manager.save(product)

      await ormRepository.delete(data.id)

      const result = await testDataSource.manager.findOneBy(Product, {
        id: data.id,
      })

      expect(result).toBeNull()
    })
  })

  describe('findByName', () => {
    it('should generate an error when the product is not found', async () => {
      const name = 'Non-existent Product'
      await expect(ormRepository.findByName(name)).rejects.toThrow(
        new NotFoundError(`Product not found using name ${name}`),
      )
    })

    it('should finds a product by name', async () => {
      const data = ProductsDataBuilder({ name: 'Product 1' })
      const product = testDataSource.manager.create(Product, data)
      await testDataSource.manager.save(product)

      const result = await ormRepository.findByName(data.name)
      expect(result.name).toStrictEqual('Product 1')
    })
  })

  describe('ConflictingName', () => {
    it('should generate an error when the product found', async () => {
      const data = ProductsDataBuilder({ name: 'Product 1' })
      const product = testDataSource.manager.create(Product, data)
      await testDataSource.manager.save(product)

      await expect(ormRepository.conflictingName('Product 1')).rejects.toThrow(
        new ConflictError(`Name already used by another product`),
      )
    })
  })

  describe('findByIds', () => {
    it('should return an empty array when not find the products', async () => {
      const productIds = [
        { id: `b9314932-1616-491c-9221-9931b112e08e` },
        { id: randomUUID() },
      ]

      const result = await ormRepository.findAllByIds(productIds)
      expect(result).toEqual([]) // Expecting an empty array since no products exist
      expect(result).toHaveLength(0)
    })

    it('should finds a product by id field', async () => {
      const productIds = [
        { id: `b9314932-1616-491c-9221-9931b112e08e` },
        { id: randomUUID() },
      ]

      const data = ProductsDataBuilder({ id: productIds[0].id })
      const product = testDataSource.manager.create(Product, data)
      await testDataSource.manager.save(product)

      const result = await ormRepository.findAllByIds(productIds)
      expect(result).toHaveLength(1)
      expect(result[0].id).toStrictEqual(`b9314932-1616-491c-9221-9931b112e08e`)
    })
  })

  describe('search', () => {
    it('should apply only pagination when the other params are null', async () => {
      const arrange = Array(16).fill(ProductsDataBuilder({}))
      arrange.map(element => delete element.id)
      const data = testDataSource.manager.create(Product, arrange)
      await testDataSource.manager.save(data)

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort_dir: null,
        sort: null,
        filter: null,
      })

      expect(result.total).toEqual(16)
      expect(result.items).toHaveLength(15)
    })
  })

  describe('search', () => {
    it('should order by created_at DESC when the search params are null', async () => {
      const created_at = new Date()
      const models: ProductModel[] = []
      const arrange = Array(16).fill(ProductsDataBuilder({}))

      arrange.forEach((element, index) => {
        delete element.id
        models.push({
          ...element,
          name: `Product ${index}`,
          created_at: new Date(created_at.getTime() + index),
        })
      })

      const data = testDataSource.manager.create(Product, models)
      await testDataSource.manager.save(data)

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort_dir: null,
        sort: 'fake',
        filter: null,
      })

      expect(result.items[0].name).toEqual('Product 15')
      expect(result.items[14].name).toEqual('Product 1')
      expect(result.sort).toEqual('created_at')
      //console.log(result.items)
    })
  })

  describe('search', () => {
    it('should apply paginate and sort  ', async () => {
      const created_at = new Date()
      const models: ProductModel[] = []

      'badec'.split('').forEach((element, index) => {
        models.push({
          ...ProductsDataBuilder({}),
          name: element,
          created_at: new Date(created_at.getTime() + index),
        })
      })

      const data = testDataSource.manager.create(Product, models)
      await testDataSource.manager.save(data)

      let result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort_dir: 'asc',
        sort: 'name',
        filter: null,
      })

      expect(result.items[0].name).toEqual('a')
      expect(result.items[1].name).toEqual('b')
      expect(result.items.length).toEqual(2)

      result = await ormRepository.search({
        page: 1,
        per_page: 3,
        sort_dir: 'desc',
        sort: 'name',
        filter: null,
      })

      expect(result.items[0].name).toEqual('e')
      expect(result.items[1].name).toEqual('d')
      expect(result.items.length).toEqual(3)
      //console.log(result.items)
    })
  })

  describe('search', () => {
    it('should search using filter, sort and paginate  ', async () => {
      const created_at = new Date()
      const models: ProductModel[] = []
      const values = ['test', 'a', 'TEST', 'b', 'TeSt']

      values.forEach((element, index) => {
        models.push({
          ...ProductsDataBuilder({}),
          name: element,
          created_at: new Date(created_at.getTime() + index),
        })
      })

      const data = testDataSource.manager.create(Product, models)
      await testDataSource.manager.save(data)

      let result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort_dir: 'asc',
        sort: 'name',
        filter: 'TEST',
      })

      expect(result.items[0].name).toStrictEqual('test')
      expect(result.items[1].name).toStrictEqual('TeSt')
      expect(result.items.length).toEqual(2)
      expect(result.total).toEqual(3)

      result = await ormRepository.search({
        page: 2,
        per_page: 2,
        sort_dir: 'asc',
        sort: 'name',
        filter: 'TEST',
      })

      expect(result.items[0].name).toStrictEqual('TEST')
      expect(result.items.length).toEqual(1)
      expect(result.total).toEqual(3)
    })
  })
})
