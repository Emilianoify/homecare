import { Router } from 'express'
import { SupplyOrderController } from '../controllers/supplyOrderController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createSupplyOrderSchema,
  addSupplyOrderItemSchema,
  cancelSupplyOrderSchema,
  supplyOrderParamsSchema,
  supplyOrderItemParamsSchema,
  internmentParamsSchema,
  supplyOrderQuerySchema,
} from '../schemas/supplyOrderSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/supply-orders
const router = Router({ mergeParams: true })
const ctrl   = new SupplyOrderController()
const M      = MODULES.SUPPLIES

router.get   ('/',                                  authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema),    validateQuery(supplyOrderQuerySchema),                                          ctrl.list)
router.get   ('/:supplyOrderId',                    authenticate, requirePermission(M, ACTIONS.READ),   validateParams(supplyOrderParamsSchema),                                                                                    ctrl.getById)
router.post  ('/',                                  authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema),    validateBody(createSupplyOrderSchema),                          ctrl.create)
router.patch ('/:supplyOrderId/send',               authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(supplyOrderParamsSchema),                                                                   ctrl.send)
router.patch ('/:supplyOrderId/cancel',             authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(supplyOrderParamsSchema),   validateBody(cancelSupplyOrderSchema),                          ctrl.cancel)
router.post  ('/:supplyOrderId/items',              authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(supplyOrderParamsSchema),   validateBody(addSupplyOrderItemSchema),                         ctrl.addItem)
router.delete('/:supplyOrderId/items/:itemId',      authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(supplyOrderItemParamsSchema),                                                               ctrl.removeItem)

export { router as supplyOrderRouter }
