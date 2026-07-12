export interface EquipmentRentalResponseDto {
  id:              string
  internmentId:    string
  equipmentId:     string
  authorizationId: string | null
  budgetId:        string | null
  monthlyRate:     number
  startDate:       string
  endDate:         string | null
  closedReason:    string | null
  billedToInsurer: boolean
  createdAt:       string
}
