import { Router } from 'express'
import { AlertConfigController } from '../controllers/alertConfigController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createAlertConfigSchema,
  updateAlertConfigSchema,
  alertConfigParamsSchema,
  alertConfigQuerySchema,
} from '../schemas/alertConfigSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new AlertConfigController()
const M      = MODULES.QUALITY

router.get   ('/',    authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(alertConfigQuerySchema),                                                             ctrl.list)
router.get   ('/:id', authenticate, requirePermission(M, ACTIONS.READ),   validateParams(alertConfigParamsSchema),                                                          ctrl.getById)
router.post  ('/',    authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createAlertConfigSchema),                                            ctrl.create)
router.put   ('/:id', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(alertConfigParamsSchema), validateBody(updateAlertConfigSchema),  ctrl.update)
router.delete('/:id', authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(alertConfigParamsSchema),                                          ctrl.delete)

export { router as alertConfigRouter }
