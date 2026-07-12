import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { validateBody } from '../middlewares/validateMiddleware.js'
import { loginRateLimiter, refreshRateLimiter } from '../middlewares/rateLimiters.js'
import { loginSchema } from '../schemas/authSchema.js'

const router = Router()
const ctrl   = new AuthController()

// El alta de usuarios vive SOLO en POST /api/users, protegido por
// requirePermission(USERS, CREATE) y con companyId tomado del token.
// No existe /register: tomaba companyId y roleId del body sin control de
// permiso — cualquier usuario logueado podía crear usuarios en cualquier
// company con cualquier rol (escalada de privilegios + cross-tenant).
router.post('/login',   loginRateLimiter,   validateBody(loginSchema), ctrl.login)
router.post('/logout',  authenticate,                                  ctrl.logout)
router.post('/refresh', refreshRateLimiter,                            ctrl.refresh)
router.get ('/me',      authenticate,                                  ctrl.me)

export { router as authRouter }
