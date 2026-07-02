import { Router } from 'express'
import { HealthInsurerController } from '../controllers/healthInsurerController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createHealthInsurerSchema,
  updateHealthInsurerSchema,
  healthInsurerParamsSchema,
  healthInsurerQuerySchema,
} from '../schemas/healthInsurerSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new HealthInsurerController()
const M      = MODULES.HEALTH_INSURERS

router.get   ('/',    authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(healthInsurerQuerySchema),                                                               ctrl.list)
router.get   ('/:id', authenticate, requirePermission(M, ACTIONS.READ),   validateParams(healthInsurerParamsSchema),                                                             ctrl.getById)
router.post  ('/',    authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createHealthInsurerSchema),                                               ctrl.create)
router.put   ('/:id', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(healthInsurerParamsSchema), validateBody(updateHealthInsurerSchema),   ctrl.update)
router.delete('/:id', authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(healthInsurerParamsSchema),                                             ctrl.delete)

export { router as healthInsurerRouter }
