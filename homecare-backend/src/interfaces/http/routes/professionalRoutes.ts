import { Router } from 'express'
import { ProfessionalController } from '../controllers/professionalController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createProfessionalSchema,
  updateProfessionalSchema,
  professionalParamsSchema,
  professionalQuerySchema,
} from '../schemas/professionalSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new ProfessionalController()
const M      = MODULES.PROFESSIONALS

router.get   ('/',    authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(professionalQuerySchema),                                                              ctrl.list)
router.get   ('/:id', authenticate, requirePermission(M, ACTIONS.READ),   validateParams(professionalParamsSchema),                                                            ctrl.getById)
router.post  ('/',    authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createProfessionalSchema),                                              ctrl.create)
router.put   ('/:id', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(professionalParamsSchema), validateBody(updateProfessionalSchema),   ctrl.update)
router.delete('/:id', authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(professionalParamsSchema),                                            ctrl.delete)

export { router as professionalRouter }
