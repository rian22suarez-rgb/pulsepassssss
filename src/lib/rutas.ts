export const RUTAS = {
    inicio: '/',
    catalogo: '/eventos',
    detalleEvento: (eventCode: string) => `/eventos/${eventCode}`,
    artistas: '/artistas',
    detalleArtista: (id: string | number) => `/artistas/${id}`,
    sedes: '/sedes',
    detalleSede: (code: string) => `/sedes/${code}`,

    login: '/login',
    registro: '/registro',
    cuenta: '/mi-cuenta',

    misTickets: '/mis-tickets',
    detalleTicket: (ticketCode: string) => `/mis-tickets/${ticketCode}`,

    staffIngreso: '/staff/validar',
    staffEventoTickets: (eventCode: string) => `/staff/eventos/${eventCode}/tickets`,
    adminCrearEvento: '/admin/eventos/crear',

    noAutorizado: '/403',
    noEncontrado: '/404',
} as const;