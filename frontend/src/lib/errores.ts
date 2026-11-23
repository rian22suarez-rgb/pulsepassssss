import { ApiError } from './http'

/*
  Mapeo uniforme de errores a mensajes de interfaz (PRD objetivo 2.3).
  - 409: el mensaje del backend expresa la regla de negocio (edad mínima, capacidad...) y se muestra tal cual.
  - 401 en login: mensaje genérico, sin revelar si el usuario existe (FR-FE-AUTH-003).
  - 500: nunca se muestran detalles internos.
*/
export function mensajeDeError(error: unknown, contexto?: 'login'): string {
  if (!(error instanceof ApiError)) return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
  switch (error.tipo) {
    case 'red':
      return error.message
    case 'validacion':
      return Object.keys(error.details).length > 0
        ? 'Revisa los campos marcados.'
        : error.message || 'La solicitud no es válida.'
    case 'no-autenticado':
      return contexto === 'login' ? 'Credenciales inválidas.' : 'Tu sesión expiró. Inicia sesión de nuevo.'
    case 'prohibido':
      return 'No tienes permisos para realizar esta acción.'
    case 'no-encontrado':
      return 'No encontramos lo que buscas.'
    case 'conflicto':
      return error.message || 'La operación no se pudo completar por una regla del sistema.'
    case 'contrato':
      return error.message
    default:
      return 'El servidor tuvo un problema. Inténtalo más tarde.'
  }
}

/** Errores del servidor que no se deben reintentar automáticamente (PRD §14.3). */
export function debeReintentar(conteo: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return conteo < 1
}
