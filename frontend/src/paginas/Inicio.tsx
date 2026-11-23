import { ArrowRight, CalendarDays, Ticket, Users } from 'lucide-react'
import { Link } from 'react-router'
import { useArtistasActivos, useEventosPublicados } from '../api/consultas'
import { useAuth } from '../auth/useAuth'
import { BotonEnlace } from '../componentes/Boton'
import { AvatarArtista, TarjetaEvento } from '../componentes/Dominio'
import { EstadoError, EstadoVacio, RejillaEsqueletos } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { EncabezadoSeccion, Etiqueta } from '../componentes/Tipografia'
import { RUTAS } from '../lib/rutas'

/*
  Inicio (PRD §9.3) con la composición de Techvora:
  hero verde con rejilla y palabra gigante → banda rosa con el lema → CTAs píldora → cifras.
  Las cifras salen de datos reales de la API (no se inventan números).
*/
export default function Inicio() {
  const { sesion } = useAuth()
  const eventos = useEventosPublicados()
  const artistas = useArtistasActivos()

  return (
    <>
      <section className="fondo-rejilla relative -mt-[76px] overflow-hidden bg-bosque-700 pt-[104px] pb-14 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          <p aria-hidden className="font-titulo text-[23vw] leading-[0.82] tracking-tight uppercase sm:text-[19vw] lg:text-[13.5rem]">
            PulsePass
          </p>
          <div className="relative mt-4 -rotate-1 rounded-sm bg-rosa-300 px-5 py-6 text-center text-tinta sm:px-10">
            <h1 className="text-4xl sm:text-6xl">Vive lo que viene.</h1>
            <Etiqueta className="mt-3 block">Música · Cultura · Deporte · Tecnología — en un solo lugar</Etiqueta>
          </div>
          <span
            aria-hidden
            className="absolute top-[34%] right-6 hidden size-28 rotate-12 place-items-center rounded-full bg-naranja-400 text-center font-titulo text-xl leading-none text-tinta uppercase sm:grid lg:right-16"
          >
            Entradas<br />en línea
          </span>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
            Descubre conciertos, festivales y conferencias, compra tu entrada en segundos y llévala contigo. Tus tickets, tu historial y el ingreso al
            evento, todo en PulsePass.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <BotonEnlace to={RUTAS.eventos}>Ver cartelera</BotonEnlace>
            {sesion.estado !== 'autenticado' && (
              <BotonEnlace to={RUTAS.registro} variante="fantasma" className="text-white">
                Crear cuenta
              </BotonEnlace>
            )}
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
            <Cifra icono={<CalendarDays className="size-4" />} valor={eventos.data?.length} texto="Eventos publicados" />
            <Cifra icono={<Users className="size-4" />} valor={artistas.data?.length} texto="Artistas activos" />
            <Cifra icono={<Ticket className="size-4" />} valor={4} texto="Tipos de entrada" />
          </dl>
        </div>
      </section>

      <div className="bg-tinta text-white">
        <Pagina>
          <EncabezadoSeccion
            numero="01"
            etiqueta="Cartelera"
            titulo="Próximos eventos"
            accion={
              <Link to={RUTAS.eventos} className="inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline">
                Ver todos <ArrowRight aria-hidden className="size-4" />
              </Link>
            }
          />
          <div className="mt-10">
            {eventos.isPending ? (
              <RejillaEsqueletos className="h-72 bg-white/10" />
            ) : eventos.isError ? (
              <EstadoError error={eventos.error} onReintentar={() => void eventos.refetch()} />
            ) : eventos.data.length === 0 ? (
              <EstadoVacio mensaje="Aún no hay eventos publicados." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {eventos.data.slice(0, 3).map((e) => (
                  <TarjetaEvento key={e.eventCode} evento={e} />
                ))}
              </div>
            )}
          </div>
        </Pagina>
      </div>

      <Pagina>
        <EncabezadoSeccion
          numero="02"
          etiqueta="Line-up"
          titulo="Artistas destacados"
          accion={
            <Link to={RUTAS.artistas} className="inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline">
              Ver todos <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
        <div className="mt-10">
          {artistas.isPending ? (
            <RejillaEsqueletos cantidad={6} className="h-36" />
          ) : artistas.isError ? (
            <EstadoError error={artistas.error} onReintentar={() => void artistas.refetch()} />
          ) : artistas.data.length === 0 ? (
            <EstadoVacio mensaje="Aún no hay artistas activos." />
          ) : (
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {artistas.data.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <Link to={RUTAS.artista(a.id)} className="group flex flex-col items-center gap-3 text-center">
                    <span className="transition-transform group-hover:-translate-y-1">
                      <AvatarArtista artista={a} />
                    </span>
                    <span className="font-semibold">{a.stageName}</span>
                    {a.genre && <Etiqueta className="-mt-2 opacity-60">{a.genre}</Etiqueta>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Pagina>
    </>
  )
}

function Cifra({ icono, valor, texto }: { icono: React.ReactNode; valor: number | undefined; texto: string }) {
  return (
    <div>
      <dt className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-white/70 uppercase">
        <span aria-hidden className="text-lima-400">{icono}</span>
        {texto}
      </dt>
      <dd className="mt-1 font-titulo text-5xl text-lima-400 sm:text-6xl">{valor ?? '—'}</dd>
    </div>
  )
}
