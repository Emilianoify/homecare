import { Router } from 'express'
import { authRouter }           from './authRoutes.js'
import { patientRouter }        from './patientRoutes.js'
import { patientContactRouter } from './patientContactRoutes.js'
import { professionalRouter }   from './professionalRoutes.js'
import { internmentRouter }     from './internmentRoutes.js'

const router = Router()

router.use('/auth',                          authRouter)
router.use('/patients',                      patientRouter)
router.use('/patients/:patientId/contacts',  patientContactRouter)
router.use('/professionals',                 professionalRouter)
router.use('/internments',                   internmentRouter)

export { router as apiRouter }
