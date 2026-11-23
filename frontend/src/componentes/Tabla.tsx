import type { ReactNode } from 'react'

export interface Columna<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
  className?: string
}

interface Props<T> {
  columnas: Columna<T>[]
  filas: T[]
  claveFila: (fila: T) => string
  titulo: string
}

/** Tabla genérica tipada (guía React §10). En móvil hace scroll horizontal dentro de su contenedor. */
export function Tabla<T>({ columnas, filas, claveFila, titulo }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-tarjeta border border-tinta/10 bg-white dark:border-white/10 dark:bg-[#15151f]">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">{titulo}</caption>
        <thead>
          <tr className="border-b border-tinta/10 dark:border-white/10">
            {columnas.map((c) => (
              <th key={c.encabezado} scope="col" className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wider opacity-70">
                {c.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={claveFila(f)} className="border-b border-tinta/5 last:border-0 dark:border-white/5">
              {columnas.map((c) => (
                <td key={c.encabezado} className={c.className ?? 'px-5 py-3.5'}>
                  {c.celda(f)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
