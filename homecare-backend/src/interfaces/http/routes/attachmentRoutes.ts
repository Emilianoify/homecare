import { Router } from 'express'
import { AttachmentController } from '../controllers/attachmentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createAttachmentSchema,
  attachmentParamsSchema,
  internmentParamsSchema,
  attachmentQuerySchema,
} from '../schemas/attachmentSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/attachments
const router = Router({ mergeParams: true })
const ctrl   = new AttachmentController()
const M      = MODULES.CLINICAL_NOTES

router.get ('/',               authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema),  validateQuery(attachmentQuerySchema),                                     ctrl.list)
router.get ('/:attachmentId',  authenticate, requirePermission(M, ACTIONS.READ),   validateParams(attachmentParamsSchema),                                                                           ctrl.getById)
router.post('/',               authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema), validateBody(createAttachmentSchema),                    ctrl.create)

export { router as attachmentRouter }
