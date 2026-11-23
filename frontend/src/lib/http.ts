import type { ZodType } from 'zod'
import { ErrorResponseSchema } from './esquemas'

/*
  Cliente HTTP único (PRD §5): fetch + Bearer + ErrorResponse → ApiError + validación zod.
  - El token se inyecta solo en el encabezado Authorization (FE-013), nunca en la URL ni en consola.
  - Un 401 con sesión activa avisa al AuthContext para cerrar la sesión local (GAP-08).
*/

export type TipoError = 'red' | 'validacion' | 'no-autenticado' | 'prohibido' | 'no-encontrado' | 'conflicto' | 'servidor' | 'contrato'

export class ApiError extends Error {
  readonly status: number
  readonly tipo: TipoError
  readonly details: Record<string, string>

  constructor(status: number, tipo: TipoError, message: string, details: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.tipo = tipo
    this.details = details
  }
}

export function tipoDesdeStatus(status: number): TipoError {
  if (status === 400) return 'validacion'
  if (status === 401) return 'no-autenticado'
  if (status === 403) return 'prohibido'
  if (status === 404) return 'no-encontrado'
  if (status === 409) return 'conflicto'
  return 'servidor'
}

// Inyección desde AuthContext (evita dependencia circular y mantiene http.ts sin React).
let obtenerToken: () => string | null = () => null
let alNoAutorizado: () => void = () => {}

export function configurarHttp(opciones: { obtenerToken: () => string | null; alNoAutorizado: () => void }) {
  obtenerToken = opciones.obtenerToken
  alNoAutorizado = opciones.alNoAutorizado
}

const BASE = import.meta.env.VITE_API_BASE ?? ''

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  cuerpo?: unknown
  /** Si es true no se envía el token (login/registro). */
  publico?: boolean
  signal?: AbortSignal
}

async function leerCuerpo(res: Response): Promise<unknown> {
  const texto = await res.text()
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

export async function peticion<T>(ruta: string, esquema: ZodType<T>, opciones: OpcionesPeticion = {}): Promise<T> {
  const encabezados: Record<string, string> = { Accept: 'application/json' }
  if (opciones.cuerpo !== undefined) encabezados['Content-Type'] = 'application/json'
  const token = opciones.publico ? null : obtenerToken()
  if (token) encabezados.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE}${ruta}`, {
      method: opciones.metodo ?? 'GET',
      headers: encabezados,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
      signal: opciones.signal,
    })
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, 'red', 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
  }

  const cuerpo = await leerCuerpo(res)

  if (!res.ok) {
    if (res.status === 401 && token) alNoAutorizado()
    const error = ErrorResponseSchema.safeParse(cuerpo)
    const mensaje = error.success && error.data.message ? error.data.message : ''
    const details = error.success && error.data.details ? error.data.details : {}
    throw new ApiError(res.status, tipoDesdeStatus(res.status), mensaje, details)
  }

  const validado = esquema.safeParse(cuerpo)
  if (!validado.success) {
    if (import.meta.env.DEV) console.warn(`Respuesta de ${ruta} no cumple el contrato`, validado.error.issues)
    throw new ApiError(res.status, 'contrato', 'La respuesta del servidor no tiene el formato esperado.')
  }
  return validado.data
}
