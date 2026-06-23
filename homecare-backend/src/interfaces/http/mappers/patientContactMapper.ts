import type { PatientContactEntity } from '../../../domain/entities/patientContactEntity.js'
import type { PatientContactResponseDto } from '../dtos/patientContactDto.js'

export class PatientContactMapper {
  static toDto(contact: PatientContactEntity): PatientContactResponseDto {
    return {
      id:                 contact.id,
      patientId:          contact.patientId,
      name:               contact.name,
      relationship:       contact.relationship,
      phone:              contact.phone,
      phoneAlternative:   contact.phoneAlternative,
      email:              contact.email,
      livesAtCareAddress: contact.livesAtCareAddress,
      availabilityHours:  contact.availabilityHours,
      isPrimary:          contact.isPrimary,
      createdAt:          contact.createdAt.toISOString(),
    }
  }
}
