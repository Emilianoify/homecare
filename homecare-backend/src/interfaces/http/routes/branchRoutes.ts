import { Router } from 'express'
import { BranchController } from '../controllers/branchController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import { createBranchSchema, updateBranchSchema, branchParamsSchema } from '../schemas/branchSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new BranchController()
const M      = MODULES.BRANCHES

router.get   ('/',    authenticate, requirePermission(M, ACTIONS.READ),   ctrl.list)
router.get   ('/:id', authenticate, requirePermission(M, ACTIONS.READ),   validateParams(branchParamsSchema),                                                    ctrl.getById)
router.post  ('/',    authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createBranchSchema),                                      ctrl.create)
router.put   ('/:id', authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(branchParamsSchema), validateBody(updateBranchSchema),  ctrl.update)
router.delete('/:id', authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(branchParamsSchema),                                    ctrl.delete)

export { router as branchRouter }
