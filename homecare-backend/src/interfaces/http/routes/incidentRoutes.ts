import { Router } from 'express'
import { IncidentController } from '../controllers/incidentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createIncidentSchema,
  updateIncidentStatusSchema,
  resolveIncidentSchema,
  incidentParamsSchema,
  internmentParamsSchema,
  incidentQuerySchema,
} from '../schemas/incidentSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/incidents
const router = Router({ mergeParams: true })
const ctrl   = new IncidentController()
const M      = MODULES.QUALITY

router.get  ('/',                        authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema), validateQuery(incidentQuerySchema),                                       ctrl.list)
router.get  ('/:incidentId',             authenticate, requirePermission(M, ACTIONS.READ),   validateParams(incidentParamsSchema),                                                                             ctrl.getById)
router.post ('/',                        authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema), validateBody(createIncidentSchema),                      ctrl.create)
router.patch('/:incidentId/status',      authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(incidentParamsSchema),   validateBody(updateIncidentStatusSchema),                ctrl.updateStatus)
router.patch('/:incidentId/resolve',     authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(incidentParamsSchema),   validateBody(resolveIncidentSchema),                     ctrl.resolve)

export { router as incidentRouter }
