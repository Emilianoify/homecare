import { Router } from 'express'
import { FunctionalStatusController } from '../controllers/functionalStatusController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createFunctionalStatusSchema,
  functionalStatusParamsSchema,
  functionalStatusQuerySchema,
} from '../schemas/functionalStatusSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// mergeParams: true para heredar :patientId del router padre
const router = Router({ mergeParams: true })
const ctrl   = new FunctionalStatusController()
const M      = MODULES.PATIENTS

router.get ('/',       authenticate, requirePermission(M, ACTIONS.READ),   validateParams(functionalStatusParamsSchema), validateQuery(functionalStatusQuerySchema), ctrl.list)
router.get ('/latest', authenticate, requirePermission(M, ACTIONS.READ),   validateParams(functionalStatusParamsSchema),                                              ctrl.latest)
router.post('/',       authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(functionalStatusParamsSchema), validateBody(createFunctionalStatusSchema), ctrl.create)

export { router as functionalStatusRouter }
