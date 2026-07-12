import { Router } from 'express'
import { authRouter } from './authRoutes.js'
import { patientRouter } from './patientRoutes.js'
import { patientContactRouter } from './patientContactRoutes.js'
import { functionalStatusRouter } from './functionalStatusRoutes.js'
import { professionalRouter } from './professionalRoutes.js'
import { internmentRouter } from './internmentRoutes.js'
import { branchRouter } from './branchRoutes.js'
import { userRouter } from './userRoutes.js'
import { healthInsurerRouter } from './healthInsurerRoutes.js'
import { serviceItemRouter } from './serviceItemRoutes.js'
import { insurerRateRouter } from './insurerRateRoutes.js'
import { clinicalNoteRouter } from './clinicalNoteRoutes.js'
import { diagnosisRouter } from './diagnosisRoutes.js'
import { medicationRouter } from './medicationRoutes.js'
import { authorizationRouter } from './authorizationRoutes.js'
import { carePlanRouter } from './carePlanRoutes.js'
import { visitRouter } from './visitRoutes.js'
import { attachmentRouter } from './attachmentRoutes.js'
import { incidentRouter } from './incidentRoutes.js'
import { alertConfigRouter } from './alertConfigRoutes.js'
import { equipmentRouter } from './equipmentRoutes.js'
import { equipmentRentalRouter } from './equipmentRentalRoutes.js'
import { supplyRouter } from './supplyRoutes.js'
import { insurerSupplyRateRouter } from './insurerSupplyRateRoutes.js'
import { supplyOrderRouter } from './supplyOrderRoutes.js'
import { branchStockRouter } from './branchStockRoutes.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/patients', patientRouter)
router.use('/patients/:patientId/contacts', patientContactRouter)
router.use('/patients/:patientId/functional-status', functionalStatusRouter)
router.use('/professionals', professionalRouter)
router.use('/internments', internmentRouter)
router.use('/branches', branchRouter)
router.use('/users', userRouter)
router.use('/health-insurers', healthInsurerRouter)
router.use('/health-insurers/:healthInsurerId/rates', insurerRateRouter)
router.use('/service-items', serviceItemRouter)
router.use('/internments/:internmentId/clinical-notes', clinicalNoteRouter)
router.use('/internments/:internmentId/diagnoses', diagnosisRouter)
router.use('/internments/:internmentId/medications', medicationRouter)
router.use('/internments/:internmentId/authorizations', authorizationRouter)
router.use('/internments/:internmentId/care-plans', carePlanRouter)
router.use('/internments/:internmentId/visits', visitRouter)
router.use('/internments/:internmentId/attachments', attachmentRouter)
router.use('/internments/:internmentId/incidents', incidentRouter)
router.use('/internments/:internmentId/equipment-rentals', equipmentRentalRouter)
router.use('/internments/:internmentId/supply-orders', supplyOrderRouter)
router.use('/supplies', supplyRouter)
router.use('/health-insurers/:healthInsurerId/supply-rates', insurerSupplyRateRouter)
router.use('/alert-configs', alertConfigRouter)
router.use('/equipment', equipmentRouter)
router.use('/branch-stock', branchStockRouter)

export { router as apiRouter }
