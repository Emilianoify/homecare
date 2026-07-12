import type { Request, Response } from 'express'
import { LoginUseCase } from '../../../application/useCases/auth/loginUseCase.js'
import { LogoutUseCase } from '../../../application/useCases/auth/logoutUseCase.js'
import { RefreshTokenUseCase } from '../../../application/useCases/auth/refreshTokenUseCase.js'
import { UserRepository } from '../../../infrastructure/database/repositories/userRepository.js'
import { sendOk, sendUnauthorized } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import type { LoginDto } from '../schemas/authSchema.js'

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure:   process.env['NODE_ENV'] === 'production',
}

export class AuthController {
  private readonly userRepository = new UserRepository()

  login = async (req: Request, res: Response): Promise<void> => {
    const { user, accessToken, refreshToken } = await new LoginUseCase(this.userRepository).execute(req.body as LoginDto)

    res.cookie('access_token', accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path:   '/api/auth/refresh',
    })

    sendOk(res, SUCCESS_MESSAGES.AUTH.LOGIN, user)
  }

  logout = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies['refresh_token'] as string | undefined
    if (token && req.user) {
      await new LogoutUseCase(this.userRepository).execute(req.user.userId, token)
    }
    // clearCookie repite los atributos con los que se creó la cookie
    // (salvo maxAge) para que el browser la borre siempre.
    res.clearCookie('access_token', COOKIE_BASE)
    res.clearCookie('refresh_token', { ...COOKIE_BASE, path: '/api/auth/refresh' })
    sendOk(res, SUCCESS_MESSAGES.AUTH.LOGOUT)
  }

  refresh = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies['refresh_token'] as string | undefined
    if (!token) {
      sendUnauthorized(res, ERROR_MESSAGES.AUTH.INVALID_REFRESH)
      return
    }
    const { accessToken, refreshToken } = await new RefreshTokenUseCase(this.userRepository).execute(token)
    res.cookie('access_token', accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path:   '/api/auth/refresh',
    })
    sendOk(res, SUCCESS_MESSAGES.AUTH.REFRESH)
  }

  me = async (req: Request, res: Response): Promise<void> => {
    sendOk(res, SUCCESS_MESSAGES.AUTH.ME, req.user)
  }
}
