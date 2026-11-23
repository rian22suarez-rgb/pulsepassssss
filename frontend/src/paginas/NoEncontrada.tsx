import { BotonEnlace } from '../componentes/Boton'
import { Etiqueta } from '../componentes/Tipografia'
import { RUTAS } from '../lib/rutas'

interface Props { titulo?: string; mensaje?: string; codigo?: string }

/** 404 genérica y "no disponible" reutilizable (PRD §9.19). */
export default function NoEncontrada({ titulo = 'Página no encontrada', mensaje = 'La dirección que buscas no existe o cambió.', codigo = '404' }: Props) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-4 py-16 sm:px-5 sm:py-24">
      <p aria-hidden className="font-titulo text-[38vw] leading-[0.8] text-naranja-400 sm:text-[16rem]">{codigo}</p>
      <Etiqueta className="mt-6 opacity-60">Error {codigo}</Etiqueta>
      <h1 className="mt-2 text-5xl sm:text-6xl">{titulo}</h1>
      <p className="mt-4 max-w-lg text-lg opacity-75">{mensaje}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <BotonEnlace to={RUTAS.eventos}>Ver cartelera</BotonEnlace>
        <BotonEnlace to={RUTAS.inicio} variante="fantasma">Ir al inicio</BotonEnlace>
      </div>
    </section>
  )
}
