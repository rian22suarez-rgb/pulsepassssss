import { z } from 'zod';

// --- ENUMS ---
export const EventCategorySchema = z.enum([
    'MUSIC', 'SPORTS', 'TECHNOLOGY', 'EDUCATION', 'CULTURE', 'ENTERTAINMENT'
]);
export type EventCategory = z.infer<typeof EventCategorySchema>;

export const EventStatusSchema = z.enum([
    'DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'
]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const TicketTypeSchema = z.enum([
    'GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'
]);
export type TicketType = z.infer<typeof TicketTypeSchema>;

export const TicketStatusSchema = z.enum([
    'RESERVED', 'PAID', 'CANCELLED', 'USED'
]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

// --- CONTRATO DE ERRORES ---
export const ErrorResponseSchema = z.object({
    timestamp: z.string(),
    status: z.number(),
    error: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.string()).optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// --- DTOs de Respuesta ---
export const VenueResponseSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    city: z.string(),
    capacity: z.number(),
    active: z.boolean(),
});
export type VenueResponse = z.infer<typeof VenueResponseSchema>;

export const ArtistResponseSchema = z.object({
    id: z.number(),
    stageName: z.string(),
    genre: z.string(),
    active: z.boolean(),
});
export type ArtistResponse = z.infer<typeof ArtistResponseSchema>;

export const EventSummaryResponseSchema = z.object({
    eventCode: z.string(),
    name: z.string(),
    eventDate: z.string(),
    category: EventCategorySchema,
    status: EventStatusSchema,
});
export type EventSummaryResponse = z.infer<typeof EventSummaryResponseSchema>;

export const EventResponseSchema = EventSummaryResponseSchema.extend({
    description: z.string(),
    minimumAge: z.number(),
    venue: VenueResponseSchema,
    artists: z.array(ArtistResponseSchema),
});
export type EventResponse = z.infer<typeof EventResponseSchema>;

export const UserResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
    active: z.boolean(),
    roles: z.array(z.string()),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

export const TicketResponseSchema = z.object({
    ticketCode: z.string(),
    eventCode: z.string(),
    userEmail: z.string().email(),
    type: TicketTypeSchema,
    status: TicketStatusSchema,
    price: z.number(),
    purchaseDate: z.string(),
});
export type TicketResponse = z.infer<typeof TicketResponseSchema>;

// --- DTOs de Petición (Auth) ---
export const LoginRequestSchema = z.object({
    identifier: z.string(),
    password: z.string(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    tokenType: z.string(),
    expiresIn: z.number(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const AuthenticatedUserResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()),
});
export type AuthenticatedUserResponse = z.infer<typeof AuthenticatedUserResponseSchema>;