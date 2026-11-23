import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/*
  Modal sobre <dialog> nativo: showModal() atrapa el foco, Esc cierra y el foco vuelve
  al elemento que lo abrió (PRD §9.1). No se reimplementa un focus-trap a mano.
*/
interface Props {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  pie?: ReactNode
}

export function Modal({ abierto, titulo, onCerrar, children, pie }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) d.showModal?.()
    if (!abierto && d.open) d.close?.()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault()
        onCerrar()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar()
      }}
      className="m-auto w-[min(92vw,32rem)] rounded-tarjeta bg-white p-0 text-tinta shadow-2xl backdrop:bg-tinta/60 backdrop:backdrop-blur-[2px] dark:bg-[#15151f] dark:text-white"
    >
      {abierto && (
        <div className="p-6 sm:p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id={idTitulo} className="text-3xl">
              {titulo}
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-tinta/5 hover:bg-tinta/10 dark:bg-white/10"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="text-[15px] leading-relaxed">{children}</div>
          {pie && <div className="mt-6 flex flex-wrap justify-end gap-3">{pie}</div>}
        </div>
      )}
    </dialog>
  )
}
