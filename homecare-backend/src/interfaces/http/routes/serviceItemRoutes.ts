import { Router } from 'express'
import { ServiceItemController } from '../controllers/serviceItemController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createServiceItemSchema,
  updateServiceItemSchema,
  serviceItemParamsSchema,
  serviceItemQuerySchema,
} from '../schemas/serviceItemSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new ServiceItemController()
const M      = MODULES.HEALTH_INSURERS

router.get   ('/',    authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(serviceItemQuerySchema),                                                          ctrl.list)
router.get   ('/:id', authenticate, requirePermission(M, ACTIONS.READ),   validateParams(serviceItemParamsSchema),                                                        ctrl.getById)
router.post  ('/',    authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createServiceItemSchema),                                          ctrl.create)
router.put   ('/:id', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(serviceItemParamsSchema), validateBody(updateServiceItemSchema), ctrl.update)
router.delete('/:id', authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(serviceItemParamsSchema),                                        ctrl.delete)

export { router as serviceItemRouter }
