export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    UNAUTHORIZED:        'No autenticado',
    TOKEN_EXPIRED:       'Token inválido o expirado',
    EMAIL_EXISTS:        'El email ya está registrado',
    INVALID_REFRESH:     'Refresh token inválido',
  },
  PATIENT: {
    NOT_FOUND:  'Paciente no encontrado',
    DNI_EXISTS: 'El DNI ya está registrado',
  },
  PROFESSIONAL: {
    NOT_FOUND:   'Profesional no encontrado',
    CUIT_EXISTS: 'El CUIT ya está registrado',
  },
  INTERNMENT: {
    NOT_FOUND:      'Internación no encontrada',
    ALREADY_ACTIVE: 'El paciente ya tiene una internación activa',
  },
  HEALTH_INSURER: {
    NOT_FOUND:   'Obra social no encontrada',
    CUIT_EXISTS: 'El CUIT ya está registrado',
  },
  GENERAL: {
    VALIDATION_ERROR: 'Datos inválidos',
    FORBIDDEN:        'Acceso denegado',
    INTERNAL_ERROR:   'Error interno del servidor',
    NOT_FOUND:        'Recurso no encontrado',
  },
} as const

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN:    'Sesión iniciada correctamente',
    LOGOUT:   'Sesión cerrada correctamente',
    REFRESH:  'Token renovado correctamente',
    REGISTER: 'Usuario creado exitosamente',
    ME:       'Usuario autenticado',
  },
  PATIENT: {
    CREATED: 'Paciente creado exitosamente',
    FOUND:   'Paciente obtenido exitosamente',
    LIST:    'Pacientes obtenidos exitosamente',
    UPDATED: 'Paciente actualizado exitosamente',
    DELETED: 'Paciente eliminado exitosamente',
  },
  PROFESSIONAL: {
    CREATED: 'Profesional creado exitosamente',
    FOUND:   'Profesional obtenido exitosamente',
    LIST:    'Profesionales obtenidos exitosamente',
    UPDATED: 'Profesional actualizado exitosamente',
    DELETED: 'Profesional eliminado exitosamente',
  },
  INTERNMENT: {
    CREATED:    'Internación creada exitosamente',
    FOUND:      'Internación obtenida exitosamente',
    LIST:       'Internaciones obtenidas exitosamente',
    UPDATED:    'Internación actualizada exitosamente',
    DISCHARGED: 'Egreso registrado exitosamente',
  },
  HEALTH_INSURER: {
    CREATED: 'Obra social creada exitosamente',
    FOUND:   'Obra social obtenida exitosamente',
    LIST:    'Obras sociales obtenidas exitosamente',
    UPDATED: 'Obra social actualizada exitosamente',
    DELETED: 'Obra social eliminada exitosamente',
  },
} as const
