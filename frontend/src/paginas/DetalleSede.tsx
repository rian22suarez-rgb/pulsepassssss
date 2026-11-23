import { Link, useParams } from 'react-router'
import { useEventosPublicados, useSede } from '../api/consultas'
import { TarjetaEvento } from '../componentes/Dominio'
import { Cargando, EstadoError } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { Etiqueta } from '../componentes/Tipografia'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

/** /sedes/:code (FR-FE-VEN-002). Los eventos se cruzan en cliente por nombre de sede (no hay endpoint por sede). */
export default function DetalleSede() {
  const { code } = useParams()
  const sede = useSede(code)
  const eventos = useEventosPublicados()

  if (sede.isPending) return <Cargando etiqueta="Cargando sede" />
  if (sede.isError) {
    if (sede.error instanceof ApiError && sede.error.status === 404) return <NoEncontrada titulo="Sede no encontrada" />
    return <Pagina><EstadoError error={sede.error} onReintentar={() => void sede.refetch()} /></Pagina>
  }
  const s = sede.data
  const enSede = (eventos.data ?? []).filter((e) => e.venueName === s.name)

  return (
    <Pagina>
      <Link to={RUTAS.sedes} className="font-mono text-xs tracking-widest uppercase opacity-70 hover:opacity-100">← Sedes</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-tarjeta bg-bosque-700 p-8 text-white sm:p-10">
          <Etiqueta className="text-lima-400">{s.code}</Etiqueta>
          <h1 className="mt-3 text-6xl sm:text-7xl">{s.name}</h1>
          <p className="mt-4 text-lg text-white/80">{[s.address, s.city].filter(Boolean).join(' · ')}</p>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div className="rounded-tarjeta bg-lima-400 p-6 text-tinta">
            <dt><Etiqueta>Capacidad</Etiqueta></dt>
            <dd className="mt-2 font-titulo text-5xl">{s.capacity.toLocaleString('es-CO')}</dd>
          </div>
          <div className="rounded-tarjeta bg-rosa-300 p-6 text-tinta">
            <dt><Etiqueta>Ciudad</Etiqueta></dt>
            <dd className="mt-2 font-titulo text-4xl break-words uppercase">{s.city}</dd>
          </div>
          <div className="col-span-2 rounded-tarjeta bg-naranja-400 p-6 text-tinta">
            <dt><Etiqueta>Estado</Etiqueta></dt>
            <dd className="mt-2 font-titulo text-4xl uppercase">{s.active === false ? 'Inactiva' : 'Activa'}</dd>
          </div>
        </dl>
      </div>
      {enSede.length > 0 && (
        <section className="mt-14">
          <h2 className="text-4xl">Eventos en esta sede</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enSede.map((e) => <TarjetaEvento key={e.eventCode} evento={e} />)}
          </div>
        </section>
      )}
    </Pagina>
  )
}
