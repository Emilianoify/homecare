import { Router } from 'express'
import { DiagnosisController } from '../controllers/diagnosisController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createDiagnosisSchema,
  updateDiagnosisSchema,
  diagnosisParamsSchema,
  internmentParamsSchema,
} from '../schemas/diagnosisSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/diagnoses
const router = Router({ mergeParams: true })
const ctrl   = new DiagnosisController()
const M      = MODULES.CLINICAL_NOTES

router.get ('/',              authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema),                                                              ctrl.list)
router.post('/',              authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema), validateBody(createDiagnosisSchema),        ctrl.create)
router.put ('/:diagnosisId',  authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(diagnosisParamsSchema),  validateBody(updateDiagnosisSchema),        ctrl.update)

export { router as diagnosisRouter }
