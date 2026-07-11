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

export { router as apiRouter }
