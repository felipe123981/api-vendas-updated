import { CreateProductUseCase } from '@/products/application/usecases/create-product.usecase'
import { ProductsTypeormRepository } from '@/products/infrastructure/typeorm/repositories/products-typeorm.repository'
import { container } from 'tsyringe'
import { dataSource } from '@/common/infrastructure/typeorm'
import { Product } from '@/products/infrastructure/typeorm/entities/products.entity'

container.registerSingleton('ProductRepository', ProductsTypeormRepository)
container.registerSingleton(
  'CreateProductUseCase',
  CreateProductUseCase.UseCase,
)
container.registerInstance(
  'ProductsDefaultTypeormRepository',
  dataSource.getRepository(Product),
)
