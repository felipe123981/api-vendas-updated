import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { z } from 'zod'
import { dataValidation } from '@/common/infrastructure/validation/zod'
import { AuthenticateUserUseCase } from '@/users/application/usecases/authenticate-user.usecase'

export async function authenticateUserController(
  request: Request,
  response: Response,
): Promise<Response> {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
  })
  const { email, password } = dataValidation(bodySchema, request.body)

  const authenticateUserUseCase: AuthenticateUserUseCase.UseCase =
    container.resolve('AuthenticateUserUseCase')

  const user = await authenticateUserUseCase.execute({
    email,
    password,
  })

  return response.status(200).json(user)
}
