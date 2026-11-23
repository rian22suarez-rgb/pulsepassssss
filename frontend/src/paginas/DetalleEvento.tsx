import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import clsx from 'clsx'
import { CalendarDays, MapPin, ShieldAlert, Users } from 'lucide-react'
import { useComprarTicket, useEvento, useSedesActivas } from '../api/consultas'
import { useAuth } from '../auth/useAuth'
import { BadgeEstadoEvento } from '../componentes/Badge'
import { Boton, BotonEnlace } from '../componentes/Boton'
import { AvatarArtista, COLOR_CATEGORIA } from '../componentes/Dominio'
import { AlertaEnLinea, Cargando, EstadoError } from '../componentes/Estados'
import { Modal } from '../componentes/Modal'
import { Pagina } from '../componentes/Layout'
import { Tarjeta } from '../componentes/Tarjeta'
import { Etiqueta } from '../componentes/Tipografia'
import { mensajeDeError } from '../lib/errores'
import { TicketTypeSchema, type Evento, type TicketType } from '../lib/esquemas'
import { ApiError } from '../lib/http'
import { DESCRIPCION_TIPO_TICKET, formatearFechaHora, NOMBRE_CATEGORIA, NOMBRE_ESTADO_EVENTO, NOMBRE_TIPO_TICKET } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

/*
  Detalle y compra (PRD §9.5). Reglas que respeta:
  - El email de compra sale de la sesión, nunca de un campo editable (§24.3).
  - La UI no calcula precios (GAP-06): el precio se conoce en la confirmación (TicketResponse).
  - La edad mínima y la capacidad las decide el backend; su 409 se muestra tal cual en el modal.
*/
export default function DetalleEvento() {
  const { eventCode } = useParams()
  const evento = useEvento(eventCode)

  if (evento.isPending) return <Cargando etiqueta="Cargando evento" />
  if (evento.isError) {
    // GAP-02: borradores devuelven 404/403 al público → "Evento no disponible".
    if (evento.error instanceof ApiError && (evento.error.status === 404 || evento.error.status === 403))
      return <NoEncontrada titulo="Evento no disponible" mensaje="Este evento no existe o todavía no está publicado." />
    return (
      <Pagina>
        <EstadoError error={evento.error} onReintentar={() => void evento.refetch()} />
      </Pagina>
    )
  }
  return <VistaEvento evento={evento.data} />
}

function VistaEvento({ evento }: { evento: Evento }) {
  const sedes = useSedesActivas()
  const sede = sedes.data?.find((s) => s.code === evento.venueCode || s.name === evento.venueName)
  const artistas = evento.artists ?? []

  return (
    <>
      <section className={clsx('-mt-[76px] pt-[100px] pb-12 text-tinta', COLOR_CATEGORIA[evento.category])}>
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          <nav aria-label="Ruta de navegación" className="mb-6">
            <Link to={RUTAS.eventos} className="font-mono text-xs tracking-widest uppercase underline-offset-4 hover:underline">
              ← Cartelera
            </Link>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <Etiqueta className="rounded-full bg-tinta px-3 py-1.5 text-white">{NOMBRE_CATEGORIA[evento.category]}</Etiqueta>
            <BadgeEstadoEvento estado={evento.status} />
            {!!evento.minimumAge && <Etiqueta className="rounded-full border border-tinta/40 px-3 py-1">+{evento.minimumAge}</Etiqueta>}
          </div>
          <h1 className="mt-5 max-w-4xl text-5xl break-words sm:text-7xl lg:text-8xl">{evento.name}</h1>
          <ul className="mt-6 flex flex-col gap-2 text-[15px] font-medium sm:flex-row sm:gap-6">
            <li className="flex items-center gap-2"><CalendarDays aria-hidden className="size-4" />{formatearFechaHora(evento.eventDate)}</li>
            {evento.venueName && <li className="flex items-center gap-2"><MapPin aria-hidden className="size-4" />{evento.venueName}</li>}
          </ul>
        </div>
      </section>

      <Pagina className="grid gap-10 pb-28 lg:grid-cols-[1fr_22rem] lg:pb-14">
        <div className="space-y-12">
          <section aria-labelledby="t-desc">
            <Etiqueta className="opacity-60">01 · Sobre el evento</Etiqueta>
            <h2 id="t-desc" className="mt-2 text-4xl">Descripción</h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed whitespace-pre-line opacity-85">
              {evento.description || 'El organizador aún no ha publicado una descripción.'}
            </p>
          </section>

          <section aria-labelledby="t-art">
            <Etiqueta className="opacity-60">02 · Line-up</Etiqueta>
            <h2 id="t-art" className="mt-2 text-4xl">Artistas</h2>
            {artistas.length === 0 ? (
              <p className="mt-4 opacity-70">Line-up por anunciar.</p>
            ) : (
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {artistas.map((a) => (
                  <li key={a.id}>
                    <Link to={RUTAS.artista(a.id)} className="flex items-center gap-4 rounded-tarjeta border border-tinta/10 p-4 hover:border-tinta dark:border-white/10 dark:hover:border-white">
                      <AvatarArtista artista={a} />
                      <span>
                        <span className="block font-titulo text-2xl uppercase">{a.stageName}</span>
                        <span className="text-sm opacity-70">{a.genre}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="t-sede">
            <Etiqueta className="opacity-60">03 · Lugar</Etiqueta>
            <h2 id="t-sede" className="mt-2 text-4xl">Sede</h2>
            <Tarjeta className="mt-5 flex flex-col gap-3 bg-bosque-700! text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-titulo text-3xl uppercase">{evento.venueName ?? 'Sede por confirmar'}</p>
                {sede && <p className="mt-1 text-white/75">{[sede.address, sede.city].filter(Boolean).join(' · ')}</p>}
                {/* GAP-04: la API no informa entradas disponibles; se muestra la capacidad de la sede. */}
                {sede && <p className="mt-3 flex items-center gap-2 text-sm"><Users aria-hidden className="size-4 text-lima-400" />Capacidad: {sede.capacity.toLocaleString('es-CO')} personas</p>}
              </div>
              {evento.venueCode && <BotonEnlace to={RUTAS.sede(evento.venueCode)} variante="primario" tamano="sm">Ver sede</BotonEnlace>}
            </Tarjeta>
          </section>
        </div>

        <aside aria-label="Compra de entradas">
          <PanelCompra evento={evento} />
        </aside>
      </Pagina>
    </>
  )
}

function PanelCompra({ evento }: { evento: Evento }) {
  const { sesion, tieneRol } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<TicketType>('GENERAL')
  const [modal, setModal] = useState(false)
  const compra = useComprarTicket()

  const publicado = evento.status === 'PUBLISHED'

  const confirmar = () => {
    if (sesion.estado !== 'autenticado') return
    compra.mutate(
      { userEmail: sesion.usuario.email, eventCode: evento.eventCode, type: tipo },
      { onSuccess: (t) => void navigate(RUTAS.confirmacion(t.ticketCode)) },
    )
  }

  let contenido: React.ReactNode
  if (!publicado) {
    contenido = (
      <>
        <Boton disabled className="w-full" punto={false}>Compra no disponible</Boton>
        <p className="mt-3 text-sm opacity-75">Este evento está «{NOMBRE_ESTADO_EVENTO[evento.status].toLowerCase()}», por eso no admite compras.</p>
      </>
    )
  } else if (sesion.estado !== 'autenticado') {
    contenido = (
      <BotonEnlace to={RUTAS.login} state={{ desde: location.pathname }} className="w-full">
        Inicia sesión para comprar
      </BotonEnlace>
    )
  } else if (!tieneRol('USER')) {
    // PRD §12.4: STAFF/ADMIN no compran desde la UI.
    contenido = <AlertaEnLinea tono="info">Tu rol ({sesion.usuario.roles.join(', ')}) no compra entradas desde la aplicación.</AlertaEnLinea>
  } else {
    contenido = (
      <>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Tipo de entrada</legend>
          <div className="space-y-2">
            {TicketTypeSchema.options.map((t) => (
              <label
                key={t}
                className={clsx(
                  'flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3.5 transition-colors',
                  tipo === t ? 'border-tinta bg-lima-400/30 dark:border-lima-400' : 'border-tinta/10 hover:border-tinta/40 dark:border-white/10',
                )}
              >
                <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => setTipo(t)} className="mt-1 accent-[#17432D]" />
                <span>
                  <span className="block font-semibold">{NOMBRE_TIPO_TICKET[t]}</span>
                  <span className="text-sm opacity-70">{DESCRIPCION_TIPO_TICKET[t]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Boton className="mt-5 w-full" onClick={() => { compra.reset(); setModal(true) }}>
          Comprar entrada
        </Boton>
        <p className="mt-3 text-xs opacity-60">El precio final lo define PulsePass y lo verás en la confirmación.</p>
      </>
    )
  }

  return (
    <>
      <div className="lg:sticky lg:top-28">
        <Tarjeta className="forma-ticket bg-white">
          <Etiqueta className="opacity-60">Tu entrada</Etiqueta>
          <p className="mt-1 mb-5 font-titulo text-3xl uppercase">{evento.name}</p>
          {contenido}
        </Tarjeta>
      </div>

      {/* Barra fija inferior en móvil (PRD §9.5). */}
      {publicado && sesion.estado === 'autenticado' && tieneRol('USER') && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-tinta/10 bg-white/95 p-3 backdrop-blur lg:hidden dark:border-white/10 dark:bg-[#15151f]/95">
          <Boton className="w-full" onClick={() => { compra.reset(); setModal(true) }}>
            Comprar · {NOMBRE_TIPO_TICKET[tipo]}
          </Boton>
        </div>
      )}

      <Modal
        abierto={modal}
        titulo="Confirmar compra"
        onCerrar={() => setModal(false)}
        pie={
          <>
            <Boton variante="fantasma" punto={false} onClick={() => setModal(false)}>Volver</Boton>
            <Boton onClick={confirmar} cargando={compra.isPending}>Confirmar compra</Boton>
          </>
        }
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="opacity-60">Evento</dt><dd className="font-semibold">{evento.name}</dd>
          <dt className="opacity-60">Fecha</dt><dd>{formatearFechaHora(evento.eventDate)}</dd>
          <dt className="opacity-60">Tipo</dt><dd>{NOMBRE_TIPO_TICKET[tipo]}</dd>
          <dt className="opacity-60">A nombre de</dt><dd>{sesion.estado === 'autenticado' ? sesion.usuario.email : ''}</dd>
        </dl>
        {compra.isError && (
          <div className="mt-5">
            <AlertaEnLinea>
              <span className="flex items-start gap-2">
                <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                {mensajeDeError(compra.error)}
              </span>
            </AlertaEnLinea>
          </div>
        )}
      </Modal>
    </>
  )
}
