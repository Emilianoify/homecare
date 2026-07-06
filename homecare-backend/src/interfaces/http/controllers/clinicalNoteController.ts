import type { Request, Response } from 'express'
import { ClinicalNoteRepository } from '../../../infrastructure/database/repositories/clinicalNoteRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { CreateClinicalNoteUseCase } from '../../../application/useCases/clinicalNote/createClinicalNoteUseCase.js'
import { GetClinicalNoteUseCase } from '../../../application/useCases/clinicalNote/getClinicalNoteUseCase.js'
import { ListClinicalNotesUseCase } from '../../../application/useCases/clinicalNote/listClinicalNotesUseCase.js'
import { SignClinicalNoteUseCase } from '../../../application/useCases/clinicalNote/signClinicalNoteUseCase.js'
import { sendOk, sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateClinicalNoteDto } from '../schemas/clinicalNoteSchema.js'

export class ClinicalNoteController {
  private readonly noteRepo        = new ClinicalNoteRepository()
  private readonly internmentRepo  = new InternmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await new ListClinicalNotesUseCase(this.noteRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.CLINICAL_NOTE.LIST, result)
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetClinicalNoteUseCase(this.noteRepo)
      .execute(req.params['noteId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.CLINICAL_NOTE.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateClinicalNoteUseCase(this.noteRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.body as CreateClinicalNoteDto,
        req.user!.userId
      )
    sendCreated(res, SUCCESS_MESSAGES.CLINICAL_NOTE.CREATED, result)
  }

  sign = async (req: Request, res: Response): Promise<void> => {
    const result = await new SignClinicalNoteUseCase(this.noteRepo)
      .execute(req.params['noteId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.CLINICAL_NOTE.SIGNED, result)
  }
}
