import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { LoaderCircle } from 'lucide-react'

/*
  Botón píldora con "punto" a la derecha, como los CTA de Techvora ("Get Tickets ●").
  FE-008: variantes con Record<Variante,string> + clsx, nunca clases construidas dinámicamente.
*/
export type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma' | 'claro'
type Tamano = 'md' | 'sm'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-lima-400 text-tinta hover:bg-lima-300 border-transparent',
  secundario: 'bg-tinta text-white hover:bg-bosque-900 border-transparent dark:bg-white dark:text-tinta dark:hover:bg-rosa-100',
  peligro: 'bg-coral-400 text-tinta hover:bg-[#ff8a84] border-transparent',
  fantasma: 'bg-transparent text-current border-current/25 hover:border-current hover:bg-current/5',
  claro: 'bg-white text-tinta hover:bg-rosa-100 border-transparent',
}

const PUNTO: Record<Variante, string> = {
  primario: 'bg-tinta',
  secundario: 'bg-lima-400 dark:bg-tinta',
  peligro: 'bg-tinta',
  fantasma: 'bg-current',
  claro: 'bg-naranja-400',
}

const TAMANOS: Record<Tamano, string> = {
  md: 'h-12 px-6 text-sm gap-3',
  sm: 'h-9 px-4 text-[13px] gap-2',
}

const BASE =
  'inline-flex items-center justify-center rounded-full border font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 select-none'

interface PropsComunes {
  variante?: Variante
  tamano?: Tamano
  /** Muestra el punto decorativo de Techvora. */
  punto?: boolean
  icono?: ReactNode
}

interface PropsBoton extends ComponentProps<'button'>, PropsComunes {
  cargando?: boolean
}

function Contenido({ children, punto, variante, icono, cargando }: { children: ReactNode; punto: boolean; variante: Variante; icono?: ReactNode; cargando?: boolean }) {
  return (
    <>
      {cargando ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : icono}
      <span>{children}</span>
      {punto && !cargando && <span aria-hidden className={clsx('size-2 rounded-full', PUNTO[variante])} />}
    </>
  )
}

export function Boton({ variante = 'primario', tamano = 'md', punto = true, cargando = false, icono, className, children, disabled, type = 'button', ...resto }: PropsBoton) {
  return (
    <button
      type={type}
      className={clsx(BASE, VARIANTES[variante], TAMANOS[tamano], className)}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...resto}
    >
      <Contenido punto={punto} variante={variante} icono={icono} cargando={cargando}>{children}</Contenido>
    </button>
  )
}

interface PropsEnlace extends LinkProps, PropsComunes {}

export function BotonEnlace({ variante = 'primario', tamano = 'md', punto = true, icono, className, children, ...resto }: PropsEnlace) {
  return (
    <Link className={clsx(BASE, VARIANTES[variante], TAMANOS[tamano], className)} {...resto}>
      <Contenido punto={punto} variante={variante} icono={icono}>{children}</Contenido>
    </Link>
  )
}
