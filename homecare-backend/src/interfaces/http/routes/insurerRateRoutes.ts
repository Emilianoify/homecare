import { Router } from 'express'
import { InsurerRateController } from '../controllers/insurerRateController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createInsurerRateSchema,
  updateInsurerRateSchema,
  insurerRateParamsSchema,
  insurerParamsSchema,
  insurerRateQuerySchema,
} from '../schemas/insurerRateSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/health-insurers/:healthInsurerId/rates
const router = Router({ mergeParams: true })
const ctrl   = new InsurerRateController()
const M      = MODULES.HEALTH_INSURERS

router.get   ('/',         authenticate, requirePermission(M, ACTIONS.READ),   validateParams(insurerParamsSchema),     validateQuery(insurerRateQuerySchema),                                                    ctrl.list)
router.post  ('/',         authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(insurerParamsSchema), validateBody(createInsurerRateSchema),                                       ctrl.create)
router.put   ('/:rateId',  authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(insurerRateParamsSchema), validateBody(updateInsurerRateSchema),                                   ctrl.update)
router.delete('/:rateId',  authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(insurerRateParamsSchema),                                                                          ctrl.delete)

export { router as insurerRateRouter }
