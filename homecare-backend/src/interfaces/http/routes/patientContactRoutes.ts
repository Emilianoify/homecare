import { Router } from 'express'
import { PatientContactController } from '../controllers/patientContactController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createPatientContactSchema,
  updatePatientContactSchema,
  patientContactParamsSchema,
  patientParamsSchema,
} from '../schemas/patientContactSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router({ mergeParams: true })
const ctrl   = new PatientContactController()
const M      = MODULES.PATIENTS

router.get   ('/',           authenticate, requirePermission(M, ACTIONS.READ),   validateParams(patientParamsSchema),                                                                   ctrl.list)
router.post  ('/',           authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(patientParamsSchema),   validateBody(createPatientContactSchema),      ctrl.create)
router.put   ('/:contactId', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(patientContactParamsSchema), validateBody(updatePatientContactSchema), ctrl.update)
router.delete('/:contactId', authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(patientContactParamsSchema),                                           ctrl.delete)

export { router as patientContactRouter }
