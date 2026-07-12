import { Router } from 'express'
import { EquipmentRentalController } from '../controllers/equipmentRentalController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requirePermission } from '../middlewares/rbacMiddleware.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validateMiddleware.js'
import { auditMutations } from '../middlewares/auditMiddleware.js'
import {
  createEquipmentRentalSchema,
  closeEquipmentRentalSchema,
  equipmentRentalParamsSchema,
  internmentParamsSchema,
  equipmentRentalQuerySchema,
} from '../schemas/equipmentRentalSchema.js'
import { MODULES, ACTIONS } from '../../../shared/constants/modules.js'

// Montado en /api/internments/:internmentId/equipment-rentals
const router = Router({ mergeParams: true })
const ctrl   = new EquipmentRentalController()
const M      = MODULES.EQUIPMENT

router.get  ('/',              authenticate, requirePermission(M, ACTIONS.READ),   validateParams(internmentParamsSchema),       validateQuery(equipmentRentalQuerySchema),                                   ctrl.list)
router.get  ('/:rentalId',     authenticate, requirePermission(M, ACTIONS.READ),   validateParams(equipmentRentalParamsSchema),                                                                               ctrl.getById)
router.post ('/',              authenticate, requirePermission(M, ACTIONS.CREATE),  auditMutations, validateParams(internmentParamsSchema),       validateBody(createEquipmentRentalSchema),                  ctrl.create)
router.patch('/:rentalId/close', authenticate, requirePermission(M, ACTIONS.UPDATE), auditMutations, validateParams(equipmentRentalParamsSchema), validateBody(closeEquipmentRentalSchema),                   ctrl.close)

export { router as equipmentRentalRouter }
