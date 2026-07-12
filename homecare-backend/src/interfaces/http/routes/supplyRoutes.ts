import { Router } from 'express'
import { SupplyController } from '../controllers/supplyController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createSupplySchema,
  updateSupplySchema,
  supplyParamsSchema,
  supplyQuerySchema,
} from '../schemas/supplySchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new SupplyController()
const M      = MODULES.SUPPLIES

router.get   ('/',    authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(supplyQuerySchema),                                                    ctrl.list)
router.get   ('/:id', authenticate, requirePermission(M, ACTIONS.READ),   validateParams(supplyParamsSchema),                                                  ctrl.getById)
router.post  ('/',    authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createSupplySchema),                                    ctrl.create)
router.put   ('/:id', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(supplyParamsSchema), validateBody(updateSupplySchema), ctrl.update)
router.delete('/:id', authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(supplyParamsSchema),                                  ctrl.delete)

export { router as supplyRouter }
