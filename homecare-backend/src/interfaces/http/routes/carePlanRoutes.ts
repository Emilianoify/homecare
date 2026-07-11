import { Router } from 'express'
import { CarePlanController } from '../controllers/carePlanController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createCarePlanSchema,
  carePlanParamsSchema,
  internmentParamsSchema,
  carePlanQuerySchema,
} from '../schemas/carePlanSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/care-plans
const router = Router({ mergeParams: true })
const ctrl   = new CarePlanController()
const M      = MODULES.INTERNMENTS

router.get  ('/',                        authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema), validateQuery(carePlanQuerySchema),                                    ctrl.list)
router.get  ('/:carePlanId',             authenticate, requirePermission(M, ACTIONS.READ),   validateParams(carePlanParamsSchema),                                                                          ctrl.getById)
router.post ('/',                        authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema), validateBody(createCarePlanSchema),                   ctrl.create)
router.patch('/:carePlanId/deactivate',  authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(carePlanParamsSchema),                                                         ctrl.deactivate)

export { router as carePlanRouter }
