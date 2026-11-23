import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Search, X } from 'lucide-react'
import clsx from 'clsx'
import { useEventosDeArtista, useEventosPublicados } from '../api/consultas'
import { TarjetaEvento } from '../componentes/Dominio'
import { EstadoError, EstadoVacio, RejillaEsqueletos } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { EncabezadoSeccion } from '../componentes/Tipografia'
import { EventCategorySchema, type EventCategory } from '../lib/esquemas'
import { NOMBRE_CATEGORIA } from '../lib/formato'

/*
  Cartelera (PRD §9.4, FR-FE-EVT-001/002/004). Filtros en la URL (?q=&categoria=&artista=)
  para que sobrevivan a recargar y se puedan compartir. La API no pagina ni busca (§2.4):
  texto y categoría se filtran en el cliente; ?artista= sí usa el endpoint by-artist.
*/
export default function CatalogoEventos() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const artista = params.get('artista') ?? ''
  // FE-002: el parámetro de URL se valida con zod antes de usarlo.
  const categoriaParam = EventCategorySchema.safeParse(params.get('categoria'))
  const categoria: EventCategory | null = categoriaParam.success ? categoriaParam.data : null

  const publicados = useEventosPublicados()
  const deArtista = useEventosDeArtista(artista || undefined)
  const consulta = artista ? deArtista : publicados

  // El resumen de eventos del backend no trae categoría: los chips solo se muestran si algún evento la tiene.
  const hayCategorias = (consulta.data ?? []).some((e) => !!e.category)

  const filtrados = useMemo(() => {
    const texto = q.trim().toLowerCase()
    return (consulta.data ?? []).filter(
      (e) =>
        (!categoria || !hayCategorias || e.category === categoria) &&
        (!texto || e.name.toLowerCase().includes(texto) || (e.venueName ?? '').toLowerCase().includes(texto)),
    )
  }, [consulta.data, q, categoria, hayCategorias])

  const actualizar = (clave: string, valor: string | null) => {
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        if (valor) n.set(clave, valor)
        else n.delete(clave)
        return n
      },
      { replace: true },
    )
  }

  return (
    <Pagina>
      <EncabezadoSeccion
        nivel={1}
        etiqueta="Cartelera"
        titulo={artista ? `Eventos de ${artista}` : 'Todos los eventos'}
        descripcion="Encuentra tu próximo plan. Busca por nombre o sede."
      />

      <div role="search" className="mt-10 flex flex-col gap-4">
        <label className="relative block max-w-xl">
          <span className="sr-only">Buscar eventos</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 opacity-50" />
          <input
            type="search"
            value={q}
            onChange={(e) => actualizar('q', e.target.value)}
            placeholder="Buscar por nombre o sede"
            className="h-12 w-full rounded-full border border-tinta/15 bg-white pr-5 pl-12 text-[15px] dark:border-white/15 dark:bg-[#1c1c28]"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {hayCategorias && (
            <>
              <Chip activo={!categoria} onClick={() => actualizar('categoria', null)}>Todas</Chip>
              {EventCategorySchema.options.map((c) => (
                <Chip key={c} activo={categoria === c} onClick={() => actualizar('categoria', c)}>
                  {NOMBRE_CATEGORIA[c]}
                </Chip>
              ))}
            </>
          )}
          {artista && (
            <button type="button" onClick={() => actualizar('artista', null)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-rosa-300 px-4 text-sm font-semibold text-tinta">
              Artista: {artista} <X aria-hidden className="size-3.5" />
              <span className="sr-only">Quitar filtro de artista</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-10">
        {consulta.isPending ? (
          <RejillaEsqueletos cantidad={6} />
        ) : consulta.isError ? (
          <EstadoError error={consulta.error} onReintentar={() => void consulta.refetch()} />
        ) : filtrados.length === 0 ? (
          <EstadoVacio mensaje={consulta.data.length === 0 ? 'Aún no hay eventos publicados.' : 'Sin resultados para tu búsqueda.'} />
        ) : (
          <>
            <p className="mb-5 font-mono text-xs tracking-widest uppercase opacity-60" aria-live="polite">
              {filtrados.length} {filtrados.length === 1 ? 'evento' : 'eventos'}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((e) => (
                <TarjetaEvento key={e.eventCode} evento={e} />
              ))}
            </div>
          </>
        )}
      </div>
    </Pagina>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={clsx(
        'h-9 rounded-full border px-4 text-sm font-semibold transition-colors',
        activo ? 'border-tinta bg-tinta text-white dark:border-white dark:bg-white dark:text-tinta' : 'border-tinta/15 hover:border-tinta dark:border-white/20 dark:hover:border-white',
      )}
    >
      {children}
    </button>
  )
}
