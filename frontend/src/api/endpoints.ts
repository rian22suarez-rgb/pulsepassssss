import { z } from 'zod'
import { peticion } from '../lib/http'
import {
  ArtistSchema, AuthResponseSchema, EventSchema, EventSummarySchema, TicketSchema, UserSchema,
  UsuarioAutenticadoSchema, VenueSchema,
  type CreateEventRequest, type LoginRequest, type PurchaseTicketRequest, type RegisterUserRequest,
} from '../lib/esquemas'

/*
  Capa api (PRD §5): una función por endpoint REAL del backend.
  Rutas adaptadas al código del repositorio, no a los nombres de ejemplo del PRD:
    - Auth:   /api/v1/auth/login, /api/v1/auth/me                (PRD decía /api/auth/...)
    - Tickets del usuario: /api/tickets/user/{email}              (PRD decía /by-user?email=)
    - Tickets pagados:     /api/tickets/event/{code}/paid         (PRD decía /api/events/{code}/tickets/paid)
    - Usuario:             /api/users/{username}                  (PRD decía /by-username)
*/
const e = encodeURIComponent

// ── Sedes (2) ──────────────────────────────────────────────────────────
export const sedesApi = {
  activas: (signal?: AbortSignal) => peticion('/api/venues/active', z.array(VenueSchema), { signal }),
  porCodigo: (code: string, signal?: AbortSignal) => peticion(`/api/venues/${e(code)}`, VenueSchema, { signal }),
}

// ── Artistas (3) ───────────────────────────────────────────────────────
export const artistasApi = {
  activos: (signal?: AbortSignal) => peticion('/api/artists/active', z.array(ArtistSchema), { signal }),
  porId: (id: number, signal?: AbortSignal) => peticion(`/api/artists/${id}`, ArtistSchema, { signal }),
  porNombre: (stageName: string, signal?: AbortSignal) =>
    peticion(`/api/artists/by-stage-name?stageName=${e(stageName)}`, ArtistSchema, { signal }),
}

// ── Eventos (6) ────────────────────────────────────────────────────────
export const eventosApi = {
  publicados: (signal?: AbortSignal) => peticion('/api/events/published', z.array(EventSummarySchema), { signal }),
  porCodigo: (eventCode: string, signal?: AbortSignal) => peticion(`/api/events/${e(eventCode)}`, EventSchema, { signal }),
  porArtista: (stageName: string, signal?: AbortSignal) =>
    peticion(`/api/events/by-artist?stageName=${e(stageName)}`, z.array(EventSummarySchema), { signal }),
  crear: (datos: CreateEventRequest) => peticion('/api/events', EventSchema, { metodo: 'POST', cuerpo: datos }),
  publicar: (eventCode: string) => peticion(`/api/events/${e(eventCode)}/publish`, EventSchema, { metodo: 'PATCH' }),
  asociarArtista: (eventCode: string, artistId: number) =>
    peticion(`/api/events/${e(eventCode)}/artists/${artistId}`, EventSchema, { metodo: 'POST' }),
}

// ── Usuarios (2) ───────────────────────────────────────────────────────
export const usuariosApi = {
  registrar: (datos: RegisterUserRequest) =>
    peticion('/api/users', UserSchema, { metodo: 'POST', cuerpo: datos, publico: true }),
  porUsername: (username: string, signal?: AbortSignal) => peticion(`/api/users/${e(username)}`, UserSchema, { signal }),
}

// ── Tickets (6) ────────────────────────────────────────────────────────
export const ticketsApi = {
  comprar: (datos: PurchaseTicketRequest) => peticion('/api/tickets', TicketSchema, { metodo: 'POST', cuerpo: datos }),
  delUsuario: (email: string, signal?: AbortSignal) =>
    peticion(`/api/tickets/user/${e(email)}`, z.array(TicketSchema), { signal }),
  porCodigo: (ticketCode: string, signal?: AbortSignal) => peticion(`/api/tickets/${e(ticketCode)}`, TicketSchema, { signal }),
  cancelar: (ticketCode: string) => peticion(`/api/tickets/${e(ticketCode)}/cancel`, TicketSchema, { metodo: 'PATCH' }),
  marcarUsado: (ticketCode: string) => peticion(`/api/tickets/${e(ticketCode)}/use`, TicketSchema, { metodo: 'PATCH' }),
  pagadosDeEvento: (eventCode: string, signal?: AbortSignal) =>
    peticion(`/api/tickets/event/${e(eventCode)}/paid`, z.array(TicketSchema), { signal }),
}

// ── Autenticación (Fase 4) ─────────────────────────────────────────────
export const authApi = {
  login: (datos: LoginRequest) =>
    peticion('/api/v1/auth/login', AuthResponseSchema, { metodo: 'POST', cuerpo: datos, publico: true }),
  me: (signal?: AbortSignal) => peticion('/api/v1/auth/me', UsuarioAutenticadoSchema, { signal }),
}
