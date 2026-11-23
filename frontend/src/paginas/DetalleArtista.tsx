import { Link, useParams } from 'react-router'
import { useArtista, useEventosDeArtista } from '../api/consultas'
import { BotonEnlace } from '../componentes/Boton'
import { AvatarArtista, TarjetaEvento } from '../componentes/Dominio'
import { Cargando, EstadoError, EstadoVacio, RejillaEsqueletos } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { Etiqueta } from '../componentes/Tipografia'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

/** /artistas/:id (FR-FE-ART-002): perfil + eventos vía GET /api/events/by-artist. */
export default function DetalleArtista() {
  const { id } = useParams()
  const idNum = Number(id)
  const valido = Number.isInteger(idNum) && idNum > 0
  const artista = useArtista(valido ? idNum : undefined)
  const eventos = useEventosDeArtista(artista.data?.stageName)

  if (!valido) return <NoEncontrada titulo="Artista no encontrado" />
  if (artista.isPending) return <Cargando etiqueta="Cargando artista" />
  if (artista.isError) {
    if (artista.error instanceof ApiError && artista.error.status === 404) return <NoEncontrada titulo="Artista no encontrado" />
    return <Pagina><EstadoError error={artista.error} onReintentar={() => void artista.refetch()} /></Pagina>
  }
  const a = artista.data

  return (
    <>
      <section className="fondo-rejilla -mt-[76px] bg-bosque-700 pt-[100px] pb-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-end sm:px-5">
          <AvatarArtista artista={a} grande />
          <div>
            <Link to={RUTAS.artistas} className="font-mono text-xs tracking-widest text-white/70 uppercase hover:text-lima-400">← Artistas</Link>
            <h1 className="mt-3 text-6xl break-words sm:text-8xl">{a.stageName}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {a.genre && <Etiqueta className="rounded-full bg-lima-400 px-3 py-1.5 text-tinta">{a.genre}</Etiqueta>}
              {a.country && <Etiqueta className="rounded-full border border-white/30 px-3 py-1.5">{a.country}</Etiqueta>}
            </div>
          </div>
        </div>
      </section>

      <Pagina>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Etiqueta className="opacity-60">En cartelera</Etiqueta>
            <h2 className="mt-2 text-5xl">Próximas fechas</h2>
          </div>
          <BotonEnlace to={`${RUTAS.eventos}?artista=${encodeURIComponent(a.stageName)}`} variante="fantasma" tamano="sm">Ver en cartelera</BotonEnlace>
        </div>
        <div className="mt-8">
          {eventos.isPending ? (
            <RejillaEsqueletos />
          ) : eventos.isError ? (
            <EstadoError error={eventos.error} onReintentar={() => void eventos.refetch()} />
          ) : eventos.data.length === 0 ? (
            <EstadoVacio mensaje={`${a.stageName} no tiene eventos publicados por ahora.`} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventos.data.map((e) => <TarjetaEvento key={e.eventCode} evento={e} />)}
            </div>
          )}
        </div>
      </Pagina>
    </>
  )
}
