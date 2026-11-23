import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { useArtistasActivos } from '../api/consultas'
import { artistasApi } from '../api/endpoints'
import { Boton } from '../componentes/Boton'
import { TarjetaArtista } from '../componentes/Dominio'
import { AlertaEnLinea, EstadoError, EstadoVacio, RejillaEsqueletos } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { EncabezadoSeccion } from '../componentes/Tipografia'
import { mensajeDeError } from '../lib/errores'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

/** /artistas (PRD §9.6, FR-FE-ART-001/003). La búsqueda exacta usa GET /api/artists/by-stage-name. */
export default function ListaArtistas() {
  const artistas = useArtistasActivos()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = nombre.trim()
    if (!n) return
    setBuscando(true)
    setError(null)
    try {
      const a = await artistasApi.porNombre(n)
      void navigate(RUTAS.artista(a.id))
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? `No encontramos un artista llamado «${n}».` : mensajeDeError(err))
    } finally {
      setBuscando(false)
    }
  }

  return (
    <Pagina>
      <EncabezadoSeccion nivel={1} etiqueta="Line-up" titulo="Artistas" descripcion="Las voces y los proyectos que suenan en PulsePass." />

      <form onSubmit={buscar} role="search" className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Nombre artístico exacto</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 opacity-50" />
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Buscar por nombre artístico"
            className="h-12 w-full rounded-full border border-tinta/15 bg-white pr-5 pl-12 dark:border-white/15 dark:bg-[#1c1c28]"
          />
        </label>
        <Boton type="submit" variante="secundario" cargando={buscando}>Buscar</Boton>
      </form>
      {error && <div className="mt-4 max-w-xl"><AlertaEnLinea>{error}</AlertaEnLinea></div>}

      <div className="mt-10">
        {artistas.isPending ? (
          <RejillaEsqueletos cantidad={6} className="h-28" />
        ) : artistas.isError ? (
          <EstadoError error={artistas.error} onReintentar={() => void artistas.refetch()} />
        ) : artistas.data.length === 0 ? (
          <EstadoVacio mensaje="Aún no hay artistas activos." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artistas.data.map((a) => (
              <li key={a.id}><TarjetaArtista artista={a} /></li>
            ))}
          </ul>
        )}
      </div>
    </Pagina>
  )
}
