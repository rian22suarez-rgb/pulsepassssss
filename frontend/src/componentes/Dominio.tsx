import clsx from 'clsx'
import { Link } from 'react-router'
import { ArrowUpRight, MapPin } from 'lucide-react'
import type { Artist, EventCategory, EventSummary } from '../lib/esquemas'
import { formatearFechaHora, NOMBRE_CATEGORIA, selloFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'
import { BadgeEstadoEvento } from './Badge'
import { Etiqueta } from './Tipografia'

/*
  Cada categoría toma un color de la paleta Techvora. El backend no entrega imágenes,
  así que la tarjeta usa color + tipografía grande en lugar de una foto genérica.
*/
export const COLOR_CATEGORIA: Record<EventCategory, string> = {
  MUSIC: 'bg-rosa-300',
  SPORTS: 'bg-naranja-400',
  TECHNOLOGY: 'bg-lima-400',
  EDUCATION: 'bg-[#a9b8ff]',
  CULTURE: 'bg-mostaza-400',
  ENTERTAINMENT: 'bg-coral-400',
}

// Si el resumen no trae categoría (EventSummaryResponse no la incluye), el color se elige
// de forma estable a partir del código del evento para que la cartelera siga siendo variada.
const COLORES_TARJETA = ['bg-rosa-300', 'bg-lima-400', 'bg-naranja-400', 'bg-mostaza-400', 'bg-[#a9b8ff]', 'bg-coral-400'] as const

export function colorEvento(evento: { eventCode: string; category?: EventCategory | null }): string {
  if (evento.category) return COLOR_CATEGORIA[evento.category]
  let h = 0
  for (const c of evento.eventCode) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COLORES_TARJETA[h % COLORES_TARJETA.length]!
}

/** Tarjeta de evento con forma de entrada (muescas laterales + línea perforada). */
export function TarjetaEvento({ evento }: { evento: EventSummary }) {
  const { dia, mes } = selloFecha(evento.eventDate)
  return (
    <article className="group relative">
      <Link
        to={RUTAS.evento(evento.eventCode)}
        className={clsx('forma-ticket flex h-full flex-col rounded-tarjeta text-tinta transition-transform duration-200 group-hover:-translate-y-1', colorEvento(evento))}
      >
        <div className="flex items-start justify-between gap-3 p-6 pb-5">
          <div>
            <Etiqueta>{evento.category ? NOMBRE_CATEGORIA[evento.category] : `Evento · ${evento.eventCode}`}</Etiqueta>
            <h3 className="mt-3 text-[2rem] leading-[0.95] break-words">{evento.name}</h3>
          </div>
          <div className="grid size-16 shrink-0 place-items-center rounded-full bg-tinta text-center text-white">
            <span className="font-titulo text-2xl leading-none">{dia}</span>
            <span className="-mt-3 font-mono text-[10px] tracking-widest">{mes}</span>
          </div>
        </div>
        <div aria-hidden className="mx-6 border-t-2 border-dashed border-tinta/25" />
        <div className="mt-auto flex items-end justify-between gap-3 p-6 pt-4">
          <div className="space-y-1.5 text-sm">
            <p className="font-medium">{formatearFechaHora(evento.eventDate)}</p>
            {evento.venueName && (
              <p className="flex items-center gap-1.5 opacity-80">
                <MapPin aria-hidden className="size-3.5" />
                {evento.venueName}
              </p>
            )}
            <div className="pt-1"><BadgeEstadoEvento estado={evento.status} /></div>
          </div>
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-tinta text-white transition-transform group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </Link>
    </article>
  )
}

const COLORES_AVATAR = ['bg-rosa-300', 'bg-lima-400', 'bg-naranja-400', 'bg-mostaza-400', 'bg-[#a9b8ff]', 'bg-coral-400'] as const

export function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

/** Avatar circular con iniciales (no hay fotos de artistas en la API). */
export function AvatarArtista({ artista, grande = false }: { artista: Artist; grande?: boolean }) {
  const color = COLORES_AVATAR[artista.id % COLORES_AVATAR.length]
  return (
    <span aria-hidden className={clsx('grid shrink-0 place-items-center rounded-full font-titulo text-tinta', color, grande ? 'size-32 text-5xl' : 'size-20 text-2xl')}>
      {iniciales(artista.stageName)}
    </span>
  )
}

export function TarjetaArtista({ artista }: { artista: Artist }) {
  return (
    <Link
      to={RUTAS.artista(artista.id)}
      className="group flex items-center gap-5 rounded-tarjeta border border-tinta/10 bg-white p-5 transition-colors hover:border-tinta dark:border-white/10 dark:bg-[#15151f] dark:hover:border-white"
    >
      <AvatarArtista artista={artista} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-2xl">{artista.stageName}</h3>
        <p className="mt-1 text-sm opacity-70">{[artista.genre, artista.country].filter(Boolean).join(' · ') || 'Artista'}</p>
      </div>
      <ArrowUpRight aria-hidden className="size-5 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}
