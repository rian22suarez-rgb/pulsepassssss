import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import clsx from 'clsx'
import { useTicketsUsuario } from '../api/consultas'
import { useAuth } from '../auth/useAuth'
import { Boton, BotonEnlace } from '../componentes/Boton'
import { EstadoError, EstadoVacio, RejillaEsqueletos } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { ModalCancelar } from '../componentes/ModalCancelar'
import { TicketVisual } from '../componentes/TicketVisual'
import { EncabezadoSeccion } from '../componentes/Tipografia'
import { TicketStatusSchema, type Ticket, type TicketStatus } from '../lib/esquemas'
import { NOMBRE_ESTADO_TICKET } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

/** Mis tickets (PRD §9.11). GAP-03: se consulta por el email devuelto por /me, nunca por uno escrito a mano. */
export default function MisTickets() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : undefined
  const tickets = useTicketsUsuario(email)
  const [params, setParams] = useSearchParams()
  const filtro = TicketStatusSchema.safeParse(params.get('estado'))
  const estado: TicketStatus | null = filtro.success ? filtro.data : null
  const [aCancelar, setACancelar] = useState<Ticket | null>(null)

  const lista = useMemo(() => {
    const t = (tickets.data ?? []).filter((x) => !estado || x.status === estado)
    return [...t].sort((a, b) => (b.purchaseDate ?? '').localeCompare(a.purchaseDate ?? ''))
  }, [tickets.data, estado])

  return (
    <Pagina>
      <EncabezadoSeccion nivel={1} etiqueta="Tu billetera" titulo="Mis tickets" accion={<BotonEnlace to={RUTAS.eventos} tamano="sm">Comprar más</BotonEnlace>} />

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {[null, ...TicketStatusSchema.options].map((s) => (
          <button
            key={s ?? 'todos'}
            type="button"
            aria-pressed={estado === s}
            onClick={() => setParams(s ? { estado: s } : {}, { replace: true })}
            className={clsx(
              'h-9 rounded-full border px-4 text-sm font-semibold',
              estado === s ? 'border-tinta bg-tinta text-white dark:border-white dark:bg-white dark:text-tinta' : 'border-tinta/15 hover:border-tinta dark:border-white/20',
            )}
          >
            {s ? NOMBRE_ESTADO_TICKET[s] : 'Todos'}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tickets.isPending ? (
          <RejillaEsqueletos cantidad={2} className="h-44" />
        ) : tickets.isError ? (
          <EstadoError error={tickets.error} onReintentar={() => void tickets.refetch()} />
        ) : lista.length === 0 ? (
          <EstadoVacio
            mensaje={estado ? `No tienes entradas en estado «${NOMBRE_ESTADO_TICKET[estado].toLowerCase()}».` : 'Todavía no has comprado entradas.'}
            accion={!estado && <BotonEnlace to={RUTAS.eventos} tamano="sm">Ver cartelera</BotonEnlace>}
          />
        ) : (
          <ul className="flex flex-col gap-5">
            {lista.map((t) => (
              <li key={t.ticketCode}>
                <TicketVisual ticket={t} />
                <div className="mt-3 flex flex-wrap gap-2 px-1">
                  <BotonEnlace to={RUTAS.ticket(t.ticketCode)} variante="fantasma" tamano="sm">Ver detalle</BotonEnlace>
                  {t.eventCode && <Link to={RUTAS.evento(t.eventCode)} className="inline-flex h-9 items-center px-3 text-sm font-semibold underline-offset-4 hover:underline">Ver evento</Link>}
                  {/* FR-FE-TKT-005: cancelar visible solo si status = PAID; el backend tiene la última palabra. */}
                  {t.status === 'PAID' && (
                    <Boton variante="fantasma" tamano="sm" punto={false} className="text-[#c2261f] dark:text-coral-400" onClick={() => setACancelar(t)}>
                      Cancelar
                    </Boton>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ModalCancelar ticket={aCancelar} onCerrar={() => setACancelar(null)} />
    </Pagina>
  )
}
