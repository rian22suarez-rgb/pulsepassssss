import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, ScanLine, XCircle } from 'lucide-react'
import { useMarcarUsado } from '../api/consultas'
import { ticketsApi } from '../api/endpoints'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { AlertaEnLinea } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { TicketVisual } from '../componentes/TicketVisual'
import { EncabezadoSeccion, Etiqueta } from '../componentes/Tipografia'
import { mensajeDeError } from '../lib/errores'
import type { Ticket } from '../lib/esquemas'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const EventoSchema = z.object({ evento: z.string().trim().min(1, 'Escribe el código del evento.') })
const BuscarSchema = z.object({ codigo: z.string().trim().min(1, 'Escribe el código del ticket.') })

/*
  Validación de ingreso STAFF/ADMIN (PRD §9.14, FR-FE-STF-001):
  1) GET /api/tickets/{code}  2) PATCH /api/tickets/{code}/use.
  Un segundo intento sobre el mismo ticket devuelve 409 y se muestra como "ya utilizado".
*/
export default function ValidacionIngreso() {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const usar = useMarcarUsado()
  const form = useForm<z.infer<typeof BuscarSchema>>({ resolver: zodResolver(BuscarSchema) })

  const buscar = async ({ codigo }: { codigo: string }) => {
    usar.reset()
    setTicket(null)
    setErrorBusqueda(null)
    try {
      setTicket(await ticketsApi.porCodigo(codigo))
    } catch (e) {
      setErrorBusqueda(e instanceof ApiError && e.status === 404 ? `No existe un ticket con el código «${codigo}».` : mensajeDeError(e))
    }
  }

  const registrar = () => ticket && usar.mutate(ticket.ticketCode, { onSuccess: (t) => setTicket(t) })
  const yaUsado = usar.error instanceof ApiError && usar.error.status === 409

  return (
    <Pagina>
      <EncabezadoSeccion nivel={1} etiqueta="Staff · Control de acceso" titulo="Validar ingreso" descripcion="Busca la entrada por su código y registra el ingreso. Cada entrada solo puede usarse una vez." />

      <div className="mt-10 grid gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="flex flex-col gap-6">
          <form onSubmit={form.handleSubmit(buscar)} noValidate className="flex flex-col gap-4 rounded-tarjeta bg-bosque-700 p-6 text-white">
            <ScanLine aria-hidden className="size-8 text-lima-400" />
            <Campo
              etiqueta="Código del ticket"
              autoComplete="off"
              autoFocus
              className="font-mono"
              error={form.formState.errors.codigo?.message}
              {...form.register('codigo')}
            />
            <Boton type="submit" cargando={form.formState.isSubmitting}>Buscar ticket</Boton>
          </form>

          <div className="rounded-tarjeta border border-tinta/10 p-6 dark:border-white/10">
            <Etiqueta className="opacity-60">Por evento</Etiqueta>
            <p className="mt-2 mb-4 text-sm opacity-80">Consulta la lista de tickets pagados de un evento.</p>
            <FormularioEvento />
          </div>
        </div>

        <div aria-live="polite">
          {errorBusqueda && <AlertaEnLinea>{errorBusqueda}</AlertaEnLinea>}
          {!ticket && !errorBusqueda && (
            <div className="grid h-full min-h-64 place-items-center rounded-tarjeta border-2 border-dashed border-tinta/15 p-8 text-center opacity-70 dark:border-white/15">
              <p>Aquí aparecerá la entrada que busques.</p>
            </div>
          )}
          {ticket && (
            <div className="flex flex-col gap-5">
              <TicketVisual ticket={ticket} />
              {usar.isSuccess && (
                <Resultado tono="exito" titulo="Ingreso registrado" texto="La entrada quedó marcada como usada." />
              )}
              {yaUsado && <Resultado tono="error" titulo="Ticket ya utilizado" texto={mensajeDeError(usar.error)} />}
              {!yaUsado && !usar.isSuccess && ticket.status === 'USED' && (
                <Resultado tono="error" titulo="Ticket ya utilizado" texto="Esta entrada ya registró su ingreso." />
              )}
              {!usar.isSuccess && ticket.status === 'CANCELLED' && (
                <Resultado tono="error" titulo="Ticket cancelado" texto="Esta entrada fue cancelada y no permite el ingreso." />
              )}
              {usar.isError && !yaUsado && <AlertaEnLinea>{mensajeDeError(usar.error)}</AlertaEnLinea>}
              {!usar.isSuccess && !yaUsado && ticket.status === 'PAID' && (
                <Boton onClick={registrar} cargando={usar.isPending} className="self-start">
                  Registrar ingreso
                </Boton>
              )}
            </div>
          )}
        </div>
      </div>
    </Pagina>
  )
}

function FormularioEvento() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<z.infer<typeof EventoSchema>>({ resolver: zodResolver(EventoSchema) })
  return (
    <form onSubmit={handleSubmit(({ evento }) => void navigate(RUTAS.staffTicketsEvento(evento)))} noValidate className="flex flex-col gap-3">
      <Campo etiqueta="Código del evento" placeholder="CMF-2026" className="font-mono" error={formState.errors.evento?.message} {...register('evento')} />
      <Boton type="submit" variante="secundario" tamano="sm">Ver tickets pagados</Boton>
    </form>
  )
}

function Resultado({ tono, titulo, texto }: { tono: 'exito' | 'error'; titulo: string; texto: string }) {
  const Icono = tono === 'exito' ? CheckCircle2 : XCircle
  return (
    <div role={tono === 'error' ? 'alert' : 'status'} className={tono === 'exito' ? 'flex items-center gap-4 rounded-tarjeta bg-lima-400 p-6 text-tinta' : 'flex items-center gap-4 rounded-tarjeta bg-coral-400 p-6 text-tinta'}>
      <Icono aria-hidden className="size-10 shrink-0" />
      <div>
        <p className="font-titulo text-3xl uppercase">{titulo}</p>
        <p className="text-sm font-medium">{texto}</p>
      </div>
    </div>
  )
}
