import clsx from 'clsx'
import { useId, type ComponentProps, type ReactNode } from 'react'

/*
  Campos accesibles (FE-010): label visible asociado, aria-invalid y aria-describedby
  hacia el mensaje de error o de ayuda.
*/
const CONTROL =
  'block w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-tinta placeholder:text-tinta-suave/70 transition-colors dark:bg-[#1c1c28] dark:text-white dark:placeholder:text-white/40 ' +
  'border-tinta/15 hover:border-tinta/35 dark:border-white/15 dark:hover:border-white/35 ' +
  'aria-[invalid=true]:border-coral-400 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-coral-400/30'

interface Envoltura {
  etiqueta: string
  /** Clases del contenedor (p. ej. sm:col-span-2); className va al control. */
  contenedor?: string
  error?: string
  ayuda?: ReactNode
}

function Marco({ id, etiqueta, error, ayuda, contenedor, children }: Envoltura & { id: string; children: ReactNode }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', contenedor)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-[#c2261f] dark:text-coral-400">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="text-sm text-tinta-suave dark:text-white/60">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}

function describedBy(id: string, error?: string, ayuda?: ReactNode) {
  return error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined
}

export function Campo({ etiqueta, error, ayuda, contenedor, className, id: idProp, ...resto }: Envoltura & ComponentProps<'input'>) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Marco id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} contenedor={contenedor}>
      <input id={id} aria-invalid={!!error} aria-describedby={describedBy(id, error, ayuda)} className={clsx(CONTROL, className)} {...resto} />
    </Marco>
  )
}

export function Selector({ etiqueta, error, ayuda, contenedor, className, id: idProp, children, ...resto }: Envoltura & ComponentProps<'select'>) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Marco id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} contenedor={contenedor}>
      <select id={id} aria-invalid={!!error} aria-describedby={describedBy(id, error, ayuda)} className={clsx(CONTROL, 'appearance-auto', className)} {...resto}>
        {children}
      </select>
    </Marco>
  )
}

export function AreaTexto({ etiqueta, error, ayuda, contenedor, className, id: idProp, ...resto }: Envoltura & ComponentProps<'textarea'>) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Marco id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} contenedor={contenedor}>
      <textarea id={id} aria-invalid={!!error} aria-describedby={describedBy(id, error, ayuda)} className={clsx(CONTROL, 'min-h-28', className)} {...resto} />
    </Marco>
  )
}
