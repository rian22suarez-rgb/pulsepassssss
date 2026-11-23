import clsx from 'clsx'
import type { Ticket, TicketType } from '../lib/esquemas'
import { formatearFechaHora, NOMBRE_TIPO_TICKET } from '../lib/formato'
import { BadgeEstadoTicket } from './Badge'
import { PrecioCOP } from './PrecioCOP'
import { Etiqueta } from './Tipografia'

const COLOR_TIPO: Record<TicketType, string> = {
  GENERAL: 'bg-lima-400',
  VIP: 'bg-rosa-300',
  BACKSTAGE: 'bg-naranja-400',
  STUDENT: 'bg-mostaza-400',
}

/** Entrada física dibujada: cuerpo + talón separados por línea perforada (motivo central del estilo). */
export function TicketVisual({ ticket, className }: { ticket: Ticket; className?: string }) {
  const anulado = ticket.status === 'CANCELLED' || ticket.status === 'USED'
  return (
    <div className={clsx('forma-ticket grid overflow-hidden rounded-tarjeta text-tinta sm:grid-cols-[1fr_auto]', COLOR_TIPO[ticket.type], anulado && 'opacity-60 saturate-50', className)}>
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta className="rounded-full bg-tinta px-3 py-1 text-white">{NOMBRE_TIPO_TICKET[ticket.type]}</Etiqueta>
          <BadgeEstadoTicket estado={ticket.status} />
        </div>
        <p className="mt-4 font-titulo text-4xl leading-[0.95] break-words uppercase sm:text-5xl">{ticket.eventName ?? ticket.eventCode}</p>
        <p className="mt-3 text-sm font-medium opacity-80">Comprado: {formatearFechaHora(ticket.purchaseDate)}</p>
      </div>
      <div className="flex flex-row items-center justify-between gap-4 border-t-2 border-dashed border-tinta/30 p-6 sm:flex-col sm:items-end sm:border-t-0 sm:border-l-2 sm:p-7">
        <div className="sm:text-right">
          <Etiqueta className="opacity-70">Código</Etiqueta>
          <p className="font-mono text-sm font-semibold break-all">{ticket.ticketCode}</p>
        </div>
        <PrecioCOP valor={ticket.price} className="font-titulo text-3xl" />
      </div>
    </div>
  )
}
