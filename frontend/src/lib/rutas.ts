// FE-003: todas las rutas se centralizan aquí; no se escriben strings de ruta sueltos.
const cod = encodeURIComponent

export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  evento: (eventCode: string) => `/eventos/${cod(eventCode)}`,
  artistas: '/artistas',
  artista: (id: number | string) => `/artistas/${cod(String(id))}`,
  sedes: '/sedes',
  sede: (code: string) => `/sedes/${cod(code)}`,
  login: '/login',
  registro: '/registro',
  cuenta: '/cuenta',
  misTickets: '/mis-tickets',
  ticket: (ticketCode: string) => `/mis-tickets/${cod(ticketCode)}`,
  confirmacion: (ticketCode: string) => `/compra/confirmacion/${cod(ticketCode)}`,
  staffValidacion: '/staff/validacion',
  staffTicketsEvento: (eventCode: string) => `/staff/eventos/${cod(eventCode)}/tickets`,
  adminEventos: '/admin/eventos',
  adminCrearEvento: '/admin/eventos/nuevo',
  adminEvento: (eventCode: string) => `/admin/eventos/${cod(eventCode)}`,
  sinPermisos: '/403',
} as const
