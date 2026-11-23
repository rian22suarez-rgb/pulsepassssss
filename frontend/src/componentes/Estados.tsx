import clsx from 'clsx'
import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react'
import { mensajeDeError } from '../lib/errores'
import { Boton } from './Boton'

// FE-014: cada pantalla define cargando, vacío, error y éxito.

export function Cargando({ etiqueta = 'Cargando' }: { etiqueta?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 opacity-70">
      <LoaderCircle aria-hidden className="size-5 animate-spin" />
      <span className="font-mono text-xs uppercase tracking-widest">{etiqueta}…</span>
    </div>
  )
}

export function Esqueleto({ className }: { className?: string }) {
  return <div aria-hidden className={clsx('animate-pulse rounded-tarjeta bg-tinta/8 dark:bg-white/8', className)} />
}

export function RejillaEsqueletos({ cantidad = 3, className = 'h-72' }: { cantidad?: number; className?: string }) {
  return (
    <div role="status" aria-label="Cargando" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cantidad }, (_, i) => (
        <Esqueleto key={i} className={className} />
      ))}
    </div>
  )
}

export function EstadoVacio({ mensaje, accion }: { mensaje: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-tarjeta border border-dashed border-tinta/20 px-6 py-14 text-center dark:border-white/20">
      <Inbox aria-hidden className="size-8 opacity-50" />
      <p className="max-w-sm text-[15px] opacity-80">{mensaje}</p>
      {accion}
    </div>
  )
}

export function EstadoError({ error, mensaje, onReintentar }: { error?: unknown; mensaje?: string; onReintentar?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-tarjeta bg-coral-400/15 px-6 py-12 text-center">
      <AlertTriangle aria-hidden className="size-8 text-[#c2261f] dark:text-coral-400" />
      <p className="max-w-md text-[15px] font-medium">{mensaje ?? mensajeDeError(error)}</p>
      {onReintentar && (
        <Boton variante="secundario" tamano="sm" onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  )
}

/** Mensaje en línea para errores de mutaciones (aria-live para lectores de pantalla). */
export function AlertaEnLinea({ children, tono = 'error' }: { children: ReactNode; tono?: 'error' | 'exito' | 'info' }) {
  const estilos = {
    error: 'bg-coral-400/15 border-coral-400',
    exito: 'bg-lima-400/25 border-lima-500',
    info: 'bg-rosa-100 border-rosa-300 dark:bg-rosa-300/15',
  } as const
  return (
    <div role={tono === 'error' ? 'alert' : 'status'} className={clsx('rounded-2xl border-l-4 px-4 py-3 text-sm font-medium', estilos[tono])}>
      {children}
    </div>
  )
}
