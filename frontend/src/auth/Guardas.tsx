import { Navigate, Outlet, useLocation } from 'react-router'
import { Cargando } from '../componentes/Estados'
import { RUTAS } from '../lib/rutas'
import type { Rol } from '../lib/esquemas'
import { useAuth } from './useAuth'

/*
  Guardas de ruta (PRD §12.3). Son solo experiencia de usuario (FE-004):
  cada endpoint está protegido en Spring Security y un 403 del servidor siempre prevalece.
*/
export function RutaProtegida() {
  const { sesion } = useAuth()
  const location = useLocation()
  if (sesion.estado === 'cargando') return <Cargando etiqueta="Verificando tu sesión" />
  if (sesion.estado === 'anonimo')
    return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname, motivo: sesion.motivo }} />
  return <Outlet />
}

export function RutaPorRol({ roles }: { roles: Rol[] }) {
  const { sesion } = useAuth()
  const location = useLocation()
  if (sesion.estado === 'cargando') return <Cargando etiqueta="Verificando tu sesión" />
  if (sesion.estado === 'anonimo') return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname }} />
  if (!roles.some((r) => sesion.usuario.roles.includes(r))) return <Navigate to={RUTAS.sinPermisos} replace />
  return <Outlet />
}

/**
 * /login y /registro redirigen si ya hay sesión. Al iniciar sesión, esta misma guarda
 * devuelve a la persona a la ruta de origen (state.desde), así no hay dos navegaciones compitiendo.
 */
export function SoloAnonimo() {
  const { sesion } = useAuth()
  const location = useLocation()
  if (sesion.estado === 'cargando') return <Cargando etiqueta="Verificando tu sesión" />
  if (sesion.estado === 'autenticado') {
    const desde = destinoSeguro((location.state as { desde?: unknown } | null)?.desde)
    return <Navigate to={desde} replace />
  }
  return <Outlet />
}

/** Solo rutas internas: evita redirecciones abiertas a otros dominios. */
function destinoSeguro(desde: unknown): string {
  return typeof desde === 'string' && desde.startsWith('/') && !desde.startsWith('//') ? desde : RUTAS.inicio
}
