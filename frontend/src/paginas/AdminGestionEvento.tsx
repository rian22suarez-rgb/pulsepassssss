import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Megaphone, UserPlus } from 'lucide-react'
import { useArtistasActivos, useAsociarArtista, useEvento, usePublicarEvento } from '../api/consultas'
import { BadgeEstadoEvento } from '../componentes/Badge'
import { Boton, BotonEnlace } from '../componentes/Boton'
import { Selector } from '../componentes/Campo'
import { iniciales } from '../componentes/Dominio'
import { AlertaEnLinea, Cargando, EstadoError } from '../componentes/Estados'
import { useAviso } from '../componentes/Aviso'
import { Modal } from '../componentes/Modal'
import { Pagina } from '../componentes/Layout'
import { Tarjeta } from '../componentes/Tarjeta'
import { Etiqueta } from '../componentes/Tipografia'
import { recordarEventoAdmin } from '../lib/almacen'
import { mensajeDeError } from '../lib/errores'
import { ApiError } from '../lib/http'
import { formatearFechaHora, NOMBRE_CATEGORIA } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

/** Gestionar evento (PRD §9.18, FR-FE-ADM-003/004/005): publicar y asociar artistas. */
export default function AdminGestionEvento() {
  const { eventCode = '' } = useParams()
  const evento = useEvento(eventCode)
  const artistas = useArtistasActivos()
  const publicar = usePublicarEvento()
  const asociar = useAsociarArtista(eventCode)
  const avisar = useAviso()
  const [confirmarPublicar, setConfirmarPublicar] = useState(false)
  const [artistaId, setArtistaId] = useState('')

  useEffect(() => {
    if (evento.data) recordarEventoAdmin(evento.data.eventCode)
  }, [evento.data])

  if (evento.isPending) return <Cargando etiqueta="Cargando evento" />
  if (evento.isError) {
    if (evento.error instanceof ApiError && evento.error.status === 404) return <NoEncontrada titulo="Evento no encontrado" mensaje={`No existe un evento con el código «${eventCode}».`} />
    return <Pagina><EstadoError error={evento.error} onReintentar={() => void evento.refetch()} /></Pagina>
  }
  const e = evento.data
  const asociados = new Set((e.artists ?? []).map((a) => a.id))
  const disponibles = (artistas.data ?? []).filter((a) => !asociados.has(a.id))

  return (
    <Pagina>
      <Link to={RUTAS.adminEventos} className="font-mono text-xs tracking-widest uppercase opacity-70 hover:opacity-100">← Administrar eventos</Link>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Etiqueta className="rounded-full bg-tinta px-3 py-1.5 text-white dark:bg-white dark:text-tinta">{e.eventCode}</Etiqueta>
        <BadgeEstadoEvento estado={e.status} />
      </div>
      <h1 className="mt-4 text-5xl break-words sm:text-7xl">{e.name}</h1>
      <p className="mt-3 opacity-75">{NOMBRE_CATEGORIA[e.category]} · {formatearFechaHora(e.eventDate)} · {e.venueName ?? e.venueCode}{e.minimumAge ? ` · +${e.minimumAge}` : ''}</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Tarjeta className="bg-lima-400! text-tinta">
          <Megaphone aria-hidden className="size-7" />
          <h2 className="mt-4 text-4xl">Publicación</h2>
          <p className="mt-2 text-[15px]">
            {e.status === 'DRAFT' ? 'El evento es un borrador: solo lo ves tú. Al publicarlo aparecerá en la cartelera y se podrán comprar entradas.' : 'Este evento ya no es un borrador.'}
          </p>
          {publicar.isError && <div className="mt-4"><AlertaEnLinea>{mensajeDeError(publicar.error)}</AlertaEnLinea></div>}
          <div className="mt-6 flex flex-wrap gap-3">
            {e.status === 'DRAFT' && <Boton variante="secundario" onClick={() => { publicar.reset(); setConfirmarPublicar(true) }}>Publicar evento</Boton>}
            {e.status !== 'DRAFT' && <BotonEnlace to={RUTAS.evento(e.eventCode)} variante="secundario">Ver en cartelera</BotonEnlace>}
            <BotonEnlace to={RUTAS.staffTicketsEvento(e.eventCode)} variante="fantasma">Tickets pagados</BotonEnlace>
          </div>
        </Tarjeta>

        <Tarjeta>
          <UserPlus aria-hidden className="size-7" />
          <h2 className="mt-4 text-4xl">Line-up</h2>
          {(e.artists ?? []).length === 0 ? (
            <p className="mt-2 opacity-70">Sin artistas asociados.</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {e.artists!.map((a) => (
                <li key={a.id} className="flex items-center gap-2 rounded-full bg-rosa-100 py-1 pr-3 pl-1 text-tinta">
                  <span aria-hidden className="grid size-7 place-items-center rounded-full bg-tinta font-titulo text-xs text-white">{iniciales(a.stageName)}</span>
                  <span className="text-sm font-semibold">{a.stageName}</span>
                </li>
              ))}
            </ul>
          )}
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(ev) => {
              ev.preventDefault()
              const id = Number(artistaId)
              if (!id) return
              asociar.mutate(id, {
                onSuccess: () => {
                  avisar('exito', 'Artista asociado.')
                  setArtistaId('')
                },
              })
            }}
          >
            <div className="flex-1">
              <Selector etiqueta="Artista activo" value={artistaId} onChange={(ev) => setArtistaId(ev.target.value)} disabled={artistas.isPending}>
                <option value="">{artistas.isPending ? 'Cargando…' : 'Elige un artista'}</option>
                {disponibles.map((a) => <option key={a.id} value={a.id}>{a.stageName}</option>)}
              </Selector>
            </div>
            <Boton type="submit" disabled={!artistaId} cargando={asociar.isPending}>Asociar</Boton>
          </form>
          {asociar.isError && <div className="mt-4"><AlertaEnLinea>{mensajeDeError(asociar.error)}</AlertaEnLinea></div>}
        </Tarjeta>
      </div>

      <Modal
        abierto={confirmarPublicar}
        titulo="Publicar evento"
        onCerrar={() => setConfirmarPublicar(false)}
        pie={
          <>
            <Boton variante="fantasma" punto={false} onClick={() => setConfirmarPublicar(false)}>Cancelar</Boton>
            <Boton
              cargando={publicar.isPending}
              onClick={() =>
                publicar.mutate(e.eventCode, {
                  onSuccess: () => {
                    avisar('exito', 'Evento publicado.')
                    setConfirmarPublicar(false)
                  },
                })
              }
            >
              Publicar
            </Boton>
          </>
        }
      >
        <p><strong>{e.name}</strong> quedará visible en la cartelera pública y abierto a la venta.</p>
        {publicar.isError && <div className="mt-4"><AlertaEnLinea>{mensajeDeError(publicar.error)}</AlertaEnLinea></div>}
      </Modal>
    </Pagina>
  )
}
