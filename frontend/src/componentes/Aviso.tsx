import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

/*
  Avisos (toast) para resultados de mutaciones (FR-FE-GEN-003). Región aria-live="polite"
  siempre montada para que los lectores de pantalla anuncien los mensajes.
*/
type TipoAviso = 'exito' | 'error' | 'info'
interface Aviso { id: number; tipo: TipoAviso; mensaje: string }

const AvisoCtx = createContext<((tipo: TipoAviso, mensaje: string) => void) | null>(null)

const ESTILO: Record<TipoAviso, string> = {
  exito: 'bg-lima-400 text-tinta',
  error: 'bg-coral-400 text-tinta',
  info: 'bg-tinta text-white',
}
const ICONO: Record<TipoAviso, typeof Info> = { exito: CheckCircle2, error: XCircle, info: Info }

export function AvisoProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])

  const quitar = useCallback((id: number) => setAvisos((a) => a.filter((x) => x.id !== id)), [])
  const avisar = useCallback(
    (tipo: TipoAviso, mensaje: string) => {
      const id = Date.now() + Math.random()
      setAvisos((a) => [...a.slice(-2), { id, tipo, mensaje }])
      window.setTimeout(() => quitar(id), 5000)
    },
    [quitar],
  )
  const valor = useMemo(() => avisar, [avisar])

  return (
    <AvisoCtx value={valor}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {avisos.map((a) => {
          const Icono = ICONO[a.tipo]
          return (
            <div key={a.id} className={clsx('pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-full py-2.5 pr-2.5 pl-5 text-sm font-semibold shadow-lg', ESTILO[a.tipo])}>
              <Icono aria-hidden className="size-4 shrink-0" />
              <span className="flex-1">{a.mensaje}</span>
              <button type="button" onClick={() => quitar(a.id)} aria-label="Cerrar aviso" className="grid size-7 place-items-center rounded-full hover:bg-black/10">
                <X aria-hidden className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </AvisoCtx>
  )
}

export function useAviso() {
  const ctx = use(AvisoCtx)
  if (!ctx) throw new Error('useAviso debe usarse dentro de <AvisoProvider>')
  return ctx
}
