import { Router } from 'express'
import { InternmentController } from '../controllers/internmentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createInternmentSchema,
  updateInternmentSchema,
  dischargeInternmentSchema,
  internmentParamsSchema,
  internmentQuerySchema,
} from '../schemas/internmentSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new InternmentController()
const M      = MODULES.INTERNMENTS

router.get   ('/',              authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(internmentQuerySchema),                                                             ctrl.list)
router.get   ('/:id',           authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema),                                                           ctrl.getById)
router.post  ('/',              authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createInternmentSchema),                                             ctrl.create)
router.put   ('/:id',           authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(internmentParamsSchema), validateBody(updateInternmentSchema),    ctrl.update)
router.patch ('/:id/discharge', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(internmentParamsSchema), validateBody(dischargeInternmentSchema), ctrl.discharge)
router.delete('/:id',           authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(internmentParamsSchema),                                          ctrl.delete)

export { router as internmentRouter }
