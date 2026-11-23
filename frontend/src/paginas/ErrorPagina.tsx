import { isRouteErrorResponse, useRouteError } from 'react-router'
import { BotonEnlace } from '../componentes/Boton'
import { Etiqueta } from '../componentes/Tipografia'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

/** errorElement del router (FR-FE-GEN-002): no muestra trazas internas. */
export default function ErrorPagina() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NoEncontrada />
  if (import.meta.env.DEV) console.error(error)
  return (
    <section className="mx-auto max-w-3xl px-5 py-24">
      <Etiqueta className="opacity-60">Algo salió mal</Etiqueta>
      <h1 className="mt-2 text-6xl">No pudimos cargar esta vista</h1>
      <p className="mt-4 text-lg opacity-75">Recarga la página o vuelve al inicio. Si el problema sigue, inténtalo más tarde.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={() => window.location.reload()} className="h-12 rounded-full bg-tinta px-6 font-semibold text-white">Recargar</button>
        <BotonEnlace to={RUTAS.inicio} variante="fantasma">Ir al inicio</BotonEnlace>
      </div>
    </section>
  )
}
