import { Link } from 'react-router'
import { ArrowUpRight, MapPin, Users } from 'lucide-react'
import { useSedesActivas } from '../api/consultas'
import { EstadoError, EstadoVacio, RejillaEsqueletos } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { EncabezadoSeccion, Etiqueta } from '../componentes/Tipografia'
import { RUTAS } from '../lib/rutas'

const FONDOS = ['bg-mostaza-400', 'bg-rosa-300', 'bg-lima-400', 'bg-naranja-400'] as const

/** /sedes (FR-FE-VEN-001): tarjetas con número grande al estilo de los bloques de cifras de Techvora. */
export default function ListaSedes() {
  const sedes = useSedesActivas()
  return (
    <Pagina>
      <EncabezadoSeccion nivel={1} etiqueta="Lugares" titulo="Sedes" descripcion="Los escenarios donde pasan las cosas." />
      <div className="mt-10">
        {sedes.isPending ? (
          <RejillaEsqueletos cantidad={4} className="h-60" />
        ) : sedes.isError ? (
          <EstadoError error={sedes.error} onReintentar={() => void sedes.refetch()} />
        ) : sedes.data.length === 0 ? (
          <EstadoVacio mensaje="No hay sedes activas." />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sedes.data.map((s, i) => (
              <li key={s.code}>
                <Link to={RUTAS.sede(s.code)} className={`group flex h-full flex-col rounded-tarjeta p-6 text-tinta transition-transform hover:-translate-y-1 ${FONDOS[i % FONDOS.length]}`}>
                  <div className="flex items-start justify-between">
                    <Etiqueta>{s.code}</Etiqueta>
                    <ArrowUpRight aria-hidden className="size-5 transition-transform group-hover:rotate-45" />
                  </div>
                  <p className="mt-6 font-titulo text-6xl leading-none">{s.capacity.toLocaleString('es-CO')}</p>
                  <Etiqueta className="mt-1 flex items-center gap-1.5"><Users aria-hidden className="size-3" /> Capacidad</Etiqueta>
                  <h2 className="mt-6 text-3xl">{s.name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium opacity-80"><MapPin aria-hidden className="size-3.5" />{s.city}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Pagina>
  )
}
