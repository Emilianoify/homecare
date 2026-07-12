import { Router } from 'express'
import { BranchStockController } from '../controllers/branchStockController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createStockMovementSchema,
  branchStockQuerySchema,
  stockMovementQuerySchema,
} from '../schemas/branchStockSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new BranchStockController()
const M      = MODULES.SUPPLIES

router.get ('/',           authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(branchStockQuerySchema),                                          ctrl.listStock)
router.get ('/movements',  authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(stockMovementQuerySchema),                                        ctrl.listMovements)
router.post('/movements',  authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createStockMovementSchema),                        ctrl.createMovement)

export { router as branchStockRouter }
