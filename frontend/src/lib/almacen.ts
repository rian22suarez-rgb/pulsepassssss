import { z } from 'zod'

/*
  sessionStorage validado con zod (FE-002). Se usa sessionStorage y no localStorage (PRD §12.2):
  el token se pierde al cerrar la pestaña. Todo acceso va en try/catch porque el almacenamiento
  puede estar bloqueado (modo privado, políticas del navegador).
*/
const CLAVE_SESION = 'pp-sesion'
const CLAVE_EVENTOS_ADMIN = 'pp-eventos-admin'

const SesionGuardadaSchema = z.object({ token: z.string().min(1), expiraEn: z.number() })
export type SesionGuardada = z.infer<typeof SesionGuardadaSchema>

export function leerSesion(): SesionGuardada | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_SESION)
    if (!crudo) return null
    const r = SesionGuardadaSchema.safeParse(JSON.parse(crudo))
    if (!r.success || r.data.expiraEn <= Date.now()) {
      sessionStorage.removeItem(CLAVE_SESION)
      return null
    }
    return r.data
  } catch {
    return null
  }
}

export function guardarSesion(s: SesionGuardada) {
  try {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s))
  } catch {
    /* sin almacenamiento: la sesión vive solo en memoria */
  }
}

export function borrarSesion() {
  try {
    sessionStorage.removeItem(CLAVE_SESION)
    sessionStorage.removeItem(CLAVE_EVENTOS_ADMIN)
  } catch {
    /* ignorar */
  }
}

// GAP-01: no existe GET /api/events (todos). Se recuerdan en la sesión los códigos que el ADMIN creó o consultó.
const CodigosSchema = z.array(z.string()).max(50)

export function leerEventosAdmin(): string[] {
  try {
    const r = CodigosSchema.safeParse(JSON.parse(sessionStorage.getItem(CLAVE_EVENTOS_ADMIN) ?? '[]'))
    return r.success ? r.data : []
  } catch {
    return []
  }
}

export function recordarEventoAdmin(code: string) {
  try {
    const lista = [code, ...leerEventosAdmin().filter((c) => c !== code)].slice(0, 50)
    sessionStorage.setItem(CLAVE_EVENTOS_ADMIN, JSON.stringify(lista))
  } catch {
    /* ignorar */
  }
}
