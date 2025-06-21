import { dataValidation } from '@/common/infrastructure/validation/zod'
import { UpdateAvatarUseCase } from '@/users/application/usecases/update-avatar.usecase'
import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { z } from 'zod'

export async function updateAvatarController(
  request: Request,
  response: Response,
): Promise<Response> {
  const bodySchema = z.object({
    user_id: z.string().uuid(),
  })
  const { user_id } = dataValidation(bodySchema, request.body)

  const fileSchema = z.any().refine(file => {
    return !!file
  }, 'File is required')

  const { buffer, originalname, size, mimetype } = dataValidation(
    fileSchema,
    request.file,
  )

  const updateAvatarUseCase: UpdateAvatarUseCase.UseCase = container.resolve(
    'UpdateAvatarUseCase',
  )

  const user_avatar = await updateAvatarUseCase.execute({
    user_id,
    filename: originalname.split(' ').join('-'),
    filesize: size,
    filetype: mimetype,
    body: buffer,
  })

  return response.status(200).json(user_avatar)
}
