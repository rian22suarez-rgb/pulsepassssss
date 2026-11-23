import { useParams } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import { useTicket } from '../api/consultas'
import { BotonEnlace } from '../componentes/Boton'
import { Cargando, EstadoError } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { TicketVisual } from '../componentes/TicketVisual'
import { Etiqueta } from '../componentes/Tipografia'
import { RUTAS } from '../lib/rutas'

/** Confirmación (PRD §9.13). El precio mostrado viene del TicketResponse (GAP-06). */
export default function ConfirmacionCompra() {
  const { ticketCode } = useParams()
  const ticket = useTicket(ticketCode)

  if (ticket.isPending) return <Cargando etiqueta="Cargando tu entrada" />
  if (ticket.isError) return <Pagina><EstadoError error={ticket.error} onReintentar={() => void ticket.refetch()} /></Pagina>

  return (
    <Pagina className="max-w-3xl">
      <div className="mb-8 flex flex-col items-start gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-lima-400 text-tinta"><CheckCircle2 aria-hidden className="size-7" /></span>
        <Etiqueta className="opacity-60">Compra confirmada</Etiqueta>
        <h1 className="text-6xl sm:text-7xl">¡Nos vemos allá!</h1>
        <p className="text-lg opacity-75">Tu entrada quedó registrada. Preséntala con su código en el ingreso.</p>
      </div>
      <TicketVisual ticket={ticket.data} />
      <div className="mt-8 flex flex-wrap gap-3">
        <BotonEnlace to={RUTAS.misTickets}>Ver mis tickets</BotonEnlace>
        <BotonEnlace to={RUTAS.eventos} variante="fantasma">Seguir explorando</BotonEnlace>
      </div>
    </Pagina>
  )
}
