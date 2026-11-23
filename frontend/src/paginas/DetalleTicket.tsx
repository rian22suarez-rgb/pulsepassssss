import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useTicket } from '../api/consultas'
import { Boton, BotonEnlace } from '../componentes/Boton'
import { Cargando, EstadoError } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { ModalCancelar } from '../componentes/ModalCancelar'
import { TicketVisual } from '../componentes/TicketVisual'
import { Etiqueta } from '../componentes/Tipografia'
import { ApiError } from '../lib/http'
import { formatearFechaHora, NOMBRE_ESTADO_TICKET, NOMBRE_TIPO_TICKET } from '../lib/formato'
import { formatearCOP } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'
import SinPermisos from './SinPermisos'

/** Detalle de ticket (FR-FE-TKT-004): ticket ajeno → 403/404 del backend → pantalla correspondiente. */
export default function DetalleTicket() {
  const { ticketCode } = useParams()
  const ticket = useTicket(ticketCode)
  const [cancelando, setCancelando] = useState(false)

  if (ticket.isPending) return <Cargando etiqueta="Cargando ticket" />
  if (ticket.isError) {
    if (ticket.error instanceof ApiError && ticket.error.status === 403) return <SinPermisos />
    if (ticket.error instanceof ApiError && ticket.error.status === 404) return <NoEncontrada titulo="Ticket no encontrado" />
    return <Pagina><EstadoError error={ticket.error} onReintentar={() => void ticket.refetch()} /></Pagina>
  }
  const t = ticket.data
  return (
    <Pagina className="max-w-3xl">
      <Link to={RUTAS.misTickets} className="font-mono text-xs tracking-widest uppercase opacity-70 hover:opacity-100">← Mis tickets</Link>
      <h1 className="mt-4 mb-8 text-5xl sm:text-6xl">Tu entrada</h1>
      <TicketVisual ticket={t} />
      <dl className="mt-8 grid gap-px overflow-hidden rounded-tarjeta border border-tinta/10 bg-tinta/10 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
        {[
          ['Código', t.ticketCode],
          ['Estado', NOMBRE_ESTADO_TICKET[t.status]],
          ['Tipo', NOMBRE_TIPO_TICKET[t.type]],
          ['Precio', formatearCOP(t.price)],
          ['Fecha de compra', formatearFechaHora(t.purchaseDate)],
          ['Titular', t.userEmail ?? '—'],
        ].map(([k, v]) => (
          <div key={k} className="bg-white p-5 dark:bg-[#15151f]">
            <dt><Etiqueta className="opacity-60">{k}</Etiqueta></dt>
            <dd className="mt-1 font-semibold break-all">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        {t.eventCode && <BotonEnlace to={RUTAS.evento(t.eventCode)} variante="secundario">Ver evento</BotonEnlace>}
        {t.status === 'PAID' && <Boton variante="peligro" onClick={() => setCancelando(true)}>Cancelar entrada</Boton>}
      </div>
      <ModalCancelar ticket={cancelando ? t : null} onCerrar={() => setCancelando(false)} />
    </Pagina>
  )
}
