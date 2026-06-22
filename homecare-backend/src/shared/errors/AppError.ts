export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public override readonly message: string
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}
