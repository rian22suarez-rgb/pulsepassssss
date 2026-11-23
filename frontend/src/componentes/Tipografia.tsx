import clsx from 'clsx'
import type { ReactNode } from 'react'

/** Etiqueta monoespaciada en mayúsculas (JetBrains Mono), el "micro-texto" de Techvora. */
export function Etiqueta({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={clsx('font-mono text-[11px] font-medium uppercase tracking-[0.14em]', className)}>{children}</span>
}

interface PropsEncabezado {
  numero?: string
  etiqueta?: string
  titulo: ReactNode
  descripcion?: ReactNode
  accion?: ReactNode
  nivel?: 1 | 2
  className?: string
}

/** Encabezado de sección "01 · EVENTOS" + título Anton, como las secciones numeradas de Techvora. */
export function EncabezadoSeccion({ numero, etiqueta, titulo, descripcion, accion, nivel = 2, className }: PropsEncabezado) {
  const H = nivel === 1 ? 'h1' : 'h2'
  return (
    <header className={clsx('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-3xl">
        {(numero || etiqueta) && (
          <Etiqueta className="mb-3 block opacity-70">
            {numero && <span>{numero} · </span>}
            {etiqueta}
          </Etiqueta>
        )}
        <H className={nivel === 1 ? 'text-5xl sm:text-6xl lg:text-7xl' : 'text-4xl sm:text-5xl'}>{titulo}</H>
        {descripcion && <p className="mt-4 max-w-2xl text-base leading-relaxed opacity-75">{descripcion}</p>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </header>
  )
}
