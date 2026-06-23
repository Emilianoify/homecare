import { Router } from 'express'
import { PatientController } from '../controllers/patientController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createPatientSchema,
  updatePatientSchema,
  patientParamsSchema,
  patientQuerySchema,
} from '../schemas/patientSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new PatientController()
const M      = MODULES.PATIENTS

router.get   ('/',    authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(patientQuerySchema),                                                      ctrl.list)
router.get   ('/:id', authenticate, requirePermission(M, ACTIONS.READ),   validateParams(patientParamsSchema),                                                    ctrl.getById)
router.post  ('/',    authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createPatientSchema),                                      ctrl.create)
router.put   ('/:id', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(patientParamsSchema), validateBody(updatePatientSchema), ctrl.update)
router.delete('/:id', authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(patientParamsSchema),                                    ctrl.delete)

export { router as patientRouter }
