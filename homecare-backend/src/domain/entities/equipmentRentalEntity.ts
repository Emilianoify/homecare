export interface EquipmentRentalEntity {
  id:              string
  internmentId:    string
  equipmentId:     string
  authorizationId: string | null
  budgetId:        string | null
  monthlyRate:     number
  startDate:       Date
  endDate:         Date | null
  closedReason:    string | null
  billedToInsurer: boolean
  createdAt:       Date
}
