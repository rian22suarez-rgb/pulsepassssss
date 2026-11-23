import { useAuth } from '../auth/useAuth'
import { useUsuario } from '../api/consultas'
import { Badge } from '../componentes/Badge'
import { BotonEnlace } from '../componentes/Boton'
import { Cargando, EstadoError } from '../componentes/Estados'
import { Pagina } from '../componentes/Layout'
import { Etiqueta } from '../componentes/Tipografia'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

/** Mi cuenta (PRD §9.10): /me (identidad y roles) + GET /api/users/{username} (perfil). */
export default function Cuenta() {
  const { sesion, tieneRol } = useAuth()
  const yo = sesion.estado === 'autenticado' ? sesion.usuario : null
  const perfil = useUsuario(yo?.username)
  if (!yo) return <Cargando />

  const nombre = [perfil.data?.firstName, perfil.data?.lastName].filter(Boolean).join(' ') || yo.username

  return (
    <Pagina>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="fondo-rejilla rounded-tarjeta bg-bosque-700 p-8 text-white sm:p-10">
          <span className="grid size-20 place-items-center rounded-full bg-lima-400 font-titulo text-4xl text-tinta">{nombre[0]?.toUpperCase()}</span>
          <Etiqueta className="mt-8 block text-lima-400">Mi cuenta</Etiqueta>
          <h1 className="mt-2 text-5xl break-words sm:text-6xl">{nombre}</h1>
          <p className="mt-2 text-white/75">@{yo.username}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {yo.roles.map((r) => <Badge key={r} tono="rosa">{r}</Badge>)}
          </div>
        </div>
        <div className="rounded-tarjeta border border-tinta/10 bg-white p-8 dark:border-white/10 dark:bg-[#15151f]">
          <h2 className="text-3xl">Datos personales</h2>
          {perfil.isPending ? (
            <Cargando />
          ) : perfil.isError ? (
            <div className="mt-6"><EstadoError error={perfil.error} onReintentar={() => void perfil.refetch()} /></div>
          ) : (
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                ['Correo', perfil.data.email],
                ['Usuario', perfil.data.username],
                ['Nombre', perfil.data.firstName],
                ['Apellido', perfil.data.lastName],
                ['Fecha de nacimiento', perfil.data.birthDate ? formatearFecha(perfil.data.birthDate) : null],
                ['Ciudad', perfil.data.city],
                ['Teléfono', perfil.data.phone],
                ['Estado', perfil.data.active === false ? 'Inactiva' : 'Activa'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt><Etiqueta className="opacity-60">{k}</Etiqueta></dt>
                  <dd className="mt-1 font-semibold break-all">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {tieneRol('USER') && <BotonEnlace to={RUTAS.misTickets} tamano="sm">Mis tickets</BotonEnlace>}
            {tieneRol('STAFF', 'ADMIN') && <BotonEnlace to={RUTAS.staffValidacion} tamano="sm" variante="secundario">Validar ingreso</BotonEnlace>}
            {tieneRol('ADMIN') && <BotonEnlace to={RUTAS.adminEventos} tamano="sm" variante="fantasma">Administrar eventos</BotonEnlace>}
          </div>
        </div>
      </div>
    </Pagina>
  )
}
