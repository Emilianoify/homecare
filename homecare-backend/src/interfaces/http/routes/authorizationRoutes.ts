import { Router } from 'express'
import { AuthorizationController } from '../controllers/authorizationController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createAuthorizationSchema,
  updateAuthorizationStatusSchema,
  authorizationParamsSchema,
  internmentParamsSchema,
} from '../schemas/authorizationSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/authorizations
const router = Router({ mergeParams: true })
const ctrl   = new AuthorizationController()
const M      = MODULES.INTERNMENTS

router.get  ('/',                          authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema),                                                                     ctrl.list)
router.get  ('/:authorizationId',          authenticate, requirePermission(M, ACTIONS.READ),   validateParams(authorizationParamsSchema),                                                                  ctrl.getById)
router.post ('/',                          authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema),    validateBody(createAuthorizationSchema),        ctrl.create)
router.patch('/:authorizationId/status',   authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(authorizationParamsSchema), validateBody(updateAuthorizationStatusSchema),  ctrl.updateStatus)

export { router as authorizationRouter }
