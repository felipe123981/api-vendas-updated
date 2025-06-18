import { Request, Response } from 'express'
import { dataValidation } from '@/common/infrastructure/validation/zod'
import { CreateUserUseCase } from '@/users/application/usecases/create-user.usecase'
import { container } from 'tsyringe'
import { z } from 'zod'

export async function createUserController(
  request: Request,
  response: Response,
): Promise<Response> {
  const bodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  })

  const { name, email, password } = dataValidation(bodySchema, request.body)

  const createUserUseCase: CreateUserUseCase.UseCase =
    container.resolve('CreateUserUseCase')

  const user = await createUserUseCase.execute({
    name,
    email,
    password,
  })

  return response.status(201).json(user)
}
