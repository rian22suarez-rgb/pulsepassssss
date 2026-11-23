import type { EventCategory, EventStatus, TicketStatus, TicketType } from './esquemas'

const fechaLarga = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const hora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' })
const diaMes = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' })
const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

function aFecha(iso: string): Date | null {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = aFecha(iso)
  return d ? fechaLarga.format(d) : iso
}

export function formatearFechaHora(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = aFecha(iso)
  return d ? `${fechaLarga.format(d)} · ${hora.format(d)}` : iso
}

/** Partes para el sello de fecha (día grande + mes) de las tarjetas. */
export function selloFecha(iso: string): { dia: string; mes: string } {
  const d = aFecha(iso)
  if (!d) return { dia: '--', mes: '' }
  // formatToParts evita depender del orden/preposición ("12 de dic") de cada locale.
  const partes = diaMes.formatToParts(d)
  const dia = partes.find((p) => p.type === 'day')?.value ?? ''
  const mes = (partes.find((p) => p.type === 'month')?.value ?? '').replace('.', '')
  return { dia, mes: mes.toUpperCase() }
}

export function formatearCOP(valor: number): string {
  return cop.format(valor)
}

export const NOMBRE_CATEGORIA: Record<EventCategory, string> = {
  MUSIC: 'Música',
  SPORTS: 'Deportes',
  TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación',
  CULTURE: 'Cultura',
  ENTERTAINMENT: 'Entretenimiento',
}

export const NOMBRE_ESTADO_EVENTO: Record<EventStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
}

export const NOMBRE_ESTADO_TICKET: Record<TicketStatus, string> = {
  RESERVED: 'Reservado',
  PAID: 'Pagado',
  CANCELLED: 'Cancelado',
  USED: 'Usado',
}

export const NOMBRE_TIPO_TICKET: Record<TicketType, string> = {
  GENERAL: 'General',
  VIP: 'VIP',
  BACKSTAGE: 'Backstage',
  STUDENT: 'Estudiante',
}

export const DESCRIPCION_TIPO_TICKET: Record<TicketType, string> = {
  GENERAL: 'Acceso estándar al evento.',
  VIP: 'Zona preferencial y mejor ubicación.',
  BACKSTAGE: 'Acceso tras bambalinas.',
  STUDENT: 'Tarifa para estudiantes acreditados.',
}
