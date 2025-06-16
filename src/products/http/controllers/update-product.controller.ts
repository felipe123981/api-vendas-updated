import { Request, Response } from 'express'
import { z } from 'zod'
import { container } from 'tsyringe'
import { dataValidation } from '@/common/infrastructure/validation/zod'
import { UpdateProductUseCase } from '@/products/application/usecases/update-product.usecase'

export async function updateProductController(
  request: Request,
  response: Response,
) {
  const updateProductBodySchema = z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    quantity: z.number().optional(),
  })

  const { name, price, quantity } = dataValidation(
    updateProductBodySchema,
    request.body,
  )

  const updateProductParamSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = dataValidation(updateProductParamSchema, request.params)

  const updateProductUseCase: UpdateProductUseCase.UseCase = container.resolve(
    'UpdateProductUseCase',
  )

  const product = await updateProductUseCase.execute({
    id,
    name,
    price,
    quantity,
  })

  return response.status(200).json(product)
}
