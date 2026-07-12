import { Router } from 'express'
import { InsurerSupplyRateController } from '../controllers/insurerSupplyRateController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createInsurerSupplyRateSchema,
  updateInsurerSupplyRateSchema,
  insurerSupplyRateParamsSchema,
  insurerParamsSchema,
  insurerSupplyRateQuerySchema,
} from '../schemas/insurerSupplyRateSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/health-insurers/:healthInsurerId/supply-rates
const router = Router({ mergeParams: true })
const ctrl   = new InsurerSupplyRateController()
const M      = MODULES.HEALTH_INSURERS

router.get   ('/',             authenticate, requirePermission(M, ACTIONS.READ),   validateParams(insurerParamsSchema),          validateQuery(insurerSupplyRateQuerySchema),                                ctrl.list)
router.post  ('/',             authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(insurerParamsSchema),          validateBody(createInsurerSupplyRateSchema),                ctrl.create)
router.put   ('/:supplyRateId',authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(insurerSupplyRateParamsSchema), validateBody(updateInsurerSupplyRateSchema),                ctrl.update)
router.delete('/:supplyRateId',authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(insurerSupplyRateParamsSchema),                                                            ctrl.delete)

export { router as insurerSupplyRateRouter }
