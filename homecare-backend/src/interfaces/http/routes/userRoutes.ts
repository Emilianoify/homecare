import { Router } from 'express'
import { UserController } from '../controllers/userController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  userParamsSchema,
  userQuerySchema,
} from '../schemas/userSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new UserController()
const M      = MODULES.USERS

router.get   ('/',                authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(userQuerySchema),                                                    ctrl.list)
router.get   ('/:id',             authenticate, requirePermission(M, ACTIONS.READ),   validateParams(userParamsSchema),                                                  ctrl.getById)
router.post  ('/',                authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createUserSchema),                                    ctrl.create)
router.put   ('/:id',             authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(userParamsSchema), validateBody(updateUserSchema),  ctrl.update)
router.patch ('/:id/password',    authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(userParamsSchema), validateBody(changePasswordSchema), ctrl.changePassword)
router.delete('/:id',             authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(userParamsSchema),                                  ctrl.delete)

export { router as userRouter }
