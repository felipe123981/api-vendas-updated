import { AppError } from '@/common/domain/errors/app-error'
import { NextFunction, Request, Response } from 'express'

export function errorHandler(
  err: Error,
  req: Request,
  resp: Response,
  _next: NextFunction,
): Response {
  if (err instanceof AppError) {
    return resp.status(400).json({ error: err.message })
  }

  return resp
    .status(500)
    .json({ status: 'error', message: 'Internal Server Error' })
}
