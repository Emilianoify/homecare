import { Router } from 'express'
import { ClinicalNoteController } from '../controllers/clinicalNoteController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createClinicalNoteSchema,
  clinicalNoteParamsSchema,
  internmentParamsSchema,
} from '../schemas/clinicalNoteSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/clinical-notes
const router = Router({ mergeParams: true })
const ctrl   = new ClinicalNoteController()
const M      = MODULES.CLINICAL_NOTES

router.get  ('/',             authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema),                                                                    ctrl.list)
router.get  ('/:noteId',      authenticate, requirePermission(M, ACTIONS.READ),   validateParams(clinicalNoteParamsSchema),                                                                  ctrl.getById)
router.post ('/',             authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema), validateBody(createClinicalNoteSchema),            ctrl.create)
router.patch('/:noteId/sign', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(clinicalNoteParamsSchema),                                                 ctrl.sign)

export { router as clinicalNoteRouter }
