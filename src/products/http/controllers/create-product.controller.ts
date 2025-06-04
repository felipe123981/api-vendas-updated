import { AppError } from '@/common/domain/errors/AppError'
import { dataSource } from '@/common/infrastructure/typeorm'
import { CreateProductUseCase } from '@/products/application/usecases/create-product.usecase'
import { Product } from '@/products/infrastructure/typeorm/entities/products.entity'
import { ProductsTypeormRepository } from '@/products/infrastructure/typeorm/repositories/products-typeorm.repository'
import { Request, Response } from 'express'
import { z } from 'zod'

export async function createProductController(
  request: Request,
  response: Response,
) {
  const createProductBodySchema = z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })

  const validatedData = createProductBodySchema.safeParse(request.body)

  if (validatedData.success === false) {
    console.error('Invalid data:', validatedData.error.format())
    throw new AppError(
      `${validatedData.error.errors.map(err => {
        return `${err.path} -> ${err.message}`
      })}`,
    )
  }

  const { name, price, quantity } = validatedData.data

  const repository = new ProductsTypeormRepository()
  repository.productsRepository = dataSource.getRepository(Product)
  const createProductUseCase = new CreateProductUseCase.UseCase(repository)

  const product = await createProductUseCase.execute({
    name,
    price,
    quantity,
  })
  return response.status(201).json(product)
}
