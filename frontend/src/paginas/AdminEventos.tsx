import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueries } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { claves } from '../api/consultas'
import { eventosApi } from '../api/endpoints'
import { BadgeEstadoEvento } from '../componentes/Badge'
import { Boton, BotonEnlace } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { EstadoVacio } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { Tabla } from '../componentes/Tabla'
import { EncabezadoSeccion, Etiqueta } from '../componentes/Tipografia'
import { leerEventosAdmin } from '../lib/almacen'
import type { Evento } from '../lib/esquemas'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

/*
  Administración de eventos (PRD §9.16). GAP-01: el backend no tiene GET /api/events (listar todos),
  así que se ofrece búsqueda por código y la lista de eventos creados/consultados en esta sesión.
  No se pide ningún cambio al backend.
*/
export default function AdminEventos() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const recientes = leerEventosAdmin()
  const consultas = useQueries({
    queries: recientes.map((c) => ({ queryKey: claves.evento(c), queryFn: () => eventosApi.porCodigo(c), retry: false })),
  })
  const eventos = consultas.flatMap((q) => (q.data ? [q.data] : []))

  return (
    <Pagina>
      <EncabezadoSeccion
        nivel={1}
        etiqueta="Admin"
        titulo="Administrar eventos"
        descripcion="Crea eventos, publícalos y arma su line-up."
        accion={<BotonEnlace to={RUTAS.adminCrearEvento} icono={<Plus aria-hidden className="size-4" />}>Nuevo evento</BotonEnlace>}
      />

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          if (codigo.trim()) void navigate(RUTAS.adminEvento(codigo.trim()))
        }}
        className="mt-10 flex max-w-xl flex-col gap-3 rounded-tarjeta bg-rosa-300 p-6 text-tinta sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Campo etiqueta="Buscar por código (incluye borradores)" placeholder="CMF-2026" className="font-mono" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        </div>
        <Boton type="submit" variante="secundario">Abrir</Boton>
      </form>

      <section className="mt-12" aria-labelledby="t-rec">
        <Etiqueta className="opacity-60">Esta sesión</Etiqueta>
        <h2 id="t-rec" className="mt-2 mb-6 text-4xl">Eventos recientes</h2>
        {eventos.length === 0 ? (
          <EstadoVacio mensaje="Aún no has creado ni consultado eventos en esta sesión. La API no expone un listado completo de eventos, así que aquí verás los que gestiones." />
        ) : (
          <Tabla<Evento>
            titulo="Eventos gestionados en esta sesión"
            filas={eventos}
            claveFila={(e) => e.eventCode}
            columnas={[
              { encabezado: 'Código', celda: (e) => <span className="font-mono text-xs font-semibold">{e.eventCode}</span> },
              { encabezado: 'Nombre', celda: (e) => <span className="font-semibold">{e.name}</span> },
              { encabezado: 'Fecha', celda: (e) => formatearFechaHora(e.eventDate) },
              { encabezado: 'Estado', celda: (e) => <BadgeEstadoEvento estado={e.status} /> },
              { encabezado: 'Acción', celda: (e) => <BotonEnlace to={RUTAS.adminEvento(e.eventCode)} variante="fantasma" tamano="sm">Gestionar</BotonEnlace> },
            ]}
          />
        )}
      </section>
    </Pagina>
  )
}
