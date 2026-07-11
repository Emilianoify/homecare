import { Router } from 'express'
import { MedicationController } from '../controllers/medicationController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createMedicationSchema,
  updateMedicationSchema,
  discontinueMedicationSchema,
  medicationParamsSchema,
  internmentParamsSchema,
  medicationQuerySchema,
} from '../schemas/medicationSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/medications
const router = Router({ mergeParams: true })
const ctrl   = new MedicationController()
const M      = MODULES.CLINICAL_NOTES

router.get  ('/',                        authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema),   validateQuery(medicationQuerySchema),                                           ctrl.list)
router.post ('/',                        authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema),  validateBody(createMedicationSchema),                          ctrl.create)
router.put  ('/:medicationId',           authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(medicationParamsSchema),  validateBody(updateMedicationSchema),                          ctrl.update)
router.patch('/:medicationId/discontinue', authenticate, requirePermission(M, ACTIONS.UPDATE), auditMutations, validateParams(medicationParamsSchema), validateBody(discontinueMedicationSchema),                     ctrl.discontinue)

export { router as medicationRouter }
