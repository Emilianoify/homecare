import type { Request, Response } from 'express'
import { PatientContactRepository } from '../../../infrastructure/database/repositories/patientContactRepository.js'
import { PatientRepository } from '../../../infrastructure/database/repositories/patientRepository.js'
import { CreatePatientContactUseCase } from '../../../application/useCases/patientContact/createPatientContactUseCase.js'
import { ListPatientContactsUseCase } from '../../../application/useCases/patientContact/listPatientContactsUseCase.js'
import { UpdatePatientContactUseCase } from '../../../application/useCases/patientContact/updatePatientContactUseCase.js'
import { DeletePatientContactUseCase } from '../../../application/useCases/patientContact/deletePatientContactUseCase.js'
import { sendOk, sendCreated, sendNoContent } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreatePatientContactDto, UpdatePatientContactDto } from '../schemas/patientContactSchema.js'

export class PatientContactController {
  private readonly contactRepo = new PatientContactRepository()
  private readonly patientRepo = new PatientRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await new ListPatientContactsUseCase(this.contactRepo, this.patientRepo)
      .execute(req.params['patientId'] as string, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.PATIENT_CONTACT.LIST, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreatePatientContactUseCase(this.contactRepo, this.patientRepo)
      .execute(req.params['patientId'] as string, req.body as CreatePatientContactDto, req.user!.companyId)
    sendCreated(res, SUCCESS_MESSAGES.PATIENT_CONTACT.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdatePatientContactUseCase(this.contactRepo, this.patientRepo)
      .execute(
        req.params['patientId'] as string,
        req.params['contactId'] as string,
        req.body as UpdatePatientContactDto,
        req.user!.companyId
      )
    sendOk(res, SUCCESS_MESSAGES.PATIENT_CONTACT.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeletePatientContactUseCase(this.contactRepo, this.patientRepo)
      .execute(req.params['patientId'] as string, req.params['contactId'] as string, req.user!.companyId)
    sendNoContent(res)
  }
}
