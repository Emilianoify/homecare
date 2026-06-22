import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { validateBody } from '../middlewares/validateMiddleware.js'
import { loginSchema, registerSchema } from '../schemas/authSchema.js'

const router = Router()
const ctrl   = new AuthController()

router.post('/login',    validateBody(loginSchema),                  ctrl.login)
router.post('/register', authenticate, validateBody(registerSchema), ctrl.register)
router.post('/logout',   authenticate,                               ctrl.logout)
router.post('/refresh',                                              ctrl.refresh)
router.get ('/me',       authenticate,                               ctrl.me)

export { router as authRouter }
