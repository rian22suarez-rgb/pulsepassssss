import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/endpoints'
import { borrarSesion, guardarSesion, leerSesion } from '../lib/almacen'
import { configurarHttp } from '../lib/http'
import type { Rol, UsuarioAutenticado } from '../lib/esquemas'

// FE-006: la sesión es una unión discriminada, no varios booleanos (PRD §12.1).
export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo'; motivo?: 'expirada' }
  | { estado: 'autenticado'; token: string; expiraEn: number; usuario: UsuarioAutenticado }

export interface ValorAuth {
  sesion: Sesion
  iniciarSesion: (identifier: string, password: string) => Promise<UsuarioAutenticado>
  cerrarSesion: () => void
  tieneRol: (...roles: Rol[]) => boolean
}

export const AuthContext = createContext<ValorAuth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // La sesión guardada se lee una sola vez al montar (no en cada render).
  const [inicial] = useState(leerSesion)
  const [sesion, setSesion] = useState<Sesion>(() => (inicial ? { estado: 'cargando' } : { estado: 'anonimo' }))
  // El token también vive en memoria (ref) para que http.ts lo lea sin re-render.
  const tokenRef = useRef<string | null>(inicial?.token ?? null)

  const cerrarLocal = useCallback(
    (motivo?: 'expirada') => {
      tokenRef.current = null
      borrarSesion()
      queryClient.clear()
      setSesion(motivo ? { estado: 'anonimo', motivo } : { estado: 'anonimo' })
    },
    [queryClient],
  )

  // Conecta el cliente HTTP con la sesión: Bearer + cierre ante 401 (GAP-08).
  useEffect(() => {
    configurarHttp({ obtenerToken: () => tokenRef.current, alNoAutorizado: () => cerrarLocal('expirada') })
  }, [cerrarLocal])

  // Restaurar sesión al recargar (FR-FE-AUTH-004): el token guardado se valida contra /me.
  useEffect(() => {
    const guardada = leerSesion()
    if (!guardada) return
    const ctrl = new AbortController()
    authApi
      .me(ctrl.signal)
      .then((usuario) => setSesion({ estado: 'autenticado', token: guardada.token, expiraEn: guardada.expiraEn, usuario }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        cerrarLocal()
      })
    return () => ctrl.abort()
  }, [cerrarLocal])

  // Cierre local programado al vencer el token (sin refresh token en el backend).
  useEffect(() => {
    if (sesion.estado !== 'autenticado') return
    const restante = sesion.expiraEn - Date.now()
    const id = window.setTimeout(() => cerrarLocal('expirada'), Math.max(restante, 0))
    return () => window.clearTimeout(id)
  }, [sesion, cerrarLocal])

  const iniciarSesion = useCallback(async (identifier: string, password: string) => {
    const { token, expiresIn } = await authApi.login({ identifier, password })
    tokenRef.current = token
    const expiraEn = Date.now() + expiresIn * 1000
    try {
      const usuario = await authApi.me()
      guardarSesion({ token, expiraEn })
      setSesion({ estado: 'autenticado', token, expiraEn, usuario })
      return usuario
    } catch (e) {
      tokenRef.current = null
      throw e
    }
  }, [])

  const cerrarSesion = useCallback(() => cerrarLocal(), [cerrarLocal])

  const tieneRol = useCallback(
    (...roles: Rol[]) => sesion.estado === 'autenticado' && roles.some((r) => sesion.usuario.roles.includes(r)),
    [sesion],
  )

  const valor = useMemo(() => ({ sesion, iniciarSesion, cerrarSesion, tieneRol }), [sesion, iniciarSesion, cerrarSesion, tieneRol])
  return <AuthContext value={valor}>{children}</AuthContext>
}
