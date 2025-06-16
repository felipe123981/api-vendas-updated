import { Request, Response } from 'express'
import { z } from 'zod'
import { container } from 'tsyringe'
import { dataValidation } from '@/common/infrastructure/validation/zod'
import { DeleteProductUseCase } from '@/products/application/usecases/delete-product.usecase'

export async function deleteProductController(
  request: Request,
  response: Response,
) {
  const deleteProductParamSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = dataValidation(deleteProductParamSchema, request.params)

  const deleteProductUseCase: DeleteProductUseCase.UseCase = container.resolve(
    'DeleteProductUseCase',
  )

  await deleteProductUseCase.execute({ id })

  return response.status(204).send()
}
