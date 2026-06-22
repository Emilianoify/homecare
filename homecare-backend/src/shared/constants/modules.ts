export const MODULES = {
  DASHBOARD:       'dashboard',
  PATIENTS:        'patients',
  INTERNMENTS:     'internments',
  PROFESSIONALS:   'professionals',
  HEALTH_INSURERS: 'health_insurers',
  SUPPLIES:        'supplies',
  BUDGETS:         'budgets',
  BILLING:         'billing',
  SETTLEMENTS:     'settlements',
  CLINICAL_NOTES:  'clinical_notes',
  QUALITY:         'quality',
  BRANCHES:        'branches',
  REPORTS:         'reports',
  USERS:           'users',
} as const

export const ACTIONS = {
  READ:   'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const

export type Module = typeof MODULES[keyof typeof MODULES]
export type Action = typeof ACTIONS[keyof typeof ACTIONS]
