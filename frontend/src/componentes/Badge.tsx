import clsx from 'clsx'
import type { EventStatus, TicketStatus } from '../lib/esquemas'
import { NOMBRE_ESTADO_EVENTO, NOMBRE_ESTADO_TICKET } from '../lib/formato'

/*
  Badges de estado con mapa tipado (PRD §9.1, FE-008). Colores de la paleta Techvora;
  todos con texto tinta sobre fondo claro (contraste AA).
*/
export type Tono = 'lima' | 'rosa' | 'naranja' | 'mostaza' | 'coral' | 'gris' | 'tinta' | 'azul' | 'cielo'

const TONOS: Record<Tono, string> = {
  lima: 'bg-lima-400 text-tinta',
  rosa: 'bg-rosa-300 text-tinta',
  naranja: 'bg-naranja-400 text-tinta',
  mostaza: 'bg-mostaza-400 text-tinta',
  coral: 'bg-coral-400 text-tinta',
  gris: 'bg-[#e4e4ea] text-tinta',
  tinta: 'bg-tinta text-white dark:bg-white dark:text-tinta',
  azul: 'bg-azul-600 text-white',
  cielo: 'bg-[#cfe0ff] text-tinta',
}

export const TONO_ESTADO_EVENTO: Record<EventStatus, Tono> = {
  DRAFT: 'gris',
  PUBLISHED: 'lima',
  SOLD_OUT: 'mostaza',
  CANCELLED: 'coral',
  FINISHED: 'tinta',
}

export const TONO_ESTADO_TICKET: Record<TicketStatus, Tono> = {
  RESERVED: 'cielo',
  PAID: 'lima',
  USED: 'gris',
  CANCELLED: 'coral',
}

export function Badge({ tono, children, className }: { tono: Tono; children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ring-tinta/15 font-mono text-[11px] font-medium uppercase tracking-wider', TONOS[tono], className)}>
      {children}
    </span>
  )
}

export function BadgeEstadoEvento({ estado }: { estado: EventStatus }) {
  return <Badge tono={TONO_ESTADO_EVENTO[estado]}>{NOMBRE_ESTADO_EVENTO[estado]}</Badge>
}

export function BadgeEstadoTicket({ estado }: { estado: TicketStatus }) {
  return <Badge tono={TONO_ESTADO_TICKET[estado]}>{NOMBRE_ESTADO_TICKET[estado]}</Badge>
}
