import { describe, expect, it, vi, afterEach } from 'vitest'
import { z } from 'zod'
import { ApiError, configurarHttp, peticion, tipoDesdeStatus } from '../lib/http'
import { mensajeDeError, debeReintentar } from '../lib/errores'
import { AuthResponseSchema, EventSchema, EventSummarySchema, TicketSchema, UsuarioAutenticadoSchema } from '../lib/esquemas'
import { RUTAS } from '../lib/rutas'
import { selloFecha, formatearCOP } from '../lib/formato'
import { simularFetch } from './utilidades'

afterEach(() => {
  vi.unstubAllGlobals()
  configurarHttp({ obtenerToken: () => null, alNoAutorizado: () => {} })
})

describe('lib/http', () => {
  it('envía el token solo en Authorization Bearer y nunca en la URL', async () => {
    const llamadas = simularFetch({ 'GET /api/x': [200, { ok: true }] })
    configurarHttp({ obtenerToken: () => 'secreto', alNoAutorizado: () => {} })
    await peticion('/api/x', z.object({ ok: z.boolean() }))
    expect(llamadas[0]!.auth).toBe('Bearer secreto')
    expect(llamadas[0]!.url).not.toContain('secreto')
  })

  it('convierte ErrorResponse en ApiError tipado con details', async () => {
    simularFetch({ 'POST /api/users': [400, { status: 400, error: 'Bad Request', message: 'Validation failed', details: { email: 'inválido' } }] })
    const e = await peticion('/api/users', z.unknown(), { metodo: 'POST', cuerpo: {} }).catch((x: unknown) => x)
    expect(e).toBeInstanceOf(ApiError)
    expect((e as ApiError).tipo).toBe('validacion')
    expect((e as ApiError).details).toEqual({ email: 'inválido' })
  })

  it('un 401 con sesión activa avisa para cerrar la sesión', async () => {
    simularFetch({ 'GET /api/tickets/user/a': [401, null] })
    const alNoAutorizado = vi.fn()
    configurarHttp({ obtenerToken: () => 'tok', alNoAutorizado })
    await expect(peticion('/api/tickets/user/a', z.unknown())).rejects.toBeInstanceOf(ApiError)
    expect(alNoAutorizado).toHaveBeenCalledOnce()
  })

  it('error de red → ApiError tipo red', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))
    const e = (await peticion('/api/x', z.unknown()).catch((x: unknown) => x)) as ApiError
    expect(e.tipo).toBe('red')
  })

  it('respuesta que no cumple el contrato zod → error de contrato', async () => {
    simularFetch({ 'GET /api/x': [200, { inesperado: 1 }] })
    const e = (await peticion('/api/x', z.object({ id: z.number() })).catch((x: unknown) => x)) as ApiError
    expect(e.tipo).toBe('contrato')
  })

  it.each([[400, 'validacion'], [401, 'no-autenticado'], [403, 'prohibido'], [404, 'no-encontrado'], [409, 'conflicto'], [500, 'servidor']] as const)(
    'status %i → %s',
    (s, t) => expect(tipoDesdeStatus(s)).toBe(t),
  )
})

describe('lib/errores', () => {
  it('login 401 da un mensaje genérico', () => {
    expect(mensajeDeError(new ApiError(401, 'no-autenticado', ''), 'login')).toBe('Credenciales inválidas.')
  })
  it('409 muestra el mensaje de la regla de negocio del backend', () => {
    expect(mensajeDeError(new ApiError(409, 'conflicto', 'Edad mínima 18'))).toBe('Edad mínima 18')
  })
  it('500 no filtra detalles internos', () => {
    expect(mensajeDeError(new ApiError(500, 'servidor', 'NullPointerException en X'))).not.toContain('NullPointer')
  })
  it('no reintenta errores 4xx', () => {
    expect(debeReintentar(0, new ApiError(404, 'no-encontrado', ''))).toBe(false)
    expect(debeReintentar(0, new ApiError(0, 'red', ''))).toBe(true)
  })
})

describe('lib/esquemas', () => {
  it('normaliza roles ROLE_ADMIN → ADMIN y descarta desconocidos', () => {
    const u = UsuarioAutenticadoSchema.parse({ username: 'a', email: 'a@a.co', roles: ['ROLE_ADMIN', 'USER', 'OTRO'] })
    expect(u.roles).toEqual(['ADMIN', 'USER'])
  })
  it('AuthResponse acepta accessToken o token', () => {
    expect(AuthResponseSchema.parse({ accessToken: 'x', expiresIn: 900 })).toEqual({ token: 'x', expiresIn: 900 })
    expect(AuthResponseSchema.parse({ token: 'y' }).token).toBe('y')
    expect(AuthResponseSchema.safeParse({ tokenType: 'Bearer' }).success).toBe(false)
  })
  it('acepta las respuestas reales del backend (capturadas de la API local)', () => {
    expect(EventSummarySchema.safeParse({ eventCode: 'E2E-2026', name: 'Evento E2E', status: 'PUBLISHED', eventDate: '2026-12-01T20:00:00', venueName: 'Estadio E2E' }).success).toBe(true)
    expect(
      EventSchema.safeParse({ id: 1, eventCode: 'E2E-2026', name: 'Evento E2E', description: 'Test', category: 'MUSIC', status: 'PUBLISHED', eventDate: '2026-12-01T20:00:00', minimumAge: 18, streamingUrl: null, venueCode: 'VEN-E2E-01', venueName: 'Estadio E2E', artists: [] }).success,
    ).toBe(true)
  })
  it('TicketResponse acepta price BigDecimal como string', () => {
    const t = TicketSchema.parse({ ticketCode: 'T1', type: 'VIP', price: '350000.00', status: 'PAID' })
    expect(t.price).toBe(350000)
  })
})

describe('lib/rutas y formato', () => {
  it('codifica los parámetros de ruta', () => {
    expect(RUTAS.evento('A B/C')).toBe('/eventos/A%20B%2FC')
  })
  it('sello de fecha sin preposición', () => {
    expect(selloFecha('2026-12-12T20:00:00')).toEqual({ dia: '12', mes: 'DIC' })
  })
  it('formatea pesos colombianos', () => {
    expect(formatearCOP(350000).replace(/\s/g, ' ')).toMatch(/350\.000/)
  })
})
