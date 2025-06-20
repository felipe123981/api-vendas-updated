import { AppError } from './app-error'

export class InvalidCredentialsError extends AppError {
  constructor(message: string) {
    super(message, 400)
    this.name = 'InvalidCredentialsError'
  }
}
