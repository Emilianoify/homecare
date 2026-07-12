import { Router } from 'express'
import { VisitController } from '../controllers/visitController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createVisitSchema,
  markMissedSchema,
  visitParamsSchema,
  internmentParamsSchema,
  visitQuerySchema,
} from '../schemas/visitSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/visits
const router = Router({ mergeParams: true })
const ctrl   = new VisitController()
const M      = MODULES.INTERNMENTS

router.get  ('/',                   authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema), validateQuery(visitQuerySchema),                                      ctrl.list)
router.get  ('/:visitId',           authenticate, requirePermission(M, ACTIONS.READ),   validateParams(visitParamsSchema),                                                                            ctrl.getById)
router.post ('/',                   authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema), validateBody(createVisitSchema),                     ctrl.create)
router.patch('/:visitId/missed',    authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(visitParamsSchema),       validateBody(markMissedSchema),                     ctrl.markMissed)

export { router as visitRouter }
