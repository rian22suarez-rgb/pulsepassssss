import { Link, useParams } from 'react-router'
import { useEvento, useTicketsPagados } from '../api/consultas'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { EstadoError, EstadoVacio, RejillaEsqueletos } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { PrecioCOP } from '../componentes/PrecioCOP'
import { Tabla } from '../componentes/Tabla'
import { EncabezadoSeccion, Etiqueta } from '../componentes/Tipografia'
import type { Ticket } from '../lib/esquemas'
import { formatearFechaHora, NOMBRE_TIPO_TICKET } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import { ApiError } from '../lib/http'

/** Tickets pagados por evento (PRD §9.15, FR-FE-STF-002): GET /api/tickets/event/{code}/paid. */
export default function TicketsPagadosEvento() {
  const { eventCode } = useParams()
  const evento = useEvento(eventCode)
  const tickets = useTicketsPagados(eventCode)

  return (
    <Pagina>
      <Link to={RUTAS.staffValidacion} className="font-mono text-xs tracking-widest uppercase opacity-70 hover:opacity-100">← Validar ingreso</Link>
      <EncabezadoSeccion
        className="mt-4"
        nivel={1}
        etiqueta={`Staff · ${eventCode ?? ''}`}
        titulo={evento.data?.name ?? 'Tickets pagados'}
        descripcion="Entradas pagadas pendientes de ingreso para este evento."
      />
      <div className="mt-10">
        {tickets.isPending ? (
          <RejillaEsqueletos cantidad={1} className="h-64 sm:col-span-3" />
        ) : tickets.isError ? (
          tickets.error instanceof ApiError && tickets.error.status === 404 ? (
            <EstadoVacio mensaje={`No existe un evento con el código «${eventCode}».`} />
          ) : (
            <EstadoError error={tickets.error} onReintentar={() => void tickets.refetch()} />
          )
        ) : tickets.data.length === 0 ? (
          <EstadoVacio mensaje="Este evento no tiene tickets pagados." />
        ) : (
          <>
            <div className="mb-6 inline-flex items-baseline gap-3 rounded-tarjeta bg-lima-400 px-6 py-4 text-tinta">
              <span className="font-titulo text-5xl">{tickets.data.length}</span>
              <Etiqueta>Tickets pagados</Etiqueta>
            </div>
            <Tabla<Ticket>
              titulo="Tickets pagados del evento"
              filas={tickets.data}
              claveFila={(t) => t.ticketCode}
              columnas={[
                { encabezado: 'Código', celda: (t) => <span className="font-mono text-xs font-semibold">{t.ticketCode}</span> },
                { encabezado: 'Titular', celda: (t) => t.userEmail ?? '—' },
                { encabezado: 'Tipo', celda: (t) => NOMBRE_TIPO_TICKET[t.type] },
                { encabezado: 'Precio', celda: (t) => <PrecioCOP valor={t.price} /> },
                { encabezado: 'Compra', celda: (t) => formatearFechaHora(t.purchaseDate) },
                { encabezado: 'Estado', celda: (t) => <BadgeEstadoTicket estado={t.status} /> },
              ]}
            />
          </>
        )}
      </div>
    </Pagina>
  )
}
