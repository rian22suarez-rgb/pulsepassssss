import { z } from 'zod'

/*
  Contratos de datos (PRD §10). Los nombres de campo se verificaron contra el backend real:
  - Mappers MapStruct (EventMapper, TicketMapper, UserMapper) y entidades JPA.
  - Colección Postman tests/e2e (cuerpos de LoginRequest, CreateEventRequest, PurchaseTicketRequest).
  Los DTO Java de dto/ no se pudieron leer directamente, así que los campos opcionales usan
  z.looseObject (equivale al .passthrough() que permite el PRD) y .nullish() donde hay duda.
*/

// ── Enumeraciones (Fase 1) ─────────────────────────────────────────────
export const EventCategorySchema = z.enum([
  'MUSIC', 'SPORTS', 'TECHNOLOGY', 'EDUCATION', 'CULTURE', 'ENTERTAINMENT',
])
export const EventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'])
export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])

export type EventCategory = z.infer<typeof EventCategorySchema>
export type EventStatus = z.infer<typeof EventStatusSchema>
export type TicketType = z.infer<typeof TicketTypeSchema>
export type TicketStatus = z.infer<typeof TicketStatusSchema>
export type Rol = z.infer<typeof RolSchema>

// Fechas LocalDateTime / LocalDate llegan como string ISO (Spring Boot + Jackson por defecto).
const FechaSchema = z.string().min(1)

// ── Respuestas (Fase 2/3) ──────────────────────────────────────────────
export const VenueSchema = z.looseObject({
  id: z.number().nullish(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string().nullish(),
  capacity: z.number(),
  active: z.boolean().nullish(),
})
export type Venue = z.infer<typeof VenueSchema>

export const ArtistSchema = z.looseObject({
  id: z.number(),
  stageName: z.string(),
  country: z.string().nullish(),
  genre: z.string().nullish(),
  active: z.boolean().nullish(),
})
export type Artist = z.infer<typeof ArtistSchema>

// Verificado contra el backend real: EventSummaryResponse trae eventCode, name, status, eventDate y venueName.
// NO incluye category, por eso es opcional aquí (si algún día el DTO la agrega, se usa automáticamente).
export const EventSummarySchema = z.looseObject({
  eventCode: z.string(),
  name: z.string(),
  category: EventCategorySchema.nullish(),
  status: EventStatusSchema,
  eventDate: FechaSchema,
  venueName: z.string().nullish(),
  minimumAge: z.number().nullish(),
})
export type EventSummary = z.infer<typeof EventSummarySchema>

export const EventSchema = z.looseObject({
  id: z.number().nullish(),
  eventCode: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: FechaSchema,
  minimumAge: z.number().nullish(),
  streamingUrl: z.string().nullish(),
  venueCode: z.string().nullish(),
  venueName: z.string().nullish(),
  // El mapper copia el Set<Artist> si el DTO lo declara; si no viene, se trata como lista vacía.
  artists: z.array(ArtistSchema).nullish(),
})
export type Evento = z.infer<typeof EventSchema>

export const UserSchema = z.looseObject({
  id: z.number().nullish(),
  username: z.string(),
  email: z.string(),
  active: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  phone: z.string().nullish(),
  city: z.string().nullish(),
  birthDate: z.string().nullish(),
})
export type Usuario = z.infer<typeof UserSchema>

export const TicketSchema = z.looseObject({
  id: z.number().nullish(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  // BigDecimal puede serializarse como número o como string.
  price: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  status: TicketStatusSchema,
  purchaseDate: z.string().nullish(),
  userEmail: z.string().nullish(),
  eventCode: z.string().nullish(),
  eventName: z.string().nullish(),
})
export type Ticket = z.infer<typeof TicketSchema>

export const ErrorResponseSchema = z.looseObject({
  timestamp: z.string().nullish(),
  status: z.number(),
  error: z.string().nullish(),
  message: z.string().nullish(),
  details: z.record(z.string(), z.string()).nullish(),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ── Autenticación (Fase 4) ─────────────────────────────────────────────
// AuthController devuelve new AuthResponse(token, "Bearer", ttlSegundos).
// Se acepta accessToken o token por si el record usa otro nombre de componente.
export const AuthResponseSchema = z
  .looseObject({
    accessToken: z.string().optional(),
    token: z.string().optional(),
    tokenType: z.string().nullish(),
    expiresIn: z.number().nullish(),
  })
  .transform((r, ctx) => {
    const token = r.accessToken ?? r.token
    if (!token) {
      ctx.addIssue({ code: 'custom', message: 'La respuesta de login no trae token' })
      return z.NEVER
    }
    return { token, expiresIn: r.expiresIn ?? 900 }
  })

// Los roles pueden venir como "ADMIN" o "ROLE_ADMIN"; se normalizan.
const RolesSchema = z
  .array(z.string())
  .transform((roles) =>
    roles
      .map((r) => r.replace(/^ROLE_/, ''))
      .filter((r): r is Rol => RolSchema.safeParse(r).success),
  )

export const UsuarioAutenticadoSchema = z.looseObject({
  id: z.number().nullish(),
  username: z.string(),
  email: z.string(),
  roles: RolesSchema,
})
export type UsuarioAutenticado = z.infer<typeof UsuarioAutenticadoSchema>

// ── Solicitudes ────────────────────────────────────────────────────────
export interface LoginRequest {
  identifier: string
  password: string
}

export interface RegisterUserRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  city?: string
  birthDate?: string
  password: string
}

export interface CreateEventRequest {
  eventCode: string
  name: string
  description?: string
  category: EventCategory
  eventDate: string
  minimumAge: number
  venueCode: string
}

export interface PurchaseTicketRequest {
  userEmail: string
  eventCode: string
  type: TicketType
}
