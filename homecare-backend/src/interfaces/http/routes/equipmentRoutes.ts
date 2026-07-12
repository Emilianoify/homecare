import { Router } from 'express'
import { EquipmentController } from '../controllers/equipmentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentParamsSchema,
  equipmentQuerySchema,
} from '../schemas/equipmentSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

const router = Router()
const ctrl   = new EquipmentController()
const M      = MODULES.EQUIPMENT

router.get   ('/',                       authenticate, requirePermission(M, ACTIONS.READ),   validateQuery(equipmentQuerySchema),                                                              ctrl.list)
router.get   ('/:id',                    authenticate, requirePermission(M, ACTIONS.READ),   validateParams(equipmentParamsSchema),                                                            ctrl.getById)
router.post  ('/',                       authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateBody(createEquipmentSchema),                                              ctrl.create)
router.put   ('/:id',                    authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(equipmentParamsSchema), validateBody(updateEquipmentSchema),       ctrl.update)
router.patch ('/:id/request-maintenance',authenticate, requirePermission(M, ACTIONS.UPDATE),  auditMutations, validateParams(equipmentParamsSchema),                                            ctrl.requestMaintenance)
router.delete('/:id',                    authenticate, requirePermission(M, ACTIONS.DELETE),  auditMutations, validateParams(equipmentParamsSchema),                                            ctrl.delete)

export { router as equipmentRouter }
