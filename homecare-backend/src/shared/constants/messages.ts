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
  PATIENT_CONTACT: {
    NOT_FOUND: 'Contacto no encontrado',
  },
  FUNCTIONAL_STATUS: {
    NOT_FOUND:            'Estado funcional no encontrado',
    INTERNMENT_NOT_FOUND: 'La internación no pertenece a este paciente',
  },
  BRANCH: {
    NOT_FOUND: 'Sucursal no encontrada',
  },
  USER: {
    NOT_FOUND:       'Usuario no encontrado',
    EMAIL_EXISTS:    'El email ya está registrado',
    CANNOT_DELETE_SELF: 'No podés eliminar tu propio usuario',
    INVALID_PASSWORD: 'La contraseña actual es incorrecta',
  },
  ROLE: {
    NOT_FOUND: 'Rol no encontrado',
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
  SERVICE_ITEM: {
    NOT_FOUND:   'Prestación no encontrada',
    CODE_EXISTS: 'El código de prestación ya existe',
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
  PATIENT_CONTACT: {
    CREATED: 'Contacto creado exitosamente',
    FOUND:   'Contacto obtenido exitosamente',
    LIST:    'Contactos obtenidos exitosamente',
    UPDATED: 'Contacto actualizado exitosamente',
    DELETED: 'Contacto eliminado exitosamente',
  },
  FUNCTIONAL_STATUS: {
    CREATED: 'Estado funcional registrado exitosamente',
    LIST:    'Estados funcionales obtenidos exitosamente',
    LATEST:  'Último estado funcional obtenido exitosamente',
  },
  BRANCH: {
    CREATED: 'Sucursal creada exitosamente',
    FOUND:   'Sucursal obtenida exitosamente',
    LIST:    'Sucursales obtenidas exitosamente',
    UPDATED: 'Sucursal actualizada exitosamente',
    DELETED: 'Sucursal eliminada exitosamente',
  },
  USER: {
    CREATED:          'Usuario creado exitosamente',
    FOUND:            'Usuario obtenido exitosamente',
    LIST:             'Usuarios obtenidos exitosamente',
    UPDATED:          'Usuario actualizado exitosamente',
    DELETED:          'Usuario eliminado exitosamente',
    PASSWORD_CHANGED: 'Contraseña actualizada exitosamente',
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
    DELETED:    'Internación eliminada exitosamente',
  },
  HEALTH_INSURER: {
    CREATED: 'Obra social creada exitosamente',
    FOUND:   'Obra social obtenida exitosamente',
    LIST:    'Obras sociales obtenidas exitosamente',
    UPDATED: 'Obra social actualizada exitosamente',
    DELETED: 'Obra social eliminada exitosamente',
  },
  SERVICE_ITEM: {
    CREATED: 'Prestación creada exitosamente',
    FOUND:   'Prestación obtenida exitosamente',
    LIST:    'Prestaciones obtenidas exitosamente',
    UPDATED: 'Prestación actualizada exitosamente',
    DELETED: 'Prestación eliminada exitosamente',
  },
} as const
